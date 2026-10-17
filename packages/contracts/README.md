# @ahmed109/apibridge-contracts

Define REST API contracts once with Zod and share the same runtime schemas and inferred TypeScript types across your frontend and backend.

```bash
npm install @ahmed109/apibridge-contracts zod
```

```ts
import { defineRoute } from '@ahmed109/apibridge-contracts';
import { z } from 'zod';

export const getProject = defineRoute({
  method: 'get',
  path: '/projects/:id',
  params: z.object({ id: z.string().uuid() }),
  responses: { 200: z.object({ id: z.string(), name: z.string() }) },
});
```

Use the contract with `@ahmed109/apibridge-express` for validation/OpenAPI and `@ahmed109/apibridge-react` for typed client hooks.

Repository: https://github.com/Ahmed1092002/ApiBridge
