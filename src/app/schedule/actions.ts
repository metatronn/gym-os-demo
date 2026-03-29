"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { classQueries } from "@/db/queries/classes";
import { tenantDb } from "@/db/tenant";
import type { ClassSession } from "@/db/schema/classes";

type CreateClassInput = {
  name: string;
  instructor?: string | null;
  dayOfWeek?: string | null;
  time?: string | null;
  duration?: number | null;
  capacity?: number | null;
  enrolled?: number;
  waitlist?: number;
  type?: ClassSession["type"];
};

type UpdateClassInput = Partial<CreateClassInput>;

export async function getSchedule() {
  const tenant = await tenantDb();
  return classQueries(tenant).list();
}

export async function getScheduleByDay() {
  const tenant = await tenantDb();
  return classQueries(tenant).listByDay();
}

export async function createClass(data: CreateClassInput) {
  const tenant = await tenantDb();
  const id = `class-${crypto.randomUUID()}`;

  const result = await classQueries(tenant).create({
    id,
    name: data.name,
    instructor: data.instructor ?? null,
    dayOfWeek: data.dayOfWeek ?? null,
    time: data.time ?? null,
    duration: data.duration ?? null,
    capacity: data.capacity ?? null,
    enrolled: data.enrolled ?? 0,
    waitlist: data.waitlist ?? 0,
    type: data.type ?? null,
  });

  revalidatePath("/schedule");
  return result;
}

export async function updateClass(id: string, data: UpdateClassInput) {
  const tenant = await tenantDb();
  const result = await classQueries(tenant).update(id, data);

  revalidatePath("/schedule");
  return result;
}

export async function deleteClass(id: string) {
  const tenant = await tenantDb();
  await classQueries(tenant).delete(id);

  revalidatePath("/schedule");
}
