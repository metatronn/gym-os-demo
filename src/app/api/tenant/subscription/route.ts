import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getTenantSubscription } from "@/lib/subscription";
import { consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const { orgId, userId } = await requireAuth({ requireOrg: false });

  const rl = await consumeRateLimit(`subscription:${userId}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!orgId) {
    return NextResponse.json({ subscription: null });
  }

  const subscription = await getTenantSubscription(orgId);

  return NextResponse.json({ subscription });
}
