import React from "react";
import { resend, isResendEnabled, FROM_EMAIL } from "@/lib/resend";
import { NEXT_PUBLIC_APP_URL } from "@/lib/env";
import WelcomeEmail from "@/emails/welcome";
import TrialExpiringEmail from "@/emails/trial-expiring";
import TrialExpiredEmail from "@/emails/trial-expired";
import PaymentFailedEmail from "@/emails/payment-failed";
import DailyDigestEmail from "@/emails/daily-digest";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmailPayload =
  | {
      type: "welcome";
      data: { gymName: string; ownerName: string; ownerEmail: string };
    }
  | {
      type: "trial-expiring";
      data: { gymName: string; ownerEmail: string; daysLeft: number };
    }
  | { type: "trial-expired"; data: { gymName: string; ownerEmail: string } }
  | {
      type: "payment-failed";
      data: { gymName: string; ownerEmail: string; amount: number };
    }
  | {
      type: "daily-digest";
      data: {
        gymName: string;
        ownerEmail: string;
        stats: { newLeads: number; newMembers: number; revenue: number };
      };
    };

export type { EmailPayload };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function appUrl(path: string): string {
  const base = NEXT_PUBLIC_APP_URL || "https://app.gymos.ai";
  return `${base}${path}`;
}

function subjectFor(payload: EmailPayload): string {
  switch (payload.type) {
    case "welcome":
      return `Welcome to GYM OS, ${payload.data.ownerName}`;
    case "trial-expiring":
      return `Your trial expires in ${payload.data.daysLeft} day${payload.data.daysLeft === 1 ? "" : "s"}`;
    case "trial-expired":
      return "Your GYM OS trial has expired";
    case "payment-failed":
      return "Action required: payment failed";
    case "daily-digest":
      return `${payload.data.gymName} — Daily Digest`;
  }
}

function recipientFor(payload: EmailPayload): string {
  return payload.data.ownerEmail;
}

function reactComponentFor(payload: EmailPayload): React.ReactElement {
  switch (payload.type) {
    case "welcome":
      return React.createElement(WelcomeEmail, {
        gymName: payload.data.gymName,
        ownerName: payload.data.ownerName,
        dashboardUrl: appUrl("/dashboard"),
      });
    case "trial-expiring":
      return React.createElement(TrialExpiringEmail, {
        gymName: payload.data.gymName,
        daysLeft: payload.data.daysLeft,
        upgradeUrl: appUrl("/billing"),
      });
    case "trial-expired":
      return React.createElement(TrialExpiredEmail, {
        gymName: payload.data.gymName,
        upgradeUrl: appUrl("/billing"),
      });
    case "payment-failed":
      return React.createElement(PaymentFailedEmail, {
        gymName: payload.data.gymName,
        amount: payload.data.amount,
        updatePaymentUrl: appUrl("/billing"),
      });
    case "daily-digest":
      return React.createElement(DailyDigestEmail, {
        gymName: payload.data.gymName,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        stats: payload.data.stats,
      });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function sendEmail(
  payload: EmailPayload,
): Promise<{ success: boolean }> {
  if (!isResendEnabled || !resend) {
    console.log(
      `[email] Resend not configured — skipping "${payload.type}" email to ${recipientFor(payload)}`,
    );
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientFor(payload),
      subject: subjectFor(payload),
      react: reactComponentFor(payload),
    });

    if (error) {
      console.error(`[email] Failed to send "${payload.type}" email:`, error);
      return { success: false };
    }

    console.log(
      `[email] Sent "${payload.type}" email to ${recipientFor(payload)}`,
    );
    return { success: true };
  } catch (err) {
    console.error(
      `[email] Unexpected error sending "${payload.type}" email:`,
      err,
    );
    return { success: false };
  }
}
