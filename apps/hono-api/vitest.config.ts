import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "node",
    env: {
      ...loadEnv(mode, process.cwd(), ""),
    },
    setupFiles: ["./test-setup/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
}));
