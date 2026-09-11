import { NextResponse } from "next/server";
import { DEMO_SCENARIOS } from "@/lib/gemini/mockData";

export async function GET() {
  return NextResponse.json({
    scenarios: DEMO_SCENARIOS,
  });
}
