"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { activityQueries } from "@/db/queries/activity";
import { leadQueries } from "@/db/queries/leads";
import { memberQueries } from "@/db/queries/members";
import { tenantDb } from "@/db/tenant";
import { members } from "@/db/schema";
import type { Lead } from "@/db/schema";
import { eq } from "drizzle-orm";

type LeadFilters = {
  status?: Lead["status"];
  source?: Lead["source"];
  search?: string;
};

type CreateLeadInput = {
  name: string;
  email?: string;
  phone?: string;
  source?: Lead["source"];
  status?: Lead["status"];
  score?: number;
  interest?: string;
  assignedTo?: string;
};

type UpdateLeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  source?: Lead["source"];
  status?: Lead["status"];
  score?: number;
  interest?: string;
  assignedTo?: string;
  lastContact?: Date;
};

export async function getLeads(filters?: LeadFilters) {
  const tenant = await tenantDb();
  return leadQueries(tenant).list(filters);
}

export async function getLead(id: string) {
  const tenant = await tenantDb();
  return leadQueries(tenant).getById(id);
}

export async function createLead(data: CreateLeadInput) {
  const tenant = await tenantDb();
  const id = `lead-${crypto.randomUUID()}`;
  const lead = await leadQueries(tenant).create({ id, ...data });
  await activityQueries(tenant).create({
    type: "lead-new",
    description: `New lead: ${lead.name}${lead.source ? ` from ${lead.source}` : ""}`,
    relatedId: lead.id,
    relatedName: lead.name,
  });
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return lead;
}

export async function updateLead(id: string, data: UpdateLeadInput) {
  const tenant = await tenantDb();
  const queries = leadQueries(tenant);
  const existingLead = await queries.getById(id);

  if (!existingLead) {
    return null;
  }

  if (data.status === "converted") {
    return convertLead(id);
  }

  const lead = await leadQueries(tenant).update(id, data);

  if (lead && data.status && data.status !== existingLead.status) {
    const activity = activityQueries(tenant);
    const descriptions: Partial<Record<Lead["status"], string>> = {
      contacted: `Reached out to ${lead.name}`,
      booked: `${lead.name} booked an intro session`,
      lost: `${lead.name} was marked as lost`,
    };

    const description = descriptions[data.status];

    if (description) {
      await activity.create({
        type: "outreach-sent",
        description,
        relatedId: lead.id,
        relatedName: lead.name,
      });
    }
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return lead;
}

export async function deleteLead(id: string) {
  const tenant = await tenantDb();
  await leadQueries(tenant).delete(id);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function getLeadCounts() {
  const tenant = await tenantDb();
  return leadQueries(tenant).countByStatus();
}

export async function convertLead(id: string) {
  const tenant = await tenantDb();
  const leadQuery = leadQueries(tenant);
  const memberQuery = memberQueries(tenant);
  const activityQuery = activityQueries(tenant);
  const lead = await leadQuery.getById(id);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const fallbackEmail = `converted-${lead.id}@lead.local`;
  const existingMember = lead.email
    ? await tenant.db
        .select()
        .from(members)
        .where(tenant.tenantFilter(members, eq(members.email, lead.email)))
        .then((rows) => rows[0] ?? null)
    : null;

  const member =
    existingMember ??
    (await memberQuery.create({
      id: `mem-${crypto.randomUUID().slice(0, 8)}`,
      name: lead.name,
      email: lead.email ?? fallbackEmail,
      phone: lead.phone ?? null,
      plan: "Trial",
      status: "trial",
      notes: lead.interest
        ? `Converted from lead pipeline. Interest: ${lead.interest}`
        : "Converted from lead pipeline.",
      tags: ["converted-lead"],
    }));

  const updatedLead =
    lead.status === "converted"
      ? lead
      : await leadQuery.update(id, {
          status: "converted",
          lastContact: new Date(),
        });

  await activityQuery.create({
    type: "lead-converted",
    description: `Converted ${lead.name} into a member`,
    relatedId: member.id,
    relatedName: lead.name,
  });

  revalidatePath("/leads");
  revalidatePath("/members");
  revalidatePath("/dashboard");

  return {
    lead: updatedLead,
    member,
  };
}
