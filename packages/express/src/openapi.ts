import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import { AnyRouteContract } from "@ahmed109/apibridge-contracts";

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenApiServer {
  url: string;
  description?: string;
}

export interface OpenApiOptions {
  info: OpenApiInfo;
  servers?: OpenApiServer[];
}

export interface OpenApiParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
}

export interface OpenApiDocument {
  openapi: string;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
}

/**
 * Recursively converts a Zod schema into an OpenAPI 3.0 schema object.
 */
export function zodToOpenApiSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = schema._def;
  const typeName = def.typeName;

  switch (typeName) {
    case "ZodString": {
      const result: Record<string, unknown> = { type: "string" };
      for (const check of def.checks || []) {
        if (check.kind === "email") result.format = "email";
        else if (check.kind === "url") result.format = "uri";
        else if (check.kind === "uuid") result.format = "uuid";
        else if (check.kind === "datetime") result.format = "date-time";
        else if (check.kind === "min") result.minLength = check.value;
        else if (check.kind === "max") result.maxLength = check.value;
        else if (check.kind === "regex") result.pattern = check.regex.source;
      }
      return result;
    }

    case "ZodNumber": {
      const result: Record<string, unknown> = { type: "number" };
      for (const check of def.checks || []) {
        if (check.kind === "int") result.type = "integer";
        else if (check.kind === "min") result.minimum = check.value;
        else if (check.kind === "max") result.maximum = check.value;
      }
      return result;
    }

    case "ZodBoolean":
      return { type: "boolean" };

    case "ZodEnum":
      return {
        type: "string",
        enum: def.values,
      };

    case "ZodLiteral":
      return {
        type: typeof def.value,
        enum: [def.value],
      };

    case "ZodArray":
      return {
        type: "array",
        items: zodToOpenApiSchema(def.type),
      };

    case "ZodObject": {
      const shape = def.shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const fieldSchema = value as z.ZodTypeAny;
        properties[key] = zodToOpenApiSchema(fieldSchema);

        const fieldDef = fieldSchema._def;
        const isOptional =
          fieldDef.typeName === "ZodOptional" ||
          fieldDef.typeName === "ZodDefault" ||
          (fieldDef.innerType && fieldDef.innerType._def?.typeName === "ZodOptional");

        if (!isOptional) {
          required.push(key);
        }
      }

      const res: Record<string, unknown> = {
        type: "object",
        properties,
      };
      if (required.length > 0) {
        res.required = required;
      }
      return res;
    }

    case "ZodOptional":
      return zodToOpenApiSchema(def.innerType);

    case "ZodNullable":
      return {
        ...zodToOpenApiSchema(def.innerType),
        nullable: true,
      };

    case "ZodDefault": {
      const inner = zodToOpenApiSchema(def.innerType);
      try {
        inner.default = def.defaultValue();
      } catch {
        // ignore if default value accessor fails
      }
      return inner;
    }

    case "ZodUnion":
      return {
        oneOf: def.options.map((opt: z.ZodTypeAny) => zodToOpenApiSchema(opt)),
      };

    case "ZodEffects":
      return zodToOpenApiSchema(def.schema);

    case "ZodUnknown":
    case "ZodAny":
      return {};

    default:
      return { type: "object" };
  }
}

/**
 * Converts a list or nested map of RouteContracts into an OpenAPI 3.0 document.
 */
export function generateOpenApiDocument(
  contracts: Array<AnyRouteContract> | Record<string, unknown>,
  options: OpenApiOptions,
): OpenApiDocument {
  const flatContracts: Array<AnyRouteContract> = [];

  function collectContracts(val: unknown) {
    if (!val || typeof val !== "object") return;
    if ("method" in val && "path" in val && "responses" in val) {
      flatContracts.push(val as AnyRouteContract);
      return;
    }
    for (const nested of Object.values(val)) {
      collectContracts(nested);
    }
  }

  if (Array.isArray(contracts)) {
    flatContracts.push(...contracts);
  } else {
    collectContracts(contracts);
  }

  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of flatContracts) {
    // Convert Express style :param to OpenAPI style {param}
    const openApiPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const method = route.method.toLowerCase();
    const parameters: OpenApiParameter[] = [];

    // Path parameters
    if (route.params && route.params._def?.shape) {
      const shape = route.params._def.shape();
      for (const [key, val] of Object.entries(shape)) {
        parameters.push({
          name: key,
          in: "path",
          required: true,
          schema: zodToOpenApiSchema(val as z.ZodTypeAny),
        });
      }
    }

    // Query parameters
    if (route.query && route.query._def?.shape) {
      const shape = route.query._def.shape();
      for (const [key, val] of Object.entries(shape)) {
        const valDef = (val as z.ZodTypeAny)._def;
        const isOptional = valDef.typeName === "ZodOptional" || valDef.typeName === "ZodDefault";
        parameters.push({
          name: key,
          in: "query",
          required: !isOptional,
          schema: zodToOpenApiSchema(val as z.ZodTypeAny),
        });
      }
    }

    // Operation object
    const operation: Record<string, unknown> = {
      summary: route.summary || `${method.toUpperCase()} ${openApiPath}`,
      description: route.description,
      tags: route.tags || ["Default"],
      responses: {},
    };

    if (parameters.length > 0) {
      operation.parameters = parameters;
    }

    // Request body
    if (route.body) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: zodToOpenApiSchema(route.body),
          },
        },
      };
    }

    // Responses
    const responsesObj: Record<string, unknown> = {};
    for (const [status, schema] of Object.entries(route.responses)) {
      responsesObj[status] = {
        description: `HTTP ${status} response`,
        content: {
          "application/json": {
            schema: zodToOpenApiSchema(schema as z.ZodTypeAny),
          },
        },
      };
    }
    operation.responses = responsesObj;

    paths[openApiPath][method] = operation;
  }

  return {
    openapi: "3.0.3",
    info: options.info,
    servers: options.servers || [{ url: "/" }],
    paths,
  };
}

/**
 * Mounts Swagger UI and OpenAPI JSON document on an Express application.
 */
export function setupSwaggerDocs(app: Express, path: string, spec: OpenApiDocument): void {
  app.get(`${path}.json`, (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(spec);
  });

  app.use(path, swaggerUi.serve, swaggerUi.setup(spec));
}
