# @ahmed109/apibridge-react

Typed REST client and TanStack Query hooks generated from ApiBridge Zod contracts.

```bash
npm install @ahmed109/apibridge-react @ahmed109/apibridge-contracts @tanstack/react-query
```

```ts
import { createApiClient } from '@ahmed109/apibridge-react';
import { apiContract } from '@ahmed109/apibridge-contracts';

const api = createApiClient({ baseUrl: 'https://api.example.com', contracts: apiContract });
const query = api.tasks.list.useQuery({ status: 'todo' });
```

Wrap the application with TanStack Query's `QueryClientProvider` before using generated hooks.

Repository: https://github.com/Ahmed1092002/npm-packages/tree/main/ApiBridge
