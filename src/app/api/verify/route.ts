import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { systemId, needId, queryType } = body;

    // Simulated verification latency for the prototype.
    // THREAD does not currently query a live external service.
    await new Promise((resolve) => setTimeout(resolve, 300));

    const verificationRecord = {
      verifiedAt: new Date().toISOString(),

      verifier: "THREAD Verification Layer",

      systemId,

      needId,

      queryType: queryType || "service_pathway",

      // This is deliberately NOT marked VERIFIED because
      // the current prototype has no live external integrations.
      status: "NEEDS_CONFIRMATION",

      confidence: 0.72,

      dataSource:
        "THREAD local reasoning and simulated service directory",

      notes:
        "THREAD identified a relevant service pathway from the user's situation, but no live external authority was queried. The user should confirm availability, eligibility, requirements, and current status with the relevant local provider.",

      isSimulated: true,

      disclaimer:
        "This is a simulated verification result for demonstration. THREAD does not currently connect to live government, emergency, healthcare, utility, education, or relief databases.",
    };

    return NextResponse.json({
      success: true,
      verification: verificationRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Verification failed",
      },
      {
        status: 500,
      }
    );
  }
}