import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local first (takes priority), then fall back to .env
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
