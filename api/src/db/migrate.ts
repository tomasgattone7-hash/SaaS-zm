import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";

async function run() {
  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./api/drizzle" });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
