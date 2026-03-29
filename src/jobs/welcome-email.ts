import { inngest } from "@/lib/inngest";

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email", triggers: [{ event: "tenant/created" }] },
  async ({ event, step }) => {
    const { tenantId, ownerEmail, gymName } = event.data as {
      tenantId: string;
      ownerEmail: string;
      gymName: string;
    };

    // Send welcome email via Resend
    await step.run("send-email", async () => {
      const { sendEmail } = await import("@/lib/send-email");

      await sendEmail({
        type: "welcome",
        data: {
          gymName,
          ownerName: gymName,
          ownerEmail,
        },
      });
    });

    // Send Slack notification if configured
    await step.sendEvent("slack-new-tenant", {
      name: "notification/slack",
      data: {
        tenantId,
        templateName: "newTenant" as const,
        templateData: { gymName },
      },
    });

    return { sent: true };
  },
);
