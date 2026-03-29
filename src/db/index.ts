import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "@/lib/env";
import * as schema from "./schema";

function isNeonDatabaseUrl(connectionString: string) {
  try {
    return new URL(connectionString).hostname.includes("neon");
  } catch {
    return false;
  }
}

export const db = isNeonDatabaseUrl(DATABASE_URL)
  ? drizzleNeon(neon(DATABASE_URL), { schema })
  : drizzlePostgres(postgres(DATABASE_URL, { prepare: false }), { schema });

export type Database = typeof db;
