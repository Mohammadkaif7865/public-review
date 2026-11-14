import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export function createDatabaseClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database-backed operations.");
  }

  const queryClient = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: "require",
    connect_timeout: 10,
    idle_timeout: 20,
  });

  return drizzle(queryClient, { schema });
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

