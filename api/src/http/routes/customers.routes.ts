import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { customers, auditLogs } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, resolveCompany } from "../middlewares/auth.js";

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

export async function customersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", resolveCompany);

  app.get("/customers", async (request, reply) => {
    const { companyId } = request;
    if (!companyId) return reply.status(403).send({ message: "No active company" });

    const allCustomers = await db.query.customers.findMany({
      where: eq(customers.companyId, companyId),
      orderBy: (customers, { desc }) => [desc(customers.createdAt)],
    });

    return reply.send({ data: allCustomers });
  });

  app.post("/customers", async (request, reply) => {
    const { companyId, membershipId } = request;
    const user = request.user as { sub: string };
    if (!companyId) return reply.status(403).send({ message: "No active company" });

    const parsed = createCustomerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid request body", errors: parsed.error.issues });
    }

    const newCustomer = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(customers).values({
        companyId,
        ...parsed.data,
      }).returning();

      await tx.insert(auditLogs).values({
        companyId,
        actorUserId: user.sub,
        membershipId,
        action: "customer.created",
        entityTable: "customers",
        entityId: inserted.id,
        afterData: inserted,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return inserted;
    });

    return reply.status(201).send({ data: newCustomer });
  });

  app.patch("/customers/:id", async (request, reply) => {
    const { companyId, membershipId } = request;
    const user = request.user as { sub: string };
    if (!companyId) return reply.status(403).send({ message: "No active company" });

    const { id } = request.params as { id: string };

    const parsed = updateCustomerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid request body", errors: parsed.error.issues });
    }

    const existing = await db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.companyId, companyId)),
    });

    if (!existing) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    const updatedCustomer = await db.transaction(async (tx) => {
      const [updated] = await tx.update(customers)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(customers.id, id))
        .returning();

      await tx.insert(auditLogs).values({
        companyId,
        actorUserId: user.sub,
        membershipId,
        action: "customer.updated",
        entityTable: "customers",
        entityId: updated.id,
        beforeData: existing,
        afterData: updated,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return updated;
    });

    return reply.send({ data: updatedCustomer });
  });
}
