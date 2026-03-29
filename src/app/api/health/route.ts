import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    await db.execute(sql`select 1 as ok`);

    return NextResponse.json({ status: "ok", db: "connected" });
  } catch {
    return NextResponse.json(
      { status: "error", db: "disconnected" },
      { status: 500 },
    );
  }
}
