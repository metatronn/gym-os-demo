import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export const slackNotification = inngest.createFunction(
  { id: "slack-notification", triggers: [{ event: "notification/slack" }] },
  async ({ event }) => {
    const { tenantId, message, templateName, templateData } = event.data as {
      tenantId: string;
      message?: { text: string; blocks?: unknown[] };
      templateName?: string;
      templateData?: Record<string, unknown>;
    };

    const [tenant] = await db
      .select({ slackWebhookUrl: tenants.slackWebhookUrl })
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant?.slackWebhookUrl)
      return { skipped: true, reason: "no-webhook" };

    const { sendSlackNotification } = await import("@/lib/slack");

    if (message) {
      await sendSlackNotification(tenant.slackWebhookUrl, message);
      return { sent: true };
    }

    if (templateName) {
      const { buildSlackMessage } = await import("@/lib/slack-templates");
      const slackMessage = buildSlackMessage(
        templateName as Parameters<typeof buildSlackMessage>[0],
        templateData as Parameters<typeof buildSlackMessage>[1],
      );

      await sendSlackNotification(tenant.slackWebhookUrl, slackMessage);
      return { sent: true };
    }

    return { skipped: true, reason: "no-message" };
  },
);
