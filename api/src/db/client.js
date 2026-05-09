import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema.js";
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });
export async function checkDatabaseConnection() {
    await db.execute(sql `select 1`);
}
export async function closeDatabaseConnection() {
    await pool.end();
}
