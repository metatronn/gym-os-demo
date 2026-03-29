import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  CLERK_SIGN_IN_URL,
  IS_CLERK_ENABLED,
  LOCAL_DEV_ORG_ROLE,
  LOCAL_DEV_TENANT_ID,
  LOCAL_DEV_USER_ID,
} from "@/lib/env";

type AuthContext = {
  userId: string | null;
  orgId: string | null;
  orgRole: string | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  if (!IS_CLERK_ENABLED) {
    return {
      userId: LOCAL_DEV_USER_ID,
      orgId: LOCAL_DEV_TENANT_ID,
      orgRole: LOCAL_DEV_ORG_ROLE,
    };
  }

  const session = await auth();

  return {
    userId: session.userId ?? null,
    orgId: session.orgId ?? null,
    orgRole: session.orgRole ?? null,
  };
}

export async function requireAuth(options?: { requireOrg?: boolean }) {
  const { userId, orgId, orgRole } = await getAuthContext();

  if (!userId) {
    redirect(CLERK_SIGN_IN_URL);
  }

  if (options?.requireOrg !== false && !orgId) {
    redirect("/onboarding");
  }

  return {
    userId,
    orgId: orgId!,
    orgRole,
  };
}

export async function requireAdmin() {
  const authContext = await requireAuth();

  if (authContext.orgRole !== "org:admin") {
    throw new Error("Admin access required");
  }

  return authContext;
}
