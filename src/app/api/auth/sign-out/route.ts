import { jsonSignedOut, validateJsonMutation } from "@/lib/auth-api";
import { revokeAuthSession, recordAuthActivity } from "@/lib/auth-store";
import {
  getSessionTokenFromRequest,
  verifySessionToken,
} from "@/lib/auth-session";

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const token = getSessionTokenFromRequest(request);
  const payload = token ? await verifySessionToken(token) : null;

  if (payload?.sid) {
    await revokeAuthSession(payload.sid);
  }

  if (payload?.sub) {
    await recordAuthActivity({
      userId: payload.sub,
      tenantId: payload.tid ?? null,
      type: "sign-out",
      description: "Signed out of GYM OS",
      request,
    });
  }

  return jsonSignedOut();
}
