import { Client } from "pg";
import { config } from "dotenv";

config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT 1");
    console.log("Connected successfully:", res.rows);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

run();
