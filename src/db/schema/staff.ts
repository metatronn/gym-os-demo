import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const staffStatusEnum = pgEnum("staff_status", [
  "active",
  "invited",
  "revoked",
]);

export const staffMemberships = pgTable(
  "staff_memberships",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("org:staff"),
    email: text("email"),
    name: text("name"),
    status: staffStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("staff_memberships_tenant_idx").on(table.tenantId),
    userIdx: index("staff_memberships_user_idx").on(table.userId),
    roleIdx: index("staff_memberships_role_idx").on(table.tenantId, table.role),
  }),
);

export type StaffMembership = typeof staffMemberships.$inferSelect;
export type NewStaffMembership = typeof staffMemberships.$inferInsert;
