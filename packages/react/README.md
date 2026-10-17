# @ahmed109/apibridge-react

[![npm version](https://img.shields.io/npm/v/@ahmed109/apibridge-react.svg?style=flat-square)](https://www.npmjs.com/package/@ahmed109/apibridge-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20|%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)

> **Typed React API client and TanStack Query hooks generated from ApiBridge contracts.**  
> End-to-end type safety, automated query keys, caching, and optimistic mutations with zero handwritten client types.

---

## Overview

`@ahmed109/apibridge-react` generates a fully typed React client from [`@ahmed109/apibridge-contracts`](https://www.npmjs.com/package/@ahmed109/apibridge-contracts).

### Key Features:

- **Zero Type Drift**: Request parameters, queries, bodies, and response types are inferred directly from the backend contracts.
- **TanStack Query Hooks**: Generates `useQuery` and `useMutation` hooks for every route.
- **Automated Query Key Management**: Automatically structures query keys (`[path, method, input]`) for consistent cache invalidation.
- **Direct Fetch Execution**: Endpoints provide direct `.fetch(input)` methods for SSR, loaders, or imperative scripts.
- **Typed Error Rejections**: Rejections throw structured `ApiBridgeClientError` instances containing HTTP status codes and contract validation issues.
- **Optional Context Provider**: Includes `ApiBridgeProvider` for global client and configuration injection.

---

## Installation

```bash
# npm
npm install @ahmed109/apibridge-react @ahmed109/apibridge-contracts @tanstack/react-query react react-dom

# pnpm
pnpm add @ahmed109/apibridge-react @ahmed109/apibridge-contracts @tanstack/react-query react react-dom

# yarn
yarn add @ahmed109/apibridge-react @ahmed109/apibridge-contracts @tanstack/react-query react react-dom

# bun
bun add @ahmed109/apibridge-react @ahmed109/apibridge-contracts @tanstack/react-query react react-dom
```

---

## Quickstart

### 1. Initialize the API Client

```typescript
// src/api.ts
import { createApiClient } from "@ahmed109/apibridge-react";
import { taskContracts, userContracts } from "@ahmed109/apibridge-contracts";

export const api = createApiClient({
  baseUrl: process.env.VITE_API_URL || "http://localhost:4000",
  contracts: {
    me: userContracts.me,
    tasks: taskContracts,
  },
  getHeaders: () => {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

### 2. Wrap App with `QueryClientProvider`

```tsx
// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskList } from "./TaskList";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>
  );
}
```

### 3. Query Data with `useQuery`

```tsx
// src/TaskList.tsx
import React, { useState } from "react";
import { api } from "./api";

export function TaskList() {
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [page, setPage] = useState(1);

  // Fully typed input parameters and response data:
  const { data, isLoading, isError, error, refetch } = api.tasks.list.useQuery({
    status,
    page,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (isLoading) return <div>Loading tasks...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Task List ({data?.total} total)</h2>
      <ul>
        {data?.items.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> — {task.status} ({task.priority})
          </li>
        ))}
      </ul>

      <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
        Previous
      </button>
      <span>
        {" "}
        Page {page} of {data?.totalPages}{" "}
      </span>
      <button disabled={page >= (data?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

### 4. Mutate Data with `useMutation` & Cache Invalidation

```tsx
// src/CreateTaskForm.tsx
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { ApiBridgeClientError } from "@ahmed109/apibridge-react";

export function CreateTaskForm() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const createTask = api.tasks.create.useMutation({
    onSuccess: () => {
      // Invalidate tasks list queries using the contract path
      queryClient.invalidateQueries({
        queryKey: [api.tasks.list.contract.path],
      });
      setTitle("");
      setErrorMessage(null);
    },
    onError: (err: ApiBridgeClientError) => {
      // Structured validation errors from backend
      if (err.statusCode === 400 && err.issues) {
        setErrorMessage(err.issues.map((i) => i.message).join(", "));
      } else {
        setErrorMessage(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate({
      title,
      priority,
      status: "todo",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" disabled={createTask.isPending}>
        {createTask.isPending ? "Creating..." : "Add Task"}
      </button>
    </form>
  );
}
```

---

## Error Handling with `ApiBridgeClientError`

When the server responds with a non-2xx status code, the client throws an `ApiBridgeClientError`:

```typescript
import { ApiBridgeClientError } from "@ahmed109/apibridge-react";

try {
  await api.tasks.get.fetch({ id: "non-existent" });
} catch (err) {
  if (err instanceof ApiBridgeClientError) {
    console.log(err.statusCode); // 404
    console.log(err.errorCode); // "NOT_FOUND"
    console.log(err.message); // "Task not found"
    console.log(err.issues); // Validation issues if 400
    console.log(err.data); // Raw parsed JSON response
  }
}
```

---

## Global Context Provider (Optional)

```tsx
import { ApiBridgeProvider } from "@ahmed109/apibridge-react";
import { api } from "./api";

function Root() {
  return (
    <ApiBridgeProvider baseUrl="https://api.example.com" client={api}>
      <App />
    </ApiBridgeProvider>
  );
}
```

---

## Related Packages

- [`@ahmed109/apibridge-contracts`](https://www.npmjs.com/package/@ahmed109/apibridge-contracts): Framework-agnostic Zod route contracts.
- [`@ahmed109/apibridge-express`](https://www.npmjs.com/package/@ahmed109/apibridge-express): Express route wrapper and OpenAPI 3.0 generator.

---

## License

MIT © [Ahmed Rivera](https://github.com/Ahmed1092002) & ApiBridge Contributors.
