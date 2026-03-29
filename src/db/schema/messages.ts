import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const messageChannelEnum = pgEnum("message_channel", ["sms", "email"]);
export const contactTypeEnum = pgEnum("contact_type", ["member", "lead"]);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    contactName: text("contact_name").notNull(),
    contactType: contactTypeEnum("contact_type"),
    channel: messageChannelEnum("channel"),
    lastMessage: text("last_message"),
    unread: boolean("unread").notNull().default(false),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("messages_tenant_idx").on(table.tenantId),
    unreadIdx: index("messages_unread_idx").on(table.tenantId, table.unread),
    channelIdx: index("messages_channel_idx").on(table.tenantId, table.channel),
  }),
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
