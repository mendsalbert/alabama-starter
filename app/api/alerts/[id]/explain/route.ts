import { NextRequest, NextResponse } from "next/server";

// POST /api/alerts/:id/explain
// Body: { model?: string }
//
// Steps to implement:
//   1. Load the alert with context via store.getAlertWithContext(id)
//   2. Call explainAlert(alertWithContext, model) from lib/gemini.ts
//   3. Return ExplanationResponse { headline, explanation, nextSteps, meta }

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json(
    { message: `TODO: implement explain alert ${id}` },
    { status: 501 },
  );
}
