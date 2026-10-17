# @ahmed109/apibridge-express

[![npm version](https://img.shields.io/npm/v/@ahmed109/apibridge-express.svg?style=flat-square)](https://www.npmjs.com/package/@ahmed109/apibridge-express)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-6BA539?style=flat-square&logo=openapi-initiative&logoColor=white)](https://swagger.io/)

> **Express adapter and automated OpenAPI/Swagger generator for ApiBridge contracts.**  
> Turn shared Zod contracts into robust Express route handlers with runtime validation and interactive documentation.

---

## Overview

`@ahmed109/apibridge-express` connects your backend Express controllers directly to [`@ahmed109/apibridge-contracts`](https://www.npmjs.com/package/@ahmed109/apibridge-contracts).

### Key Features:

- **Contract-Driven Route Wrapper**: `apiBridge.route(contract, handler)` automatically validates `req.params`, `req.query`, and `req.body` before your handler runs.
- **Strictly Typed Context**: Handlers receive `({ params, query, body, req, res })` strictly typed from the contract without manual typing.
- **Consistent Error Envelopes**: Malformed queries or bodies instantly return standardized `400 VALIDATION_ERROR` payloads with structured issues.
- **Response Validation in Development**: Catches response payload schema violations during local development before they reach production clients.
- **OpenAPI 3.0 & Swagger UI**: Generates OpenAPI specifications directly from contract Zod schemas and serves interactive Swagger documentation at `/docs`.

---

## Installation

```bash
# npm
npm install @ahmed109/apibridge-express @ahmed109/apibridge-contracts express zod swagger-ui-express

# pnpm
pnpm add @ahmed109/apibridge-express @ahmed109/apibridge-contracts express zod swagger-ui-express

# yarn
yarn add @ahmed109/apibridge-express @ahmed109/apibridge-contracts express zod swagger-ui-express

# bun
bun add @ahmed109/apibridge-express @ahmed109/apibridge-contracts express zod swagger-ui-express
```

---

## Complete Express Example

```typescript
import express, { Express } from "express";
import {
  apiBridge,
  errorHandler,
  generateOpenApiDocument,
  setupSwaggerDocs,
  NotFoundError,
  UnauthorizedError,
} from "@ahmed109/apibridge-express";
import { taskContracts } from "./contracts"; // from @ahmed109/apibridge-contracts

const app: Express = express();
app.use(express.json());

// In-memory data store
const tasks = [
  {
    id: "task-1",
    title: "Implement ApiBridge",
    status: "done" as const,
    priority: "high" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 1. GET /api/tasks (query validated against contract)
app.get(
  taskContracts.list.path,
  apiBridge.route(taskContracts.list, async ({ query }) => {
    // query is strictly typed: { page: number; limit: number; status?: ...; }
    let filtered = [...tasks];
    if (query.status) {
      filtered = filtered.filter((t) => t.status === query.status);
    }

    return {
      status: 200,
      body: {
        items: filtered,
        total: filtered.length,
        page: query.page,
        limit: query.limit,
        totalPages: 1,
      },
    };
  }),
);

// 2. GET /api/tasks/:id (params validated against contract)
app.get(
  taskContracts.get.path,
  apiBridge.route(taskContracts.get, async ({ params }) => {
    const task = tasks.find((t) => t.id === params.id);
    if (!task) {
      throw new NotFoundError(`Task with id '${params.id}' not found`, "Task");
    }

    return {
      status: 200,
      body: task,
    };
  }),
);

// 3. POST /api/tasks (body validated against contract)
app.post(
  taskContracts.create.path,
  apiBridge.route(taskContracts.create, async ({ body, req }) => {
    // Check authentication header
    const userId = req.headers["x-demo-user-id"];
    if (!userId) {
      throw new UnauthorizedError("Authentication required to create tasks");
    }

    // body is strictly typed: { title: string; priority: "low"|"medium"|"high"; ... }
    const newTask = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description ?? "",
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      assigneeId: body.assigneeId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return {
      status: 201,
      body: newTask,
    };
  }),
);

// 4. Generate OpenAPI 3.0 Documentation & Mount Swagger UI
const openApiSpec = generateOpenApiDocument(
  [taskContracts.list, taskContracts.get, taskContracts.create],
  {
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description: "Contract-driven REST API powered by ApiBridge.",
    },
  },
);
setupSwaggerDocs(app, "/docs", openApiSpec);

// 5. Centralized Error Handling Middleware
app.use(errorHandler());

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
  console.log("Interactive Swagger Docs on http://localhost:4000/docs");
});
```

---

## Error Handling & HTTP Error Classes

`@ahmed109/apibridge-express` provides standard HTTP error classes that integrate directly with the centralized `errorHandler()`:

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from "@ahmed109/apibridge-express";

// Throw anywhere inside route handlers or middlewares:
throw new BadRequestError("Custom validation message", [{ path: ["field"], message: "Invalid" }]);
throw new UnauthorizedError("Invalid or expired session token");
throw new NotFoundError("Resource not found", "Task");
throw new InternalServerError("Unexpected database failure");
```

When thrown, `errorHandler()` automatically translates them into the contract-defined JSON error format:

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request body",
  "issues": [
    {
      "path": ["body", "title"],
      "message": "Title is required",
      "code": "too_small"
    }
  ]
}
```

---

## Response Validation

In development and test environments (`NODE_ENV !== "production"`), `apiBridge.route` validates outgoing response bodies against the contract response schema. If a handler attempts to return an unexpected payload shape, an `INTERNAL_SERVER_ERROR` is raised, preventing silent response drift.

You can explicitly configure this per instance or per route:

```typescript
import { ApiBridge } from "@ahmed109/apibridge-express";

// Disable globally in production
const bridge = new ApiBridge({ validateResponse: process.env.NODE_ENV !== "production" });

// Or configure per route
app.get("/api/tasks", bridge.route(taskContracts.list, handler, { validateResponse: true }));
```

---

## Related Packages

- [`@ahmed109/apibridge-contracts`](https://www.npmjs.com/package/@ahmed109/apibridge-contracts): Shared Zod schemas and route contracts.
- [`@ahmed109/apibridge-react`](https://www.npmjs.com/package/@ahmed109/apibridge-react): Typed API client and TanStack Query hooks.

---

## License

MIT © [Ahmed Rivera](https://github.com/Ahmed1092002) & ApiBridge Contributors.
