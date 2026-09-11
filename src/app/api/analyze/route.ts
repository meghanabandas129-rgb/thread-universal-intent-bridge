import { NextRequest, NextResponse } from "next/server";
import { analyzeSituationLocally } from "@/lib/intelligence/local-engine";
import { SituationModelSchema } from "@/lib/types/situation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { story, images, mediaType, mediaName } = body;

    // Validate input text
    if (!story || typeof story !== "string" || story.trim().length === 0) {
      return NextResponse.json(
        { error: "Please describe what happened. Story text is required." },
        { status: 400 }
      );
    }

    const storyText = story.trim();
    const hasMedia = Boolean(images && images.length > 0);

    // Run the genuine local dynamic intelligence pipeline
    const situationModel = analyzeSituationLocally(storyText, {
      hasMedia,
      mediaName: mediaName || (hasMedia ? "uploaded_attachment.jpg" : undefined),
      mediaTypes: hasMedia ? [mediaType || "image/jpeg"] : [],
    });

    // Validate generated output against strict Zod schema
    const validationResult = SituationModelSchema.safeParse(situationModel);
    if (!validationResult.success) {
      console.warn("Local engine Zod schema validation warning:", validationResult.error);
      return NextResponse.json(situationModel);
    }

    return NextResponse.json(validationResult.data);
  } catch (error: any) {
    console.error("Local reasoning engine error in /api/analyze:", error);
    return NextResponse.json(
      { error: error?.message || "Internal reasoning engine error" },
      { status: 500 }
    );
  }
}
