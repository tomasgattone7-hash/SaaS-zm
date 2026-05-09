import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/client.js";
import { memberships } from "../../db/schema.js";
import { eq, and, isNull } from "drizzle-orm";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

export async function resolveCompany(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as { sub: string };
  if (!user || !user.sub) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const requestedCompanyId = request.headers["x-company-id"] as string | undefined;

  let activeMembership;

  if (requestedCompanyId) {
    activeMembership = await db.query.memberships.findFirst({
      where: and(
        eq(memberships.userId, user.sub),
        eq(memberships.companyId, requestedCompanyId),
        isNull(memberships.revokedAt),
        eq(memberships.status, "active")
      ),
      with: { company: true, role: true }
    });
  } else {
    activeMembership = await db.query.memberships.findFirst({
      where: and(
        eq(memberships.userId, user.sub),
        isNull(memberships.revokedAt),
        eq(memberships.status, "active")
      ),
      with: { company: true, role: true }
    });
  }

  if (!activeMembership) {
    return reply.status(403).send({ message: "No active membership found for this company." });
  }

  request.companyId = activeMembership.companyId;
  request.membershipId = activeMembership.id;
  request.roleCode = activeMembership.role.code;
}

declare module "fastify" {
  interface FastifyRequest {
    companyId?: string;
    membershipId?: string;
    roleCode?: string;
  }
}
