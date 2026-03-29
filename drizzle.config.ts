import { defineConfig } from "drizzle-kit";

const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/gymosdev";

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  DEFAULT_LOCAL_DATABASE_URL;

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
