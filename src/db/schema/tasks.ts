import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const taskPriorityEnum = pgEnum("task_priority", [
  "high",
  "medium",
  "low",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "done",
]);
export const taskCategoryEnum = pgEnum("task_category", [
  "follow-up",
  "billing",
  "operations",
  "coaching",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    assignedTo: text("assigned_to"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    status: taskStatusEnum("status").notNull().default("todo"),
    category: taskCategoryEnum("category"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index("tasks_tenant_idx").on(table.tenantId),
    statusIdx: index("tasks_status_idx").on(table.tenantId, table.status),
    dueDateIdx: index("tasks_due_date_idx").on(table.tenantId, table.dueDate),
  }),
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
