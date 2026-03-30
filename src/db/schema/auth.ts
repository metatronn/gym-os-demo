import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenIdx: index("email_verifications_token_idx").on(table.token),
    userIdx: index("email_verifications_user_idx").on(table.userId),
  }),
);

export const passwordResets = pgTable(
  "password_resets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenIdx: index("password_resets_token_idx").on(table.token),
    userIdx: index("password_resets_user_idx").on(table.userId),
  }),
);

export const authActivityTypeEnum = pgEnum("auth_activity_type", [
  "sign-in",
  "sign-up",
  "invite-accepted",
  "password-reset",
  "password-changed",
  "sign-out",
  "tenant-switch",
  "tenant-created",
]);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    role: text("role"),
    tokenVersion: integer("token_version").notNull().default(0),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("auth_sessions_user_idx").on(table.userId),
    activeIdx: index("auth_sessions_active_idx").on(
      table.userId,
      table.tokenVersion,
      table.revokedAt,
    ),
    expiresIdx: index("auth_sessions_expires_idx").on(table.expiresAt),
  }),
);

export const authActivity = pgTable(
  "auth_activity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),
    type: authActivityTypeEnum("type").notNull(),
    description: text("description").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("auth_activity_user_idx").on(table.userId, table.createdAt),
    tenantIdx: index("auth_activity_tenant_idx").on(
      table.tenantId,
      table.createdAt,
    ),
  }),
);

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;

export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export type AuthActivity = typeof authActivity.$inferSelect;
export type NewAuthActivity = typeof authActivity.$inferInsert;
