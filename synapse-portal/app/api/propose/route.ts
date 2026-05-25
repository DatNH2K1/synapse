import { NextResponse } from "next/server";
import { knowledgeService } from "@/lib/services/knowledge-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation based on v1.2.1 manifest
    if (!body.label || !body.content || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: label, content, type" },
        { status: 400 },
      );
    }

    const result = await knowledgeService.proposeKnowledge(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[API Propose] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
