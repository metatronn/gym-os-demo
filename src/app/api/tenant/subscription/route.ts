import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { getTenantSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, orgId } = await getAuthContext();

  if (!userId) {
    return NextResponse.json({ subscription: null }, { status: 401 });
  }

  if (!orgId) {
    return NextResponse.json({ subscription: null });
  }

  const subscription = await getTenantSubscription(orgId);

  return NextResponse.json({ subscription });
}
