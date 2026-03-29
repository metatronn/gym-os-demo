import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email"),
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
    emailIdx: index("users_email_idx").on(table.email),
    fullNameIdx: index("users_full_name_idx").on(table.fullName),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
