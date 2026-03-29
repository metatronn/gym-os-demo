import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const activityEventTypeEnum = pgEnum("activity_event_type", [
  "lead-new",
  "member-checkin",
  "payment-failed",
  "risk-flag",
  "outreach-sent",
  "lead-converted",
  "task-completed",
]);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    type: activityEventTypeEnum("type").notNull(),
    description: text("description").notNull(),
    relatedId: text("related_id"),
    relatedName: text("related_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("activity_events_tenant_idx").on(table.tenantId),
    createdAtIdx: index("activity_events_created_at_idx").on(
      table.tenantId,
      table.createdAt,
    ),
  }),
);

export type ActivityEvent = typeof activityEvents.$inferSelect;
export type NewActivityEvent = typeof activityEvents.$inferInsert;
