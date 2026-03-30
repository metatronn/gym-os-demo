"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import {
  issueAuthSession,
  listActiveAuthSessions,
  listRecentAuthActivity,
  recordAuthActivity,
  revokeOtherAuthSessions,
} from "@/lib/auth-store";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth-session";
import {
  listStripeMembershipPlans,
  type StripeMembershipPlan,
} from "@/lib/billing";
import { NEXT_PUBLIC_APP_URL, IS_STRIPE_ENABLED } from "@/lib/env";
import { isValidPassword } from "@/lib/auth-utils";
import { type OrgRole, isOrgRole } from "@/lib/org-roles";
import { sendSlackNotification } from "@/lib/slack";
import {
  inviteStaffMember,
  listTenantStaffMembers,
  revokeStaffMembership,
  updateStaffRole,
} from "@/lib/staff-access";

export type NotificationSettings = {
  dailyDigest: boolean;
  paymentAlerts: boolean;
  leadNotifications: boolean;
  atRiskAlerts: boolean;
  followUpSms: boolean;
  classReminders: boolean;
};

export type MembershipPlan = StripeMembershipPlan;

export type StaffMember = Awaited<
  ReturnType<typeof listTenantStaffMembers>
>[number];

export type SecuritySession = {
  id: string;
  role: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
};

export type SecurityActivity = {
  id: string;
  type: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type SettingsData = {
  tenant: {
    id: string;
    name: string;
    slug: string | null;
    logoUrl: string | null;
  };
  notifications: NotificationSettings;
  integrations: {
    stripeConnected: boolean;
    stripeCustomerId: string | null;
    slackConnected: boolean;
    slackWebhookUrl: string | null;
    stripeEnabled: boolean;
  };
  subscription: {
    status: string;
    trialEndsAt: string | null;
  };
  plans: MembershipPlan[];
  staff: StaffMember[];
  security: {
    sessions: SecuritySession[];
    activity: SecurityActivity[];
  };
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyDigest: false,
  paymentAlerts: true,
  leadNotifications: true,
  atRiskAlerts: true,
  followUpSms: true,
  classReminders: true,
};

const NOTIFICATION_KEYS: Array<keyof NotificationSettings> = [
  "dailyDigest",
  "paymentAlerts",
  "leadNotifications",
  "atRiskAlerts",
  "followUpSms",
  "classReminders",
];

function parseNotifications(
  settings: Record<string, unknown>,
): NotificationSettings {
  const notifications = settings.notifications as
    | Partial<NotificationSettings>
    | undefined;

  return {
    dailyDigest:
      notifications?.dailyDigest ?? DEFAULT_NOTIFICATIONS.dailyDigest,
    paymentAlerts:
      notifications?.paymentAlerts ?? DEFAULT_NOTIFICATIONS.paymentAlerts,
    leadNotifications:
      notifications?.leadNotifications ??
      DEFAULT_NOTIFICATIONS.leadNotifications,
    atRiskAlerts:
      notifications?.atRiskAlerts ?? DEFAULT_NOTIFICATIONS.atRiskAlerts,
    followUpSms:
      notifications?.followUpSms ?? DEFAULT_NOTIFICATIONS.followUpSms,
    classReminders:
      notifications?.classReminders ?? DEFAULT_NOTIFICATIONS.classReminders,
  };
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeLogoUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new URL(trimmed);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Logo URL must use http or https");
  }

  return parsed.toString();
}

function resolveBaseUrl() {
  const requestHeaders = headers();
  const origin = requestHeaders.get("origin");

  if (origin) {
    return origin;
  }

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  return NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function validateNotificationSettings(input: NotificationSettings) {
  for (const key of NOTIFICATION_KEYS) {
    if (typeof input[key] !== "boolean") {
      throw new Error("Notification settings must be booleans");
    }
  }

  return input;
}

function toSecuritySessions(
  sessions: Awaited<ReturnType<typeof listActiveAuthSessions>>,
  currentSessionId: string | null,
): SecuritySession[] {
  return sessions.map((session) => ({
    id: session.id,
    role: session.role,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt.toISOString(),
    lastSeenAt: session.lastSeenAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    current: session.id === currentSessionId,
  }));
}

function toSecurityActivity(
  activity: Awaited<ReturnType<typeof listRecentAuthActivity>>,
): SecurityActivity[] {
  return activity.map((entry) => ({
    id: entry.id,
    type: entry.type,
    description: entry.description,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    createdAt: entry.createdAt.toISOString(),
  }));
}

export async function getSettingsData(): Promise<SettingsData> {
  const auth = await requireAdmin();

  const [tenant, plans, staff, sessions, activity] = await Promise.all([
    db
      .select()
      .from(tenants)
      .where(eq(tenants.id, auth.orgId))
      .then((rows) => rows[0] ?? null),
    listStripeMembershipPlans(),
    listTenantStaffMembers(auth.orgId, auth.userId),
    listActiveAuthSessions(auth.userId, auth.tokenVersion),
    listRecentAuthActivity(auth.userId),
  ]);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const settings = (tenant.settings ?? {}) as Record<string, unknown>;

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logoUrl: tenant.logoUrl,
    },
    notifications: parseNotifications(settings),
    integrations: {
      stripeConnected: Boolean(tenant.stripeCustomerId),
      stripeCustomerId: tenant.stripeCustomerId,
      slackConnected: Boolean(tenant.slackWebhookUrl),
      slackWebhookUrl: tenant.slackWebhookUrl,
      stripeEnabled: IS_STRIPE_ENABLED,
    },
    subscription: {
      status: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
    },
    plans,
    staff,
    security: {
      sessions: toSecuritySessions(sessions, auth.sessionId),
      activity: toSecurityActivity(activity),
    },
  };
}

