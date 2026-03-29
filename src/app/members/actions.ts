"use server";

import { memberQueries, type MemberFilters } from "@/db/queries/members";
import { tenantDb } from "@/db/tenant";
import { revalidatePath } from "next/cache";

export async function getMembers(filters?: MemberFilters) {
  const tenant = await tenantDb();
  return memberQueries(tenant).list(filters);
}

export async function getMemberCounts() {
  const tenant = await tenantDb();
  const q = memberQueries(tenant);

  const [total, active, trial, frozen, cancelled, atRisk] = await Promise.all([
    q.count(),
    q.count({ status: "active" }),
    q.count({ status: "trial" }),
    q.count({ status: "frozen" }),
    q.count({ status: "cancelled" }),
    // "at risk" = high + critical; we run two counts and sum
    Promise.all([q.list({ status: undefined })]).then(
      async ([all]) =>
        all.filter((m) => m.riskLevel === "high" || m.riskLevel === "critical")
          .length,
    ),
  ]);

  return { total, active, trial, frozen, cancelled, atRisk };
}

export async function getMember(id: string) {
  const tenant = await tenantDb();
  return memberQueries(tenant).getById(id);
}

const VALID_PLANS = new Set(["Premium", "Unlimited", "Basic", "Trial"]);
const VALID_STATUSES = new Set(["active", "frozen", "cancelled", "trial"]);

export async function createMember(data: {
  name: string;
  email: string;
  phone?: string;
  plan?: "Premium" | "Unlimited" | "Basic" | "Trial";
  status?: "active" | "frozen" | "cancelled" | "trial";
  notes?: string;
  tags?: string[];
}) {
  const name = String(data.name ?? "").trim();
  if (!name || name.length > 200) throw new Error("Invalid name");
  const email = String(data.email ?? "").trim();
  if (!email || !email.includes("@") || email.length > 320)
    throw new Error("Invalid email");
  if (data.plan && !VALID_PLANS.has(data.plan)) throw new Error("Invalid plan");
  if (data.status && !VALID_STATUSES.has(data.status))
    throw new Error("Invalid status");

  const tenant = await tenantDb();
  const member = await memberQueries(tenant).create({
    id: `mem-${crypto.randomUUID().slice(0, 8)}`,
    ...data,
    name,
    email,
  });
  revalidatePath("/members");
  revalidatePath("/dashboard");
  return member;
}

export async function updateMember(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    status: "active" | "frozen" | "cancelled" | "trial";
    plan: "Premium" | "Unlimited" | "Basic" | "Trial";
    notes: string;
    tags: string[];
  }>,
) {
  if (data.name !== undefined) {
    data.name = String(data.name).trim();
    if (!data.name || data.name.length > 200) throw new Error("Invalid name");
  }
  if (data.email !== undefined) {
    data.email = String(data.email).trim();
    if (!data.email || !data.email.includes("@") || data.email.length > 320)
      throw new Error("Invalid email");
  }
  if (data.plan && !VALID_PLANS.has(data.plan)) throw new Error("Invalid plan");
  if (data.status && !VALID_STATUSES.has(data.status))
    throw new Error("Invalid status");

  const tenant = await tenantDb();
  const member = await memberQueries(tenant).update(id, data);
  revalidatePath("/members");
  revalidatePath("/dashboard");
  return member;
}

export async function deleteMember(id: string) {
  const tenant = await tenantDb();
  await memberQueries(tenant).delete(id);
  revalidatePath("/members");
  revalidatePath("/dashboard");
}
