# @ahmed109/apibridge-contracts

The framework-independent core of [ApiBridge](https://github.com/Ahmed1092002/ApiBridge). Define REST API endpoints once with Zod, then share the same contract between any backend and frontend.

## Install

```bash
npm install @ahmed109/apibridge-contracts zod
```

## Define a contract

```ts
import { z } from "zod";
import { defineRoute, standardErrors } from "@ahmed109/apibridge-contracts";

export const updateInvoice = defineRoute({
  method: "patch",
  path: "/accounts/:accountId/invoices/:invoiceId",
  params: z.object({ accountId: z.string(), invoiceId: z.string() }),
  body: z.object({ status: z.enum(["draft", "paid", "void"]) }),
  headers: z.object({ "x-tenant-id": z.string() }),
  auth: "required",
  permissions: ["billing.invoices.update"],
  responses: {
    200: z.object({ id: z.string(), status: z.string() }),
    400: standardErrors[400],
    401: standardErrors[401],
  },
});
```

## What a contract contains

| Field                                | Purpose                                               |
| ------------------------------------ | ----------------------------------------------------- |
| `method`, `path`                     | HTTP method and any named path parameters.            |
| `params`, `query`, `body`, `headers` | Optional Zod schemas for incoming data.               |
| `responses`                          | Zod schemas indexed by HTTP status code.              |
| `auth`, `permissions`                | Application metadata consumed by your server adapter. |
| `security`                           | Optional OpenAPI security requirements.               |

## Type inference

```ts
import type {
  InferRouteParams,
  InferRouteBody,
  InferRouteResponse,
} from "@ahmed109/apibridge-contracts";

type UpdateParams = InferRouteParams<typeof updateInvoice>;
type UpdateInput = InferRouteBody<typeof updateInvoice>;
type UpdatedInvoice = InferRouteResponse<typeof updateInvoice>;
```

Use this package with [`@ahmed109/apibridge-express`](https://www.npmjs.com/package/@ahmed109/apibridge-express) for validation and OpenAPI, or [`@ahmed109/apibridge-react`](https://www.npmjs.com/package/@ahmed109/apibridge-react) for typed client hooks.

## License

MIT. [ApiBridge repository](https://github.com/Ahmed1092002/ApiBridge).
