import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/storage";

export async function GET() {
  const isHealthy = await healthCheck();

  return NextResponse.json({ ok: isHealthy }, { status: 200 });
}
