import { NextResponse } from "next/server";

// POST /api/seed
//
// Resets the database and loads a curated set of demo events designed to
// trigger all four detection rules so the dashboard has data to explore.
//
// Steps to implement:
//   1. Call store.resetStore() to clear existing data
//   2. Call store.seedDemoEvents() which builds and ingests demo events
//   3. Return { ingestedCount, alertCount }

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement seed endpoint" }, { status: 501 });
}
