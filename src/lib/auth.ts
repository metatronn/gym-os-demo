import { and, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { staffMemberships, users } from "@/db/schema";
import {
  AUTH_ROLE_HEADER,
  AUTH_SESSION_ID_HEADER,
  AUTH_TENANT_ID_HEADER,
  AUTH_TOKEN_VERSION_HEADER,
  AUTH_USER_ID_HEADER,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-session";
import { touchAuthSession, validateAuthSession } from "@/lib/auth-store";
import { setSentryContext } from "@/lib/sentry";

type AuthContext = {
  userId: string | null;
  orgId: string | null;
  orgRole: string | null;
  tokenVersion: number | null;
  sessionId: string | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  const requestHeaders = headers();
  const headerUserId = requestHeaders.get(AUTH_USER_ID_HEADER);
  const headerTokenVersion = requestHeaders.get(AUTH_TOKEN_VERSION_HEADER);
  const headerSessionId = requestHeaders.get(AUTH_SESSION_ID_HEADER);

  if (headerUserId && headerTokenVersion) {
    const tokenVersion = Number(headerTokenVersion);

    if (!Number.isNaN(tokenVersion)) {
      const [user] = await db
        .select({
          id: users.id,
          tokenVersion: users.tokenVersion,
        })
        .from(users)
        .where(eq(users.id, headerUserId))
        .limit(1);

      if (!user || user.tokenVersion !== tokenVersion) {
        return {
          userId: null,
          orgId: null,
          orgRole: null,
          tokenVersion: null,
          sessionId: null,
        };
      }

      if (headerSessionId) {
        const sessionValid = await validateAuthSession(
          headerSessionId,
          headerUserId,
          tokenVersion,
        );

        if (!sessionValid) {
          return {
            userId: null,
            orgId: null,
            orgRole: null,
            tokenVersion: null,
            sessionId: null,
          };
        }
      }

      return {
        userId: headerUserId,
        orgId: requestHeaders.get(AUTH_TENANT_ID_HEADER),
        orgRole: requestHeaders.get(AUTH_ROLE_HEADER),
        tokenVersion,
        sessionId: headerSessionId,
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
      sessionId: null,
    };
  }

  const payload = await verifySessionToken(sessionToken);

  if (!payload) {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      tokenVersion: null,
      sessionId: null,
    };
  }

  const [user] = await db
    .select({
      id: users.id,
      tokenVersion: users.tokenVersion,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user || user.tokenVersion !== payload.ver) {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      tokenVersion: null,
      sessionId: null,
    };
  }

  if (payload.sid) {
    const sessionValid = await validateAuthSession(
      payload.sid,
      payload.sub,
      payload.ver,
    );

    if (!sessionValid) {
      return {
        userId: null,
        orgId: null,
        orgRole: null,
        tokenVersion: null,
        sessionId: null,
      };
    }
  }

  return {
    userId: payload.sub,
    orgId: payload.tid ?? null,
    orgRole: payload.role ?? null,
    tokenVersion: payload.ver,
    sessionId: payload.sid ?? null,
  };
}

export async function requireAuth(options: { requireOrg: false }): Promise<{
  userId: string;
  orgId: string | null;
  orgRole: string | null;
  tokenVersion: number;
  sessionId: string | null;
}>;
export async function requireAuth(options?: { requireOrg?: true }): Promise<{
  userId: string;
  orgId: string;
  orgRole: string | null;
  tokenVersion: number;
  sessionId: string | null;
}>;
export async function requireAuth(options?: { requireOrg?: boolean }) {
  const { userId, orgId, tokenVersion, sessionId } = await getAuthContext();

  if (!userId || tokenVersion === null) {
    redirect("/sign-in");
  }

  if (!orgId) {
    if (options?.requireOrg === false) {
      return {
        userId,
        orgId: null,
        orgRole: null,
        tokenVersion,
        sessionId,
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
        tokenVersion,
        sessionId,
      };
    }

    redirect("/onboarding");
  }

  setSentryContext(userId, orgId);

  if (sessionId) {
    await touchAuthSession(sessionId, {
      tenantId: orgId,
      role: membership.role,
      tokenVersion,
    });
  }

  return {
    userId,
    orgId,
    orgRole: membership.role,
    tokenVersion,
    sessionId,
  } as {
    userId: string;
    orgId: string;
    orgRole: string | null;
    tokenVersion: number;
    sessionId: string | null;
  };
}

export async function requireAdmin() {
  const authContext = await requireAuth();

  if (authContext.orgRole !== "org:admin") {
    throw new Error("Admin access required");
  }

  return authContext;
}
