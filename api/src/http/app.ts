import cors from "@fastify/cors";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { healthRoutes } from "./routes/health.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
    genReqId: (request) =>
      request.headers["x-request-id"]?.toString() ?? randomUUID(),
  });

  app.register(cors, {
    origin: env.WEB_ORIGIN ? [env.WEB_ORIGIN] : false,
    credentials: true,
  });

  app.register(healthRoutes, { prefix: "/v1" });

  return app;
}
