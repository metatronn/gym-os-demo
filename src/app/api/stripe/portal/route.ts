import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createPortalSessionUrl } from "@/lib/billing";
import { consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST() {
  const { orgId, userId } = await requireAuth();

  const rl = consumeRateLimit(`portal:${userId}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const url = await createPortalSessionUrl(orgId);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create portal session",
      },
      { status: 500 },
    );
  }
}
