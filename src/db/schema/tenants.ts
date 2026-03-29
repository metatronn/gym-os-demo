import {
  index,
  pgTable,
  jsonb,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    legacyClerkId: text("legacy_clerk_id").unique(),

    name: text("name").notNull(),
    slug: text("slug").unique(),

    // Subscription
    subscriptionStatus: subscriptionStatusEnum("subscription_status")
      .notNull()
      .default("trialing"),
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),

    // Slack integration (per-tenant webhook URL)
    slackWebhookUrl: text("slack_webhook_url"),
    settings: jsonb("settings")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    subscriptionStatusIdx: index("tenants_subscription_status_idx").on(
      table.subscriptionStatus,
    ),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
