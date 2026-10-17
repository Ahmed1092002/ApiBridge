# @ahmed109/apibridge-contracts

[![npm version](https://img.shields.io/npm/v/@ahmed109/apibridge-contracts.svg?style=flat-square)](https://www.npmjs.com/package/@ahmed109/apibridge-contracts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Schema-Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)

> **Framework-independent, type-safe REST API contracts powered by Zod.**  
> The single source of truth for full-stack TypeScript applications in the [ApiBridge](https://github.com/Ahmed1092002/ApiBridge) ecosystem.

---

## Overview

In traditional full-stack web applications, backend controllers and frontend API clients duplicate endpoint definitions, route paths, parameter parsing, and TypeScript interfaces. When backend endpoints change, frontend types frequently drift out of sync, leading to silent production runtime crashes.

`@ahmed109/apibridge-contracts` solves this by allowing you to define your REST API routes, path parameters, query parameters, request bodies, expected response bodies, and error formats **once** using pure TypeScript and [Zod](https://zod.dev).

The exact same contract definition is then consumed by:

- **Backend**: [`@ahmed109/apibridge-express`](https://www.npmjs.com/package/@ahmed109/apibridge-express) for runtime validation and automatic Swagger/OpenAPI generation.
- **Frontend**: [`@ahmed109/apibridge-react`](https://www.npmjs.com/package/@ahmed109/apibridge-react) for auto-generated, strictly typed TanStack Query hooks.

---

## Installation

```bash
# npm
npm install @ahmed109/apibridge-contracts zod

# pnpm
pnpm add @ahmed109/apibridge-contracts zod

# yarn
yarn add @ahmed109/apibridge-contracts zod

# bun
bun add @ahmed109/apibridge-contracts zod
```

---

## Quickstart

### 1. Define Route Contracts

Create a shared contracts file (e.g. `src/contracts/tasks.ts`):

```typescript
import { z } from "zod";
import { defineRoute, standardErrors } from "@ahmed109/apibridge-contracts";

// 1. Define Entity Schemas
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().default(""),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assigneeId: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;

// 2. Define Query and Mutation Schemas
export const TaskQuerySchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional().default(""),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assigneeId: z.string().nullable().optional().default(null),
});

export const TaskListResponseSchema = z.object({
  items: z.array(TaskSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// 3. Define Shared Route Contracts
export const taskContracts = {
  list: defineRoute({
    method: "get",
    path: "/api/tasks",
    summary: "List tasks",
    description: "Retrieve a paginated, filterable list of tasks.",
    tags: ["Tasks"],
    query: TaskQuerySchema,
    responses: {
      200: TaskListResponseSchema,
      400: standardErrors[400],
      500: standardErrors[500],
    },
  }),

  get: defineRoute({
    method: "get",
    path: "/api/tasks/:id",
    summary: "Get task by ID",
    tags: ["Tasks"],
    params: z.object({ id: z.string().min(1) }),
    responses: {
      200: TaskSchema,
      400: standardErrors[400],
      404: standardErrors[404],
      500: standardErrors[500],
    },
  }),

  create: defineRoute({
    method: "post",
    path: "/api/tasks",
    summary: "Create task",
    tags: ["Tasks"],
    body: CreateTaskInputSchema,
    responses: {
      201: TaskSchema,
      400: standardErrors[400],
      401: standardErrors[401],
      500: standardErrors[500],
    },
  }),

  delete: defineRoute({
    method: "delete",
    path: "/api/tasks/:id",
    summary: "Delete task",
    tags: ["Tasks"],
    params: z.object({ id: z.string().min(1) }),
    responses: {
      200: z.object({ success: z.boolean(), id: z.string() }),
      400: standardErrors[400],
      401: standardErrors[401],
      404: standardErrors[404],
    },
  }),
};
```

---

## Type Inference Utilities

`@ahmed109/apibridge-contracts` exports TypeScript utilities to infer exact static types from route contracts without writing duplicate interfaces:

```typescript
import type {
  InferRouteParams,
  InferRouteQuery,
  InferRouteBody,
  InferRouteResponse,
} from "@ahmed109/apibridge-contracts";
import type { taskContracts } from "./contracts/tasks";

// Inferred: { id: string }
type TaskParams = InferRouteParams<typeof taskContracts.get>;

// Inferred: { status?: "todo" | "in_progress" | "done"; page: number; limit: number; ... }
type TaskQuery = InferRouteQuery<typeof taskContracts.list>;

// Inferred: { title: string; description?: string; status?: ...; priority?: ... }
type CreateTaskBody = InferRouteBody<typeof taskContracts.create>;

// Inferred: { items: Task[]; total: number; page: number; ... }
type ListResponse = InferRouteResponse<typeof taskContracts.list, 200>;
```

---

## Standard Error Envelopes

ApiBridge enforces structured, predictable JSON error payloads across all endpoints:

```typescript
import {
  standardErrors,
  ValidationErrorSchema,
  UnauthorizedErrorSchema,
  NotFoundErrorSchema,
  InternalServerErrorSchema,
  type ValidationError,
  type UnauthorizedError,
  type NotFoundError,
  type InternalServerError,
} from "@ahmed109/apibridge-contracts";
```

### Supported Status Envelopes:

| HTTP Status | Error Code              | Schema                      | Description                                       |
| :---------- | :---------------------- | :-------------------------- | :------------------------------------------------ |
| `400`       | `VALIDATION_ERROR`      | `ValidationErrorSchema`     | Contains `issues: Array<{ path, message, code }>` |
| `401`       | `UNAUTHORIZED`          | `UnauthorizedErrorSchema`   | Authentication credentials missing or invalid     |
| `404`       | `NOT_FOUND`             | `NotFoundErrorSchema`       | Targeted entity or route was not found            |
| `500`       | `INTERNAL_SERVER_ERROR` | `InternalServerErrorSchema` | Unhandled exceptions or internal server errors    |

---

## Related Packages

- [`@ahmed109/apibridge-express`](https://www.npmjs.com/package/@ahmed109/apibridge-express): Express route wrapper with automated Zod validation & OpenAPI generation.
- [`@ahmed109/apibridge-react`](https://www.npmjs.com/package/@ahmed109/apibridge-react): Typed API client and TanStack Query hooks.

---

## License

MIT © [Ahmed Rivera](https://github.com/Ahmed1092002) & ApiBridge Contributors.
