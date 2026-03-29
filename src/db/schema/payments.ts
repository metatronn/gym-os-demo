import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { members } from "./members";
import { tenants } from "./tenants";

export const paymentStatusEnum = pgEnum("payment_status", [
  "succeeded",
  "failed",
  "refunded",
  "pending",
]);
export const paymentTypeEnum = pgEnum("payment_type", [
  "subscription",
  "one-time",
]);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    memberId: text("member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("usd"),
    memberName: text("member_name"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    type: paymentTypeEnum("type"),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    method: text("method"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("payments_tenant_idx").on(table.tenantId),
    memberIdx: index("payments_member_idx").on(table.tenantId, table.memberId),
    statusIdx: index("payments_status_idx").on(table.tenantId, table.status),
  }),
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
