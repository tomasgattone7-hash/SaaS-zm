import cors from "@fastify/cors";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { healthRoutes } from "./routes/health.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { customersRoutes } from "./routes/customers.routes.js";
import { suppliersRoutes } from "./routes/suppliers.routes.js";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

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

  app.register(fastifyCookie, {
    secret: env.JWT_SECRET, // for cookie signature
  });

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: "session",
      signed: false, // Fastify-jwt doesn't need to double-sign if we are just storing it in an httpOnly cookie
    },
  });

  app.register(healthRoutes, { prefix: "/v1" });
  app.register(authRoutes, { prefix: "/v1" });
  app.register(customersRoutes, { prefix: "/v1" });
  app.register(suppliersRoutes, { prefix: "/v1" });

  return app;
}
