import { NextRequest, NextResponse } from "next/server";

// POST /api/ingest
// Body: IngestEvent[] or { events: IngestEvent[] }
//
// Steps to implement:
//   1. Parse and validate the JSON body
//   2. Normalise each IngestEvent into a NormalizedEvent (fill defaults)
//   3. Persist events to the database via store.ingestEvents()
//   4. Run runDetections() on each event against all user events
//   5. Persist anomalies and create/upsert alerts in the database
//   6. Return { ingestedCount, alertCount }

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement ingest endpoint" }, { status: 501 });
}
