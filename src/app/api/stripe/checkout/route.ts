import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createCheckoutSessionUrl } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST() {
  const { orgId, userId } = await requireAuth();

  try {
    const url = await createCheckoutSessionUrl(orgId, userId);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 },
    );
  }
}
