import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { trialExpirationCheck } from "@/jobs/trial-expiration";
import { sendWelcomeEmail } from "@/jobs/welcome-email";
import { paymentFailedFollowUp } from "@/jobs/payment-failed";
import { slackNotification } from "@/jobs/slack-notification";
import { dailyDigest } from "@/jobs/daily-digest";
import { trialExpiringEmail, trialExpiredEmail } from "@/jobs/trial-emails";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    trialExpirationCheck,
    sendWelcomeEmail,
    paymentFailedFollowUp,
    slackNotification,
    dailyDigest,
    trialExpiringEmail,
    trialExpiredEmail,
  ],
});
