# @ahmed109/apibridge-react

Typed REST client and TanStack Query hooks for [ApiBridge](https://github.com/Ahmed1092002/ApiBridge) contracts. Your request input, response data, cache keys, and API errors stay aligned with the Zod contract shared with the backend.

## Install

```bash
npm install @ahmed109/apibridge-react @ahmed109/apibridge-contracts @tanstack/react-query react react-dom
```

Wrap the app with TanStack Query's `QueryClientProvider` before using generated hooks.

## Create a client

```ts
import { createApiClient } from "@ahmed109/apibridge-react";
import { apiContract } from "@ahmed109/apibridge-contracts";

export const api = createApiClient({
  baseUrl: "https://api.example.com",
  contracts: apiContract,
  getHeaders: () => ({ Authorization: `Bearer ${token}` }),
});
```

## Query data

```tsx
function TaskList() {
  const tasks = api.tasks.list.useQuery({ status: "todo", page: 1, limit: 20 });

  if (tasks.isLoading) return <p>Loading…</p>;
  if (tasks.error) return <p>{tasks.error.message}</p>;

  return (
    <ul>
      {tasks.data?.items.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

## Mutate data

```tsx
function CreateTaskButton() {
  const createTask = api.tasks.create.useMutation();

  return (
    <button onClick={() => createTask.mutate({ title: "Ship ApiBridge", priority: "high" })}>
      Create task
    </button>
  );
}
```

## Path parameters and query strings

Use the structured form for routes with path parameters:

```ts
api.projects.get.useQuery({
  params: { teamId: "team-1", projectId: "project-7" },
  query: { include: ["tasks", "members"] },
});
// /teams/team-1/projects/project-7?include=tasks&include=members
```

Arrays use repeated query keys by default. If your backend needs another convention, provide `serializeQuery` when creating the client.

## Errors

Failed requests throw `ApiBridgeClientError`, which includes `statusCode`, `errorCode`, optional validation `issues`, and the raw response `data`.

```ts
import { ApiBridgeClientError } from "@ahmed109/apibridge-react";

if (error instanceof ApiBridgeClientError && error.statusCode === 400) {
  console.log(error.issues);
}
```

## License

MIT. [ApiBridge repository](https://github.com/Ahmed1092002/ApiBridge).
