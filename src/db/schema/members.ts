import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "frozen",
  "cancelled",
  "trial",
]);
export const riskLevelEnum = pgEnum("risk_level", [
  "critical",
  "high",
  "medium",
  "low",
]);
export const planTypeEnum = pgEnum("plan_type", [
  "Premium",
  "Unlimited",
  "Basic",
  "Trial",
]);
export const billingStatusEnum = pgEnum("billing_status", [
  "current",
  "failed",
  "past-due",
  "pending",
]);

export const members = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    avatar: text("avatar"),
    plan: planTypeEnum("plan").notNull().default("Trial"),
    status: memberStatusEnum("status").notNull().default("trial"),
    riskScore: real("risk_score").notNull().default(0),
    riskLevel: riskLevelEnum("risk_level").notNull().default("low"),
    lastCheckIn: timestamp("last_check_in", { withTimezone: true }),
    monthlyVisits: integer("monthly_visits").notNull().default(0),
    billingStatus: billingStatusEnum("billing_status")
      .notNull()
      .default("pending"),
    joinDate: timestamp("join_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    notes: text("notes"),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("members_tenant_idx").on(table.tenantId),
    statusIdx: index("members_status_idx").on(table.tenantId, table.status),
    riskIdx: index("members_risk_idx").on(table.tenantId, table.riskLevel),
  }),
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
