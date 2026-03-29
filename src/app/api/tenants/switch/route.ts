import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import {
  jsonError,
  jsonWithSession,
  validateJsonMutation,
} from "@/lib/auth-api";

type SwitchTenantBody = {
  tenantId?: string;
};

export async function POST(request: Request) {
  const auth = await requireAuth({ requireOrg: false });
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as SwitchTenantBody;
  const tenantId = body.tenantId?.trim() ?? "";

  if (!tenantId) {
    return jsonError(400, "Tenant selection is required");
  }

  const [membership] = await db
    .select({
      tenantId: staffMemberships.tenantId,
      role: staffMemberships.role,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.userId, auth.userId),
        eq(staffMemberships.tenantId, tenantId),
        eq(staffMemberships.status, "active"),
      ),
    )
    .limit(1);

  if (!membership) {
    return jsonError(403, "You do not have access to that gym");
  }

  return jsonWithSession(
    { ok: true },
    {
      userId: auth.userId,
      tenantId: membership.tenantId,
      role: membership.role,
      tokenVersion: auth.tokenVersion,
    },
  );
}
