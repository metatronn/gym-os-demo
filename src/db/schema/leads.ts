import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const leadSourceEnum = pgEnum("lead_source", [
  "Instagram",
  "Website",
  "Facebook",
  "Walk-in",
  "Referral",
  "Google",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "booked",
  "converted",
  "lost",
]);

export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    source: leadSourceEnum("source"),
    status: leadStatusEnum("status").notNull().default("new"),
    score: integer("score").notNull().default(0),
    interest: text("interest"),
    assignedTo: text("assigned_to"),
    lastContact: timestamp("last_contact", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("leads_tenant_idx").on(table.tenantId),
    statusIdx: index("leads_status_idx").on(table.tenantId, table.status),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
