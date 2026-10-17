# @ahmed109/apibridge-express

Express adapter for ApiBridge contracts. It validates params, query strings, request bodies, and optional response schemas; it can also generate an OpenAPI 3.0 document.

```bash
npm install @ahmed109/apibridge-express @ahmed109/apibridge-contracts express
```

```ts
app.get(
  getProject.path,
  apiBridge.route(getProject, async ({ params }) => ({
    status: 200,
    body: await projects.find(params.id),
  })),
);
```

Add `errorHandler()` after routes, and pass contracts to `generateOpenApiDocument()` to mount Swagger UI.

Repository: https://github.com/Ahmed1092002/ApiBridge
