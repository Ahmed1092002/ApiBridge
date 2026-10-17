# Publishing ApiBridge

Publish the packages in this order because React and Express depend on Contracts:

1. `@ahmed109/apibridge-contracts`
2. `@ahmed109/apibridge-react`
3. `@ahmed109/apibridge-express`

Before publishing, authenticate with `npm login` and run:

```bash
pnpm test
pnpm lint
pnpm build
pnpm --filter @ahmed109/apibridge-contracts pack --dry-run
pnpm --filter @ahmed109/apibridge-react pack --dry-run
pnpm --filter @ahmed109/apibridge-express pack --dry-run
```

Then publish each public package:

```bash
pnpm --filter @ahmed109/apibridge-contracts publish --access public --no-git-checks
pnpm --filter @ahmed109/apibridge-react publish --access public --no-git-checks
pnpm --filter @ahmed109/apibridge-express publish --access public --no-git-checks
```
