import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import "./compression-polyfill";
import env from "./src/lib/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_FILE_NAME,
  },
});