export async function updateGymProfile(input: {
  name: string;
  slug: string;
  logoUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();
    const name = input.name.trim();
    const slug = normalizeSlug(input.slug);
    const logoUrl = normalizeLogoUrl(input.logoUrl);

    if (!name) {
      throw new Error("Gym name is required");
    }

    if (!slug) {
      throw new Error("Slug is required");
    }

    const existing = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug));

    if (existing.some((tenant) => tenant.id !== auth.orgId)) {
      throw new Error("This slug is already in use");
    }

    await db
      .update(tenants)
      .set({
        name,
        slug,
        logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, auth.orgId));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save profile",
    };
  }
}

export async function updateNotificationSettings(
  notifications: NotificationSettings,
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();
    const validated = validateNotificationSettings(notifications);

    const [tenant] = await db
      .select({ settings: tenants.settings })
      .from(tenants)
      .where(eq(tenants.id, auth.orgId));

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const currentSettings = (tenant.settings ?? {}) as Record<string, unknown>;

    await db
      .update(tenants)
      .set({
        settings: { ...currentSettings, notifications: validated },
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, auth.orgId));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update notifications",
    };
  }
}

export async function updateSlackWebhook(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();
    const trimmed = url.trim();

    if (trimmed) {
      const parsed = new URL(trimmed);

      if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== "hooks.slack.com"
      ) {
        throw new Error("Use a valid Slack webhook URL");
      }
    }

    await db
      .update(tenants)
      .set({
        slackWebhookUrl: trimmed || null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, auth.orgId));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save Slack webhook",
    };
  }
}

export async function testSlackWebhook(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await requireAdmin();

    const [tenant] = await db
      .select({ slackWebhookUrl: tenants.slackWebhookUrl })
      .from(tenants)
      .where(eq(tenants.id, auth.orgId));

    if (!tenant?.slackWebhookUrl) {
      throw new Error("No Slack webhook URL configured");
    }

    const ok = await sendSlackNotification(tenant.slackWebhookUrl, {
      text: "GYM OS test notification -- your Slack integration is working!",
    });

    if (!ok) {
      throw new Error("Failed to send test message");
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send test message",
    };
  }
}

export async function inviteStaff(input: {
  email: string;
  role: OrgRole;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();

    await inviteStaffMember({
      tenantId: auth.orgId,
      invitedByUserId: auth.userId,
      email: input.email,
      role: input.role,
      baseUrl: resolveBaseUrl(),
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send staff invite",
    };
  }
}

export async function changeStaffRole(input: {
  membershipId: string;
  role: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();

    if (!isOrgRole(input.role)) {
      throw new Error("Choose a valid staff role");
    }

    await updateStaffRole({
      tenantId: auth.orgId,
      membershipId: input.membershipId,
      actingUserId: auth.userId,
      role: input.role,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update staff role",
    };
  }
}

export async function removeStaffMember(input: {
  membershipId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();

    await revokeStaffMembership({
      tenantId: auth.orgId,
      membershipId: input.membershipId,
      actingUserId: auth.userId,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove teammate",
    };
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();
    const currentPassword = input.currentPassword;
    const newPassword = input.newPassword;

    if (!currentPassword) {
      throw new Error("Current password is required");
    }

    if (!isValidPassword(newPassword)) {
      throw new Error("New password must be at least 8 characters");
    }

    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    if (!user?.passwordHash) {
      throw new Error("No password is set for this account");
    }

    const matches = await compare(currentPassword, user.passwordHash);

    if (!matches) {
      throw new Error("Current password is incorrect");
    }

    const nextTokenVersion = auth.tokenVersion + 1;
    const nextPasswordHash = await hash(newPassword, 12);

    await db
      .update(users)
      .set({
        passwordHash: nextPasswordHash,
        tokenVersion: nextTokenVersion,
        updatedAt: new Date(),
      })
      .where(eq(users.id, auth.userId));

    const { token } = await issueAuthSession({
      userId: auth.userId,
      tenantId: auth.orgId,
      role: auth.orgRole,
      tokenVersion: nextTokenVersion,
      currentSessionId: auth.sessionId,
    });

    cookies().set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    await revokeOtherAuthSessions(auth.userId, auth.sessionId);
    await recordAuthActivity({
      userId: auth.userId,
      tenantId: auth.orgId,
      type: "password-changed",
      description: "Changed account password",
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to change password",
    };
  }
}

export async function signOutOtherSessions(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const auth = await requireAdmin();
    const nextTokenVersion = auth.tokenVersion + 1;

    await db
      .update(users)
      .set({
        tokenVersion: nextTokenVersion,
        updatedAt: new Date(),
      })
      .where(eq(users.id, auth.userId));

    const { token } = await issueAuthSession({
      userId: auth.userId,
      tenantId: auth.orgId,
      role: auth.orgRole,
      tokenVersion: nextTokenVersion,
      currentSessionId: auth.sessionId,
    });

    cookies().set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    await revokeOtherAuthSessions(auth.userId, auth.sessionId);
    await recordAuthActivity({
      userId: auth.userId,
      tenantId: auth.orgId,
      type: "sign-out",
      description: "Signed out all other active sessions",
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sign out other sessions",
    };
  }
}
