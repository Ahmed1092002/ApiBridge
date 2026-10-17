import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Packages publish compiled dist files, but a clean CI checkout has no dist yet.
    // Tests deliberately resolve workspace imports to source; `pnpm build` verifies the published output.
    alias: {
      "@ahmed109/apibridge-contracts": fileURLToPath(
        new URL("./packages/contracts/src/index.ts", import.meta.url),
      ),
      "@ahmed109/apibridge-react": fileURLToPath(
        new URL("./packages/react/src/index.ts", import.meta.url),
      ),
      "@ahmed109/apibridge-express": fileURLToPath(
        new URL("./packages/express/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/*/tests/**/*.test.{ts,tsx}", "apps/*/tests/**/*.test.{ts,tsx}"],
  },
});
