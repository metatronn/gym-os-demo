import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { tenants } from "@/db/schema/tenants";
import { sendSlackNotification } from "@/lib/slack";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { orgId } = await requireAdmin();

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, orgId),
      columns: { slackWebhookUrl: true },
    });

    if (!tenant?.slackWebhookUrl) {
      return NextResponse.json(
        { success: false, error: "No Slack webhook URL configured" },
        { status: 400 },
      );
    }

    const ok = await sendSlackNotification(tenant.slackWebhookUrl, {
      text: "GYM OS connected successfully!",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":white_check_mark: *GYM OS connected successfully!*\nSlack notifications are working for your gym.",
          },
        },
      ],
    });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Slack webhook request failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    console.error("[api/slack/test] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
