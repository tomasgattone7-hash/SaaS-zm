import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    legalName: text("legal_name").notNull(),
    displayName: text("display_name").notNull(),
    defaultCurrency: text("default_currency").notNull().default("ARS"),
    timezone: text("timezone").notNull().default("America/Argentina/Buenos_Aires"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("companies_slug_unique").on(sql`lower(${table.slug})`),
    check("companies_slug_format_check", sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`),
    check("companies_currency_format_check", sql`${table.defaultCurrency} ~ '^[A-Z]{3}$'`),
    check("companies_status_check", sql`${table.status} in ('active', 'suspended', 'archived')`),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    authProvider: text("auth_provider"),
    authSubject: text("auth_subject"),
    passwordHash: text("password_hash"),
    status: text("status").notNull().default("invited"),
    isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(sql`lower(${table.email})`),
    uniqueIndex("users_auth_identity_unique")
      .on(table.authProvider, table.authSubject)
      .where(sql`${table.authProvider} is not null and ${table.authSubject} is not null`),
    check("users_status_check", sql`${table.status} in ('invited', 'active', 'disabled')`),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("roles_code_format_check", sql`${table.code} ~ '^[a-z_]+$'`),
  ],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("invited"),
    invitedByUserId: uuid("invited_by_user_id").references(() => users.id, { onDelete: "set null" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("memberships_active_company_user_unique")
      .on(table.companyId, table.userId)
      .where(sql`${table.revokedAt} is null`),
    index("memberships_company_status_idx").on(table.companyId, table.status),
    index("memberships_user_status_idx").on(table.userId, table.status),
    index("memberships_role_idx").on(table.roleId),
    check("memberships_status_check", sql`${table.status} in ('invited', 'active', 'revoked')`),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    membershipId: uuid("membership_id").references(() => memberships.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityTable: text("entity_table").notNull(),
    entityId: text("entity_id").notNull(),
    beforeData: jsonb("before_data").$type<Record<string, unknown> | null>(),
    afterData: jsonb("after_data").$type<Record<string, unknown> | null>(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    requestId: text("request_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_company_created_at_idx").on(table.companyId, table.createdAt),
    index("audit_logs_entity_idx").on(table.companyId, table.entityTable, table.entityId),
    index("audit_logs_actor_idx").on(table.actorUserId),
    check(
      "audit_logs_metadata_object_check",
      sql`${table.metadata} is null or jsonb_typeof(${table.metadata}) = 'object'`,
    ),
  ],
);

export const companiesRelations = relations(companies, ({ many }) => ({
  memberships: many(memberships),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one, many }) => ({
  company: one(companies, {
    fields: [memberships.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [memberships.roleId],
    references: [roles.id],
  }),
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  company: one(companies, {
    fields: [auditLogs.companyId],
    references: [companies.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
  membership: one(memberships, {
    fields: [auditLogs.membershipId],
    references: [memberships.id],
  }),
}));
