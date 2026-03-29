"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { activityQueries } from "@/db/queries/activity";
import { taskQueries, type TaskFilters } from "@/db/queries/tasks";
import { tenantDb } from "@/db/tenant";

export async function getTasks(filters?: TaskFilters) {
  const tenant = await tenantDb();
  return taskQueries(tenant).list(filters);
}

export async function getTaskCountByStatus() {
  const tenant = await tenantDb();
  return taskQueries(tenant).countByStatus();
}

export async function createTask(data: {
  title: string;
  assignedTo?: string | null;
  dueDate?: Date | null;
  priority?: "high" | "medium" | "low";
  status?: "todo" | "in-progress" | "done";
  category?: "follow-up" | "billing" | "operations" | "coaching" | null;
}) {
  const tenant = await tenantDb();
  const id = `task-${crypto.randomUUID()}`;

  const task = await taskQueries(tenant).create({
    id,
    title: data.title,
    assignedTo: data.assignedTo ?? null,
    dueDate: data.dueDate ?? null,
    priority: data.priority ?? "medium",
    status: data.status ?? "todo",
    category: data.category ?? null,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    assignedTo?: string | null;
    dueDate?: Date | null;
    priority?: "high" | "medium" | "low";
    status?: "todo" | "in-progress" | "done";
    category?: "follow-up" | "billing" | "operations" | "coaching" | null;
  },
) {
  const tenant = await tenantDb();
  const queries = taskQueries(tenant);
  const existingTask = await queries.getById(id);
  const task = await taskQueries(tenant).update(id, data);

  if (
    existingTask &&
    task &&
    existingTask.status !== "done" &&
    task.status === "done"
  ) {
    await activityQueries(tenant).create({
      type: "task-completed",
      description: `Completed task: ${task.title}`,
      relatedId: task.id,
      relatedName: task.title,
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return task;
}

export async function deleteTask(id: string) {
  const tenant = await tenantDb();
  await taskQueries(tenant).delete(id);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
