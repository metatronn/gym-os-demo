import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const classTypeEnum = pgEnum("class_type", [
  "boxing",
  "kickboxing",
  "conditioning",
  "fundamentals",
]);

export const classes = pgTable(
  "classes",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    instructor: text("instructor"),
    dayOfWeek: text("day_of_week"),
    time: text("time"),
    duration: integer("duration"),
    capacity: integer("capacity"),
    enrolled: integer("enrolled").notNull().default(0),
    waitlist: integer("waitlist").notNull().default(0),
    type: classTypeEnum("type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("classes_tenant_idx").on(table.tenantId),
    dayIdx: index("classes_day_idx").on(table.tenantId, table.dayOfWeek),
  }),
);

export type ClassSession = typeof classes.$inferSelect;
export type NewClassSession = typeof classes.$inferInsert;
