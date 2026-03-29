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

export async function createMember(data: {
  name: string;
  email: string;
  phone?: string;
  plan?: "Premium" | "Unlimited" | "Basic" | "Trial";
  status?: "active" | "frozen" | "cancelled" | "trial";
  notes?: string;
  tags?: string[];
}) {
  const tenant = await tenantDb();
  const member = await memberQueries(tenant).create({
    id: `mem-${crypto.randomUUID().slice(0, 8)}`,
    ...data,
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
