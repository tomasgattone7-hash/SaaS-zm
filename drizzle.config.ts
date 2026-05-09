import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const command = process.argv[2];
const databaseUrl =
  process.env.DATABASE_URL ??
  (command === "generate"
    ? "postgresql://postgres:postgres@127.0.0.1:5432/factory_finance_dashboard"
    : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle commands other than generate.");
}

export default defineConfig({
  schema: "./api/src/db/schema.ts",
  out: "./api/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
