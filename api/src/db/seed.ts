import { db } from "./client.js";
import { roles, users, companies, memberships } from "./schema.js";
import { env } from "../config/env.js";
import bcrypt from "bcrypt";
import { eq, and } from "drizzle-orm";

async function seed() {
  console.log("Seeding roles...");

  const defaultRoles = [
    { code: "owner", name: "Owner", description: "Full access to everything" },
    { code: "admin", name: "Admin", description: "Administrative access" },
    { code: "finance", name: "Finance", description: "Finance and billing access" },
    { code: "sales", name: "Sales", description: "Sales and CRM access" },
    { code: "workshop", name: "Workshop", description: "Workshop and production access" },
    { code: "viewer", name: "Viewer", description: "Read-only access" },
  ];

  for (const role of defaultRoles) {
    await db
      .insert(roles)
      .values({ ...role, isSystem: true })
      .onConflictDoNothing({ target: roles.code });
  }

  console.log("Roles seeded successfully.");

  if (env.NODE_ENV === "development") {
    if (!env.DEV_ADMIN_EMAIL || !env.DEV_ADMIN_PASSWORD || !env.DEV_ADMIN_NAME || !env.DEV_COMPANY_NAME) {
      console.log("Skipping development user seed: DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD, DEV_ADMIN_NAME, or DEV_COMPANY_NAME environment variables are missing.");
    } else {
      console.log("Syncing development user...");
      
      const slug = env.DEV_COMPANY_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      let company = await db.query.companies.findFirst({
        where: eq(companies.slug, slug),
      });

      if (!company) {
        const [newCompany] = await db.insert(companies).values({
          legalName: env.DEV_COMPANY_NAME,
          displayName: env.DEV_COMPANY_NAME,
          slug,
        }).returning();
        company = newCompany;
      }

      let user = await db.query.users.findFirst({
        where: eq(users.email, env.DEV_ADMIN_EMAIL),
      });

      const passwordHash = await bcrypt.hash(env.DEV_ADMIN_PASSWORD, 10);

      if (!user) {
        const [newUser] = await db.insert(users).values({
          email: env.DEV_ADMIN_EMAIL,
          fullName: env.DEV_ADMIN_NAME,
          passwordHash,
          status: "active",
        }).returning();
        user = newUser;
      } else {
        const [updatedUser] = await db.update(users).set({
          fullName: env.DEV_ADMIN_NAME,
          passwordHash,
          status: "active",
        }).where(eq(users.id, user.id)).returning();
        user = updatedUser;
      }

      const ownerRole = await db.query.roles.findFirst({
        where: eq(roles.code, "owner"),
      });

      if (ownerRole) {
        const existingMembership = await db.query.memberships.findFirst({
          where: and(eq(memberships.userId, user.id), eq(memberships.companyId, company.id)),
        });

        if (!existingMembership) {
          await db.insert(memberships).values({
            companyId: company.id,
            userId: user.id,
            roleId: ownerRole.id,
            status: "active",
          });
        }
      }
      
      console.log("Development user synced successfully.");
    }
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed:", err);
  process.exit(1);
});
