import { NextResponse } from "next/server";

// POST /api/reset
//
// Deletes all Events, Anomalies, Alerts, and AlertAnomaly rows from the
// database, resetting the workspace to a clean state. Does not touch
// IntegrationConnection records.
//
// Steps to implement:
//   1. Call store.resetStore()
//   2. Return { ok: true }

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement reset endpoint" }, { status: 501 });
}
