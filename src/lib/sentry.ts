import * as Sentry from "@sentry/nextjs";

export function setSentryContext(
  userId: string | null,
  tenantId: string | null,
) {
  if (userId) {
    Sentry.setUser({ id: userId });
  }
  if (tenantId) {
    Sentry.setTag("tenant_id", tenantId);
  }
}
