import { fileURLToPath } from "node:url";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Component tests only. The pure-logic tests in src/viva run under node:test (see `npm test`).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [viteReact()],
  define: { __BUILD_TIME__: JSON.stringify(""), __BUILD_SHA__: JSON.stringify("") },
  test: {
    environment: "jsdom",
    include: ["src/components/**/*.test.tsx"],
  },
});
