import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createPortalSessionUrl } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST() {
  const { orgId } = await requireAuth();

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
