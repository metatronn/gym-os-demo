import { and, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { staffMemberships, users } from "@/db/schema";
import {
  AUTH_ROLE_HEADER,
  AUTH_TENANT_ID_HEADER,
  AUTH_TOKEN_VERSION_HEADER,
  AUTH_USER_ID_HEADER,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-session";
import { setSentryContext } from "@/lib/sentry";

type AuthContext = {
  userId: string | null;
  orgId: string | null;
  orgRole: string | null;
  tokenVersion: number | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  const requestHeaders = headers();
  const headerUserId = requestHeaders.get(AUTH_USER_ID_HEADER);
  const headerTokenVersion = requestHeaders.get(AUTH_TOKEN_VERSION_HEADER);

  if (headerUserId && headerTokenVersion) {
    const tokenVersion = Number(headerTokenVersion);

    if (!Number.isNaN(tokenVersion)) {
      return {
        userId: headerUserId,
        orgId: requestHeaders.get(AUTH_TENANT_ID_HEADER),
        orgRole: requestHeaders.get(AUTH_ROLE_HEADER),
        tokenVersion,
      };
    }
  }

  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      tokenVersion: null,
    };
  }

  const payload = await verifySessionToken(sessionToken);

  if (!payload) {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      tokenVersion: null,
    };
  }

  return {
    userId: payload.sub,
    orgId: payload.tid ?? null,
    orgRole: payload.role ?? null,
    tokenVersion: payload.ver,
  };
}

export async function requireAuth(options: { requireOrg: false }): Promise<{
  userId: string;
  orgId: string | null;
  orgRole: string | null;
  tokenVersion: number;
}>;
export async function requireAuth(options?: { requireOrg?: true }): Promise<{
  userId: string;
  orgId: string;
  orgRole: string | null;
  tokenVersion: number;
}>;
export async function requireAuth(options?: { requireOrg?: boolean }) {
  const { userId, orgId, tokenVersion } = await getAuthContext();

  if (!userId || tokenVersion === null) {
    redirect("/sign-in");
  }

  const [user] = await db
    .select({
      id: users.id,
      tokenVersion: users.tokenVersion,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.tokenVersion !== tokenVersion) {
    redirect("/sign-in");
  }

  if (!orgId) {
    if (options?.requireOrg === false) {
      return {
        userId,
        orgId: null,
        orgRole: null,
        tokenVersion: user.tokenVersion,
      };
    }

    redirect("/onboarding");
  }

  const [membership] = await db
    .select({
      role: staffMemberships.role,
      status: staffMemberships.status,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.userId, userId),
        eq(staffMemberships.tenantId, orgId),
      ),
    )
    .limit(1);

  if (!membership || membership.status !== "active") {
    if (options?.requireOrg === false) {
      return {
        userId,
        orgId: null,
        orgRole: null,
        tokenVersion: user.tokenVersion,
      };
    }

    redirect("/onboarding");
  }

  setSentryContext(userId, orgId);

  return {
    userId,
    orgId,
    orgRole: membership.role,
    tokenVersion: user.tokenVersion,
  } as {
    userId: string;
    orgId: string;
    orgRole: string | null;
    tokenVersion: number;
  };
}

export async function requireAdmin() {
  const authContext = await requireAuth();

  if (authContext.orgRole !== "org:admin") {
    throw new Error("Admin access required");
  }

  return authContext;
}
