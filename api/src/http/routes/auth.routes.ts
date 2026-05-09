import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { users, auditLogs } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { requireAuth } from "../middlewares/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid request body", errors: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        memberships: {
          with: { company: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return reply.status(401).send({ message: "Invalid email or password" });
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Audit log
    const firstCompanyId = user.memberships[0]?.company?.id;
    if (firstCompanyId) {
      await db.insert(auditLogs).values({
        companyId: firstCompanyId,
        actorUserId: user.id,
        action: "user.login",
        entityTable: "users",
        entityId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });
    }

    const token = app.jwt.sign({ sub: user.id, email: user.email });

    reply.setCookie("session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return reply.send({ message: "Logged in successfully", user: { id: user.id, email: user.email, fullName: user.fullName } });
  });

  app.post("/auth/logout", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user as { sub: string };

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.sub),
      with: {
        memberships: {
          with: { company: true },
        },
      },
    });

    const firstCompanyId = dbUser?.memberships[0]?.company?.id;
    if (firstCompanyId && dbUser) {
      await db.insert(auditLogs).values({
        companyId: firstCompanyId,
        actorUserId: dbUser.id,
        action: "user.logout",
        entityTable: "users",
        entityId: dbUser.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });
    }

    reply.clearCookie("session", { path: "/" });
    return reply.send({ message: "Logged out successfully" });
  });

  app.get("/auth/me", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user as { sub: string };
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.sub),
    });

    if (!dbUser) {
      return reply.status(404).send({ message: "User not found" });
    }

    return reply.send({ user: { id: dbUser.id, email: dbUser.email, fullName: dbUser.fullName, status: dbUser.status } });
  });
}
