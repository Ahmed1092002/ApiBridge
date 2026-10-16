import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodIssue } from "zod";
import {
  AnyRouteContract,
  InferRouteParams,
  InferRouteQuery,
  InferRouteBody,
} from "@apibridge/contracts";
import { InternalServerError } from "./errors";

export interface RouteOptions {
  validateResponse?: boolean;
}

export interface ApiBridgeHandlerContext<TContract extends AnyRouteContract> {
  params: InferRouteParams<TContract>;
  query: InferRouteQuery<TContract>;
  body: InferRouteBody<TContract>;
  req: Request;
  res: Response;
}

export interface RouteResponseResult<TBody = unknown> {
  status: number;
  body: TBody;
}

export type ApiBridgeHandler<
  TContract extends AnyRouteContract,
  TResult extends RouteResponseResult = RouteResponseResult,
> = (ctx: ApiBridgeHandlerContext<TContract>) => Promise<TResult | void> | TResult | void;

export class ApiBridge {
  private readonly defaultOptions: RouteOptions;

  constructor(options: RouteOptions = {}) {
    this.defaultOptions = {
      validateResponse: options.validateResponse ?? process.env.NODE_ENV !== "production",
    };
  }

  /**
   * Creates an Express RequestHandler wrapped with contract validation for params, query, body, and response.
   */
  route<TContract extends AnyRouteContract>(
    contract: TContract,
    handler: ApiBridgeHandler<TContract>,
    routeOptions?: RouteOptions,
  ): RequestHandler {
    const validateResponse = routeOptions?.validateResponse ?? this.defaultOptions.validateResponse;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // 1. Validate route params
        let validatedParams: unknown = req.params;
        if (contract.params) {
          const parsed = contract.params.safeParse(req.params);
          if (!parsed.success) {
            res.status(400).json({
              statusCode: 400,
              error: "VALIDATION_ERROR",
              message: "Invalid route parameters",
              issues: parsed.error.errors.map((e: ZodIssue) => ({
                path: ["params", ...e.path],
                message: e.message,
                code: e.code,
              })),
            });
            return;
          }
          validatedParams = parsed.data;
        }

        // 2. Validate query params
        let validatedQuery: unknown = req.query;
        if (contract.query) {
          const parsed = contract.query.safeParse(req.query);
          if (!parsed.success) {
            res.status(400).json({
              statusCode: 400,
              error: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              issues: parsed.error.errors.map((e: ZodIssue) => ({
                path: ["query", ...e.path],
                message: e.message,
                code: e.code,
              })),
            });
            return;
          }
          validatedQuery = parsed.data;
        }

        // 3. Validate request body
        let validatedBody: unknown = req.body;
        if (contract.body) {
          const parsed = contract.body.safeParse(req.body);
          if (!parsed.success) {
            res.status(400).json({
              statusCode: 400,
              error: "VALIDATION_ERROR",
              message: "Invalid request body",
              issues: parsed.error.errors.map((e: ZodIssue) => ({
                path: ["body", ...e.path],
                message: e.message,
                code: e.code,
              })),
            });
            return;
          }
          validatedBody = parsed.data;
        }

        // 4. Execute handler
        const result = await handler({
          params: validatedParams as InferRouteParams<TContract>,
          query: validatedQuery as InferRouteQuery<TContract>,
          body: validatedBody as InferRouteBody<TContract>,
          req,
          res,
        });

        // If headers already sent (e.g. streaming or custom res handling), finish
        if (res.headersSent) {
          return;
        }

        // 5. If handler returned a response result, validate and send
        if (result && typeof result === "object" && "status" in result) {
          const { status, body } = result as RouteResponseResult;

          if (validateResponse && contract.responses) {
            const schema = contract.responses[status];
            if (schema) {
              const resValidation = schema.safeParse(body);
              if (!resValidation.success) {
                throw new InternalServerError(
                  `Response schema validation failed for status ${status}: ${resValidation.error.message}`,
                );
              }
            }
          }

          res.status(status).json(body);
          return;
        }
      } catch (error) {
        next(error);
      }
    };
  }
}

export const apiBridge = new ApiBridge();
