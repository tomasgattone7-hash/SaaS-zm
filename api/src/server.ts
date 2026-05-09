import { closeDatabaseConnection } from "./db/client.js";
import { env } from "./config/env.js";
import { buildApp } from "./http/app.js";

const app = buildApp();

async function start() {
  try {
    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT,
    });
  } catch (error) {
    app.log.error(error);
    await closeDatabaseConnection();
    process.exit(1);
  }
}

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, "Shutting down API server.");
  await app.close();
  await closeDatabaseConnection();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();
