import { NextRequest, NextResponse } from "next/server";

// GET /api/alerts/:id
//   Fetch a single alert with its anomalies, triggering event, and related events.
//   Call store.getAlertWithContext(id) and return the result.

// PATCH /api/alerts/:id
//   Body: { status?: AlertStatus, note?: string }
//   Update alert status and optionally append an analyst note.
//   Call store.updateAlert(id, { status, note }) and return updated alert.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json(
    { message: `TODO: implement get alert ${id}` },
    { status: 501 },
  );
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json(
    { message: `TODO: implement update alert ${id}` },
    { status: 501 },
  );
}
