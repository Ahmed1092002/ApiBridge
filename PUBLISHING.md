# Publishing ApiBridge Packages to npm

This guide describes how to publish new releases of the `@ahmed109/apibridge-*` packages to the public npm registry.

---

## Packages Published

The monorepo publishes three synchronized packages:

1. [`@ahmed109/apibridge-contracts`](./packages/contracts) — Shared framework-independent Zod schemas and contract definitions.
2. [`@ahmed109/apibridge-express`](./packages/express) — Express route adapter, runtime validator, and OpenAPI/Swagger generator.
3. [`@ahmed109/apibridge-react`](./packages/react) — React typed client factory and TanStack Query hooks.

---

## Prerequisites

1. **npm Authentication**: Verify you are authenticated to publish under the `@ahmed109` scope:

   ```bash
   npm whoami
   # Should output: ahmed109
   ```

   If not logged in, run:

   ```bash
   npm login
   ```

2. **Run Verification Suite**:
   ```bash
   pnpm test       # Run all 28 Vitest tests across packages
   pnpm lint       # Verify zero ESLint errors
   pnpm format     # Verify Prettier code style
   pnpm build      # Generate fresh ESM, CJS, and DTS bundles
   ```

---

## Publishing Workflow

### 1. Test with Dry-Run

Before publishing live to npm, execute a dry-run to inspect the package tarball contents, size, and validity:

```bash
pnpm publish:dry-run
```

_(This automatically builds all packages and verifies tarball contents without publishing to npm)._

---

### 2. Publish All Packages (One Command)

When ready to publish the new release to the npm registry:

```bash
pnpm publish:packages
```

_(This runs `pnpm -r --filter=./packages/* publish --access public --no-git-checks`)_.

---

### Alternative: Publishing Packages Individually

If you prefer to publish each package step by step, publish `@ahmed109/apibridge-contracts` first since both `@ahmed109/apibridge-express` and `@ahmed109/apibridge-react` depend on it:

```bash
# 1. Publish Contracts Core
pnpm --filter @ahmed109/apibridge-contracts publish --access public --no-git-checks

# 2. Publish Express Adapter
pnpm --filter @ahmed109/apibridge-express publish --access public --no-git-checks

# 3. Publish React Client Hooks
pnpm --filter @ahmed109/apibridge-react publish --access public --no-git-checks
```

---

## Verifying on npm

Once published, you can verify the latest version on the public registry:

```bash
npm view @ahmed109/apibridge-contracts version
npm view @ahmed109/apibridge-express version
npm view @ahmed109/apibridge-react version
```
