import { and, desc, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { authActivity, authActivityTypeEnum, authSessions } from "@/db/schema";
import {
  SESSION_TTL_SECONDS,
  createSessionToken,
  getSessionTokenFromRequest,
  verifySessionToken,
} from "@/lib/auth-session";
import { createId } from "@/lib/auth-utils";

type AuthActivityType = (typeof authActivityTypeEnum.enumValues)[number];

type RequestLike = Request | null | undefined;

type SessionInput = {
  userId: string;
  tenantId?: string | null;
  role?: string | null;
  tokenVersion: number;
  request?: RequestLike;
  currentSessionId?: string | null;
  reuseCurrentSession?: boolean;
};

type AuthActivityInput = {
  userId: string;
  tenantId?: string | null;
  type: AuthActivityType;
  description: string;
  request?: RequestLike;
};

function readRequestMetadata(request?: RequestLike) {
  const requestHeaders = request?.headers ?? headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 500) ?? null;

  return {
    ipAddress,
    userAgent,
  };
}

export async function issueAuthSession(input: SessionInput) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const { ipAddress, userAgent } = readRequestMetadata(input.request);

  let sessionId: string | null = null;

  if (input.currentSessionId) {
    sessionId = input.currentSessionId;
  }

  if (!sessionId && input.reuseCurrentSession && input.request) {
    const currentToken = getSessionTokenFromRequest(input.request);
    const payload = currentToken
      ? await verifySessionToken(currentToken)
      : null;

    if (payload?.sub === input.userId && payload.sid) {
      const [existing] = await db
        .select({ id: authSessions.id })
        .from(authSessions)
        .where(
          and(
            eq(authSessions.id, payload.sid),
            eq(authSessions.userId, input.userId),
          ),
        )
        .limit(1);

      if (existing) {
        sessionId = existing.id;
      }
    }
  }

  if (!sessionId) {
    sessionId = createId("sess");

    await db.insert(authSessions).values({
      id: sessionId,
      userId: input.userId,
      tenantId: input.tenantId ?? null,
      role: input.role ?? null,
      tokenVersion: input.tokenVersion,
      ipAddress,
      userAgent,
      lastSeenAt: now,
      expiresAt,
    });
  } else {
    await db
      .update(authSessions)
      .set({
        tenantId: input.tenantId ?? null,
        role: input.role ?? null,
        tokenVersion: input.tokenVersion,
        ipAddress,
        userAgent,
        lastSeenAt: now,
        expiresAt,
        revokedAt: null,
      })
      .where(eq(authSessions.id, sessionId));
  }

  const token = await createSessionToken({
    userId: input.userId,
    tenantId: input.tenantId ?? null,
    role: input.role ?? null,
    tokenVersion: input.tokenVersion,
    sessionId,
  });

  return {
    sessionId,
    token,
    expiresAt,
  };
}

export async function touchAuthSession(
  sessionId: string,
  updates: Pick<SessionInput, "tenantId" | "role" | "tokenVersion">,
) {
  const now = new Date();
  const refreshThreshold = new Date(now.getTime() - 5 * 60 * 1000);

  await db
    .update(authSessions)
    .set({
      tenantId: updates.tenantId ?? null,
      role: updates.role ?? null,
      tokenVersion: updates.tokenVersion,
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000),
    })
    .where(
      and(
        eq(authSessions.id, sessionId),
        isNull(authSessions.revokedAt),
        lt(authSessions.lastSeenAt, refreshThreshold),
      ),
    );
}

export async function revokeAuthSession(sessionId: string) {
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(eq(authSessions.id, sessionId));
}

export async function revokeOtherAuthSessions(
  userId: string,
  currentSessionId: string | null,
) {
  const conditions = [
    eq(authSessions.userId, userId),
    isNull(authSessions.revokedAt),
  ];

  if (currentSessionId) {
    conditions.push(ne(authSessions.id, currentSessionId));
  }

  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(...conditions));
}

export async function validateAuthSession(
  sessionId: string,
  userId: string,
  tokenVersion: number,
) {
  const [session] = await db
    .select({ id: authSessions.id })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.id, sessionId),
        eq(authSessions.userId, userId),
        eq(authSessions.tokenVersion, tokenVersion),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return Boolean(session);
}

export async function listActiveAuthSessions(
  userId: string,
  tokenVersion: number,
) {
  return db
    .select()
    .from(authSessions)
    .where(
      and(
        eq(authSessions.userId, userId),
        eq(authSessions.tokenVersion, tokenVersion),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(authSessions.lastSeenAt));
}

export async function recordAuthActivity(input: AuthActivityInput) {
  const { ipAddress, userAgent } = readRequestMetadata(input.request);

  await db.insert(authActivity).values({
    id: createId("authact"),
    userId: input.userId,
    tenantId: input.tenantId ?? null,
    type: input.type,
    description: input.description,
    ipAddress,
    userAgent,
  });
}

export async function listRecentAuthActivity(userId: string, limit = 10) {
  return db
    .select()
    .from(authActivity)
    .where(eq(authActivity.userId, userId))
    .orderBy(desc(authActivity.createdAt))
    .limit(limit);
}
