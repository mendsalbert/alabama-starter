import { NextRequest, NextResponse } from "next/server";

// GET /api/integrations
//   List all IntegrationConnection records from the database.
//   Return { integrations: IntegrationConnection[] }

// POST /api/integrations
//   Body: { provider, status, displayName, metadata }
//   Create or update a connection using store.upsertIntegrationConnection()
//   Return the upserted IntegrationConnection

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement list integrations" }, { status: 501 });
}

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "TODO: implement upsert integration" }, { status: 501 });
}
