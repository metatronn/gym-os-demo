import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships, tenants, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth({ requireOrg: false });

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  const memberships = await db
    .select({
      id: staffMemberships.id,
      tenantId: staffMemberships.tenantId,
      tenantName: tenants.name,
      role: staffMemberships.role,
    })
    .from(staffMemberships)
    .innerJoin(tenants, eq(staffMemberships.tenantId, tenants.id))
    .where(
      and(
        eq(staffMemberships.userId, auth.userId),
        eq(staffMemberships.status, "active"),
      ),
    )
    .orderBy(asc(tenants.name));

  const activeTenant =
    memberships.find((membership) => membership.tenantId === auth.orgId) ??
    null;

  return Response.json({
    user,
    activeTenant,
    memberships,
  });
}
