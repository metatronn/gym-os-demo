import { requireAuth } from "@/lib/auth";
import { jsonError, validateJsonMutation } from "@/lib/auth-api";
import { inviteStaffMember } from "@/lib/staff-access";
import { isOrgRole } from "@/lib/org-roles";

type InviteBody = {
  email?: string;
  role?: string;
};

export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireAuth();
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  if (auth.orgRole !== "org:admin") {
    return jsonError(403, "Admin access required");
  }

  if (auth.orgId !== context.params.id) {
    return jsonError(403, "Invite requests must target your active gym");
  }

  const body = (await request.json()) as InviteBody;
  const email = body.email?.trim() ?? "";
  const role = body.role?.trim() ?? "org:staff";

  if (!isOrgRole(role)) {
    return jsonError(400, "Choose a valid staff role");
  }

  try {
    await inviteStaffMember({
      tenantId: auth.orgId,
      invitedByUserId: auth.userId,
      email,
      role,
      baseUrl: request.url,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(
      400,
      error instanceof Error ? error.message : "Failed to send staff invite",
    );
  }
}
