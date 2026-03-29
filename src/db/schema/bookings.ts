import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { classes } from "./classes";
import { members } from "./members";

export const bookingStatusEnum = pgEnum("booking_status", [
  "available",
  "confirmed",
  "checked_in",
  "waitlisted",
  "no_show",
  "cancelled",
]);

export const bookingSourceEnum = pgEnum("booking_source", [
  "self",
  "staff",
  "classpass",
  "ai_chat",
  "ai_voice",
]);

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    stationId: text("station_id"),
    status: bookingStatusEnum("status").notNull().default("confirmed"),
    source: bookingSourceEnum("source").notNull().default("self"),
    isFirstTimer: boolean("is_first_timer").notNull().default(false),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("bookings_tenant_idx").on(table.tenantId),
    classIdx: index("bookings_class_idx").on(table.tenantId, table.classId),
    memberIdx: index("bookings_member_idx").on(table.tenantId, table.memberId),
  }),
);

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
