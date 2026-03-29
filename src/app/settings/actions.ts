"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sendSlackNotification } from "@/lib/slack";
import { IS_STRIPE_ENABLED } from "@/lib/env";

// ── Types ──

export type NotificationSettings = {
  dailyDigest: boolean;
  paymentAlerts: boolean;
  leadNotifications: boolean;
  atRiskAlerts: boolean;
  followUpSms: boolean;
  classReminders: boolean;
};

export type SettingsData = {
  tenant: {
    id: string;
    name: string;
    slug: string | null;
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
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyDigest: false,
  paymentAlerts: true,
  leadNotifications: true,
  atRiskAlerts: true,
  followUpSms: true,
  classReminders: true,
};

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

// ── Server Actions ──

export async function getSettingsData(): Promise<SettingsData> {
  const { orgId: tenantId } = await requireAdmin();

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const settings = (tenant.settings ?? {}) as Record<string, unknown>;

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
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
  };
}

export async function updateGymProfile(formData: {
  name: string;
  slug: string;
}): Promise<{ success: boolean; error?: string }> {
  const { orgId: tenantId } = await requireAdmin();

  const name = formData.name.trim();
  const slug = formData.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  if (!name) {
    return { success: false, error: "Gym name is required" };
  }

  if (!slug) {
    return { success: false, error: "Slug is required" };
  }

  // Check for slug uniqueness (excluding self)
  const existing = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug));

  if (existing.length > 0 && existing[0].id !== tenantId) {
    return { success: false, error: "This slug is already in use" };
  }

  await db
    .update(tenants)
    .set({
      name,
      slug,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  return { success: true };
}

export async function updateNotificationSettings(
  notifications: NotificationSettings,
): Promise<{ success: boolean; error?: string }> {
  const { orgId: tenantId } = await requireAdmin();

  const [tenant] = await db
    .select({ settings: tenants.settings })
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  if (!tenant) {
    return { success: false, error: "Tenant not found" };
  }

  const currentSettings = (tenant.settings ?? {}) as Record<string, unknown>;

  await db
    .update(tenants)
    .set({
      settings: { ...currentSettings, notifications },
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  return { success: true };
}

export async function updateSlackWebhook(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  const { orgId: tenantId } = await requireAdmin();

  const trimmed = url.trim();

  // Allow clearing the webhook
  if (trimmed && !trimmed.startsWith("https://hooks.slack.com/")) {
    return {
      success: false,
      error: "URL must start with https://hooks.slack.com/",
    };
  }

  await db
    .update(tenants)
    .set({
      slackWebhookUrl: trimmed || null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  return { success: true };
}

export async function testSlackWebhook(): Promise<{
  success: boolean;
  error?: string;
}> {
  const { orgId: tenantId } = await requireAdmin();

  const [tenant] = await db
    .select({ slackWebhookUrl: tenants.slackWebhookUrl })
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  if (!tenant?.slackWebhookUrl) {
    return { success: false, error: "No Slack webhook URL configured" };
  }

  const ok = await sendSlackNotification(tenant.slackWebhookUrl, {
    text: "GYM OS test notification -- your Slack integration is working!",
  });

  if (!ok) {
    return { success: false, error: "Failed to send test message" };
  }

  return { success: true };
}
