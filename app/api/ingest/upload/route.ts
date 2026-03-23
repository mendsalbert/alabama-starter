import { NextRequest, NextResponse } from "next/server";

// POST /api/ingest/upload
// Content-Type: multipart/form-data
// Fields: file (File), model (string, optional)
//
// Steps to implement:
//   1. Extract the file and optional model from formData
//   2. Read file content as text and call parseLogFile() from lib/log-file.ts
//   3. Forward parsed events to the /api/ingest handler (or call store directly)
//   4. Call Gemini with the result summary for an upload insight report
//   5. Return UploadInsightReport

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement upload endpoint" }, { status: 501 });
}
