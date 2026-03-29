import { INTERNAL_SLACK_WEBHOOK_URL } from "@/lib/env";

export interface SlackMessage {
  text: string;
  blocks?: unknown[];
}

/**
 * Send a notification to a Slack webhook URL.
 * Failures are logged but never thrown — notifications must not crash the app.
 */
export async function sendSlackNotification(
  webhookUrl: string,
  message: SlackMessage,
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      console.error(`[slack] Webhook failed (${response.status}): ${body}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[slack] Webhook request error:", error);
    return false;
  }
}

/**
 * Send a notification to the internal (platform-level) Slack channel.
 * No-ops silently when INTERNAL_SLACK_WEBHOOK_URL is not configured.
 */
export async function sendInternalSlackNotification(
  message: SlackMessage,
): Promise<boolean> {
  if (!INTERNAL_SLACK_WEBHOOK_URL) {
    return false;
  }

  return sendSlackNotification(INTERNAL_SLACK_WEBHOOK_URL, message);
}
