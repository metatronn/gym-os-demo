import assert from "node:assert/strict";
import test from "node:test";
import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { leadQueries } from "@/db/queries/leads";
import { memberQueries } from "@/db/queries/members";
import { leads, members, tenants } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

type TenantScopedTable = {
  tenantId: AnyPgColumn;
};

function buildTenantContext(tenantId: string): TenantDb {
  return {
    db,
    tenantId,
    userId: `test_user_${tenantId}`,
    tenantFilter<T extends TenantScopedTable>(
      table: T,
      ...conditions: Array<SQL<unknown> | undefined>
    ) {
      const scopedConditions = conditions.filter(
        (condition): condition is SQL<unknown> => Boolean(condition),
      );

      if (scopedConditions.length === 0) {
        return eq(table.tenantId, tenantId);
      }

      return and(eq(table.tenantId, tenantId), ...scopedConditions);
    },
  };
}

test("tenant-scoped queries do not leak data across gyms", async (t) => {
  try {
    await db.select({ id: tenants.id }).from(tenants).limit(1);
  } catch (error) {
    t.skip(
      `Database unavailable for tenant isolation test: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return;
  }

  const tenantAId = `test_org_a_${Date.now()}`;
  const tenantBId = `test_org_b_${Date.now()}`;
  const memberAId = `test_member_a_${Date.now()}`;
  const memberBId = `test_member_b_${Date.now()}`;
  const leadAId = `test_lead_a_${Date.now()}`;
  const leadBId = `test_lead_b_${Date.now()}`;

  await db.insert(tenants).values([
    {
      id: tenantAId,
      name: "Tenant Alpha",
      slug: `tenant-alpha-${Date.now()}`,
    },
    {
      id: tenantBId,
      name: "Tenant Beta",
      slug: `tenant-beta-${Date.now()}`,
    },
  ]);

  await db.insert(members).values([
    {
      id: memberAId,
      tenantId: tenantAId,
      name: "Alpha Member",
      email: "alpha-member@test.local",
      plan: "Premium",
      status: "active",
      billingStatus: "current",
      riskScore: 22,
      riskLevel: "low",
    },
    {
      id: memberBId,
      tenantId: tenantBId,
      name: "Beta Member",
      email: "beta-member@test.local",
      plan: "Basic",
      status: "active",
      billingStatus: "current",
      riskScore: 71,
      riskLevel: "high",
    },
  ]);

  await db.insert(leads).values([
    {
      id: leadAId,
      tenantId: tenantAId,
      name: "Alpha Lead",
      status: "new",
      source: "Website",
    },
    {
      id: leadBId,
      tenantId: tenantBId,
      name: "Beta Lead",
      status: "new",
      source: "Google",
    },
  ]);

  try {
    const tenantAMembers = await memberQueries(
      buildTenantContext(tenantAId),
    ).list();
    const tenantALeads = await leadQueries(
      buildTenantContext(tenantAId),
    ).list();

    assert.equal(
      tenantAMembers.some((member) => member.id === memberBId),
      false,
    );
    assert.equal(
      tenantALeads.some((lead) => lead.id === leadBId),
      false,
    );

    const crossTenantMember = await memberQueries(
      buildTenantContext(tenantAId),
    ).getById(memberBId);

    assert.equal(crossTenantMember, null);

    const blockedUpdate = await memberQueries(
      buildTenantContext(tenantAId),
    ).update(memberBId, {
      name: "Should Not Update",
    });

    assert.equal(blockedUpdate, null);

    await memberQueries(buildTenantContext(tenantAId)).delete(memberBId);

    const [memberB] = await db
      .select({ id: members.id, name: members.name })
      .from(members)
      .where(eq(members.id, memberBId))
      .limit(1);

    assert.equal(memberB?.name, "Beta Member");
  } finally {
    await db.delete(leads).where(eq(leads.id, leadAId));
    await db.delete(leads).where(eq(leads.id, leadBId));
    await db.delete(members).where(eq(members.id, memberAId));
    await db.delete(members).where(eq(members.id, memberBId));
    await db.delete(tenants).where(eq(tenants.id, tenantAId));
    await db.delete(tenants).where(eq(tenants.id, tenantBId));
  }
});
