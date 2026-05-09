import { db } from "./client.js";
import { roles } from "./schema.js";

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
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed:", err);
  process.exit(1);
});
