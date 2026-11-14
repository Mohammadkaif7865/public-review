import { defineConfig } from "drizzle-kit";

const runtimeDatabaseUrl =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/public_review";

// Supabase's transaction pooler (6543) is correct for serverless requests,
// while schema tools require session semantics through the shared pooler (5432).
const migrationDatabaseUrl = runtimeDatabaseUrl.replace(":6543/", ":5432/");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: migrationDatabaseUrl,
  },
  strict: true,
  verbose: true,
});

