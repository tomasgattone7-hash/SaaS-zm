import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { suppliers, auditLogs } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, resolveCompany } from "../middlewares/auth.js";

const createSupplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const updateSupplierSchema = createSupplierSchema.partial();

export async function suppliersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", resolveCompany);

  app.get("/suppliers", async (request, reply) => {
    const { companyId } = request;
    if (!companyId) return reply.status(403).send({ message: "No active company" });

    const allSuppliers = await db.query.suppliers.findMany({
      where: eq(suppliers.companyId, companyId),
      orderBy: (suppliers, { desc }) => [desc(suppliers.createdAt)],
    });

    return reply.send({ data: allSuppliers });
  });

  app.post("/suppliers", async (request, reply) => {
    const { companyId, membershipId } = request;
    const user = request.user as { sub: string };
    if (!companyId) return reply.status(403).send({ message: "No active company" });

    const parsed = createSupplierSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid request body", errors: parsed.error.issues });
    }

    const newSupplier = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(suppliers).values({
        companyId,
        ...parsed.data,
      }).returning();

      await tx.insert(auditLogs).values({
        companyId,
        actorUserId: user.sub,
        membershipId,
        action: "supplier.created",
        entityTable: "suppliers",
        entityId: inserted.id,
        afterData: inserted,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return inserted;
    });

    return reply.status(201).send({ data: newSupplier });
  });

  app.patch("/suppliers/:id", async (request, reply) => {
    const { companyId, membershipId } = request;
    const user = request.user as { sub: string };
    if (!companyId) return reply.status(403).send({ message: "No active company" });

    const { id } = request.params as { id: string };

    const parsed = updateSupplierSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Invalid request body", errors: parsed.error.issues });
    }

    const existing = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)),
    });

    if (!existing) {
      return reply.status(404).send({ message: "Supplier not found" });
    }

    const updatedSupplier = await db.transaction(async (tx) => {
      const [updated] = await tx.update(suppliers)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(suppliers.id, id))
        .returning();

      await tx.insert(auditLogs).values({
        companyId,
        actorUserId: user.sub,
        membershipId,
        action: "supplier.updated",
        entityTable: "suppliers",
        entityId: updated.id,
        beforeData: existing,
        afterData: updated,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return updated;
    });

    return reply.send({ data: updatedSupplier });
  });
}
