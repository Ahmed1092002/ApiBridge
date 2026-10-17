# @ahmed109/apibridge-express

Express adapter for [ApiBridge](https://github.com/Ahmed1092002/ApiBridge) contracts. It validates incoming requests with Zod, optionally validates responses in development, calls your authorization logic, and produces OpenAPI 3.0 documentation.

## Install

```bash
npm install @ahmed109/apibridge-express @ahmed109/apibridge-contracts express
```

## Use a contract in Express

```ts
import express from "express";
import { ApiBridge, errorHandler } from "@ahmed109/apibridge-express";
import { getProject } from "./contracts";

const app = express();
app.use(express.json());

const bridge = new ApiBridge({
  authorize: async ({ req, auth, permissions }) => {
    const user = await getUserFromSession(req);
    if (auth === "required" && !user) throw new Error("UNAUTHORIZED");
    await assertPermissions(user, permissions);
  },
});

app.get(
  getProject.path,
  bridge.route(getProject, async ({ params, query, headers }) => ({
    status: 200,
    body: await projects.get({ ...params, ...query, tenantId: headers["x-tenant-id"] }),
  })),
);

app.use(errorHandler());
```

`route()` validates `params`, `query`, `body`, and declared `headers` before your handler executes. Validation errors are returned as a consistent `400 VALIDATION_ERROR` payload.

## Authorization

ApiBridge deliberately does not choose an auth provider for you. Contract metadata tells your own `authorize` callback what the endpoint requires:

```ts
const bridge = new ApiBridge({
  authorize: ({ req, auth, permissions }) => {
    // Validate JWT, session, API key, RBAC, tenant membership, etc.
    // Throw or send your application's unauthorized/forbidden response when needed.
  },
});
```

You can also pass a per-route `authorize` function as the third argument to `bridge.route()`.

## OpenAPI / Swagger

```ts
import { generateOpenApiDocument, setupSwaggerDocs } from "@ahmed109/apibridge-express";

const spec = generateOpenApiDocument([getProject], {
  info: { title: "Projects API", version: "1.0.0" },
  securitySchemes: {
    bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
  },
});

setupSwaggerDocs(app, "/docs", spec);
```

## License

MIT. [ApiBridge repository](https://github.com/Ahmed1092002/ApiBridge).
