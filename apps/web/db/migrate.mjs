import path from "node:path";
import process from "node:process";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runtimeDatabaseUrl = process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const migrationDatabaseUrl = runtimeDatabaseUrl.replace(":6543/", ":5432/");
const client = postgres(migrationDatabaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
  connect_timeout: 10,
});

try {
  const database = drizzle(client);
  await migrate(database, {
    migrationsFolder: path.join(process.cwd(), "db", "migrations"),
  });
  console.log("Database migrations applied successfully.");
} finally {
  await client.end({ timeout: 5 });
}

