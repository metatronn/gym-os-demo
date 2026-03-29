import type { SlackMessage } from "@/lib/slack";

type TemplateData = {
  newLead: { leadName: string; source: string };
  paymentReceived: { memberName: string; amount: number };
  paymentFailed: { gymName: string; invoiceId: string };
  memberAtRisk: { memberName: string; riskLevel: string; reason: string };
  dailyDigest: {
    gymName: string;
    newLeads: number;
    newMembers: number;
    revenue: number;
  };
  newTenant: { gymName: string };
};

type TemplateName = keyof TemplateData;

const templates: {
  [K in TemplateName]: (data: TemplateData[K]) => SlackMessage;
} = {
  newLead(data) {
    const text = `New lead: ${data.leadName} (${data.source})`;
    return {
      text,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:wave: *New Lead*\n*${data.leadName}* just came in via *${data.source}*`,
          },
        },
      ],
    };
  },

  paymentReceived(data) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(data.amount / 100);

    const text = `Payment received: ${formatted} from ${data.memberName}`;
    return {
      text,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:white_check_mark: *Payment Received*\n*${data.memberName}* paid *${formatted}*`,
          },
        },
      ],
    };
  },

  paymentFailed(data) {
    const text = `Payment failed for ${data.gymName} (invoice ${data.invoiceId})`;
    return {
      text,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:rotating_light: *Payment Failed*\nGym: *${data.gymName}*\nInvoice: \`${data.invoiceId}\``,
          },
        },
      ],
    };
  },

  memberAtRisk(data) {
    const text = `At-risk member: ${data.memberName} (${data.riskLevel})`;
    return {
      text,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:warning: *Member at Risk*\n*${data.memberName}* — risk level: *${data.riskLevel}*\nReason: ${data.reason}`,
          },
        },
      ],
    };
  },

  dailyDigest(data) {
    const revenue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(data.revenue / 100);

    const text = `Daily digest for ${data.gymName}`;
    return {
      text,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `:bar_chart: Daily Digest — ${data.gymName}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*New Leads*\n${data.newLeads}` },
            { type: "mrkdwn", text: `*New Members*\n${data.newMembers}` },
            { type: "mrkdwn", text: `*Revenue*\n${revenue}` },
          ],
        },
      ],
    };
  },

  newTenant(data) {
    const text = `New gym signed up: ${data.gymName}`;
    return {
      text,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:tada: *New Gym Signed Up*\n*${data.gymName}* just joined GYM OS!`,
          },
        },
      ],
    };
  },
};

/**
 * Build a Slack Block Kit message from a named template.
 */
export function buildSlackMessage<T extends TemplateName>(
  templateName: T,
  data: TemplateData[T],
): SlackMessage {
  const builder = templates[templateName];
  return builder(data);
}
