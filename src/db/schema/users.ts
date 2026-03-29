import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    legacyClerkId: text("legacy_clerk_id").unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    tokenVersion: integer("token_version").notNull().default(0),
    firstName: text("first_name"),
    lastName: text("last_name"),
    fullName: text("full_name"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    fullNameIdx: index("users_full_name_idx").on(table.fullName),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
