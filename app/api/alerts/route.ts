import { NextResponse } from "next/server";

// GET /api/alerts
//
// Steps to implement:
//   1. Call store.listAlerts() to fetch all alerts ordered by createdAt desc
//   2. Call store.getSystemStats() for KPI numbers
//   3. Return { stats: AlertsStats, alerts: Alert[] }

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement list alerts endpoint" }, { status: 501 });
}
