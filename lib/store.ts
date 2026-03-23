// ─────────────────────────────────────────────────────────────────────────────
// lib/store.ts — all database operations
//
// This is the data access layer. Every API route imports from here instead of
// calling Prisma directly. Keeping DB logic in one place means the API routes
// stay small and the query details are easy to change without touching the UI.
//
// Functions to implement:
//   ingestEvents()           — normalise + persist raw IngestEvents to the DB
//   getSystemStats()         — count events, alerts, open, critical
//   listAlerts()             — fetch all alerts ordered newest-first
//   getAlertWithContext()    — fetch one alert + anomalies + event + related events
//   updateAlert()            — set status and/or append a note
//   resetStore()             — delete everything (events cascade to anomalies/alerts)
//   seedDemoEvents()         — build a curated set of demo events + run detections
//   listIntegrations()       — fetch all IntegrationConnection rows
//   upsertIntegrationConnection() — create or update a connection by provider
// ─────────────────────────────────────────────────────────────────────────────

import type { AlertStatus, IngestEvent, IntegrationProvider, IntegrationStatus } from "@/lib/types";
import { getPrismaClient } from "@/lib/db";

export async function ingestEvents(_events: IngestEvent[]): Promise<{ ingestedCount: number; alertCount: number }> {
  // TODO:
  //   1. Get db = getPrismaClient()
  //   2. For each event, fill in defaults (id via cuid(), timestamp, deviceId, ip, geo, resource, role, metadata, raw)
  //   3. db.event.createMany({ data: normalizedEvents })
  //   4. Load all existing events for the affected userIds
  //   5. Call runDetections(event, userEvents) from lib/detection.ts for each event
  //   6. If anomalies found, create Anomaly rows and an Alert row (with AlertAnomaly join rows)
  //   7. Return { ingestedCount, alertCount }
  void getPrismaClient();
  throw new Error("TODO: implement ingestEvents");
}

export async function getSystemStats(): Promise<{
  totalEvents: number;
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
}> {
  // TODO:
  //   const db = getPrismaClient()
  //   Run four db.model.count() calls in parallel with Promise.all
  //   Return the four counts as an object
  throw new Error("TODO: implement getSystemStats");
}

export async function listAlerts() {
  // TODO:
  //   const db = getPrismaClient()
  //   db.alert.findMany({
  //     orderBy: { createdAt: "desc" },
  //     include: { anomalyLinks: { include: { anomaly: true } } }
  //   })
  //   Map each result to the Alert type (extract anomalyIds array from links)
  throw new Error("TODO: implement listAlerts");
}

export async function getAlertWithContext(_id: string) {
  // TODO:
  //   const db = getPrismaClient()
  //   db.alert.findUnique({ where: { id }, include: { event: true, anomalyLinks: ... } })
  //   Also fetch db.event.findMany for the same userId to populate relatedEvents
  //   Map to AlertWithContext shape and return
  throw new Error("TODO: implement getAlertWithContext");
}

export async function updateAlert(
  _id: string,
  _opts: { status?: AlertStatus; note?: string },
) {
  // TODO:
  //   const db = getPrismaClient()
  //   db.alert.update({
  //     where: { id },
  //     data: {
  //       ...(status && { status }),
  //       ...(note && { notes: { push: note } }),
  //     }
  //   })
  throw new Error("TODO: implement updateAlert");
}

export async function resetStore() {
  // TODO:
  //   const db = getPrismaClient()
  //   Delete in the right order to respect foreign-key constraints:
  //     db.alertAnomaly.deleteMany()
  //     db.alert.deleteMany()
  //     db.anomaly.deleteMany()
  //     db.event.deleteMany()
  //   (IntegrationConnection rows are intentionally left intact)
  throw new Error("TODO: implement resetStore");
}

export async function seedDemoEvents(): Promise<{ ingestedCount: number; alertCount: number }> {
  // TODO:
  //   Build an array of IngestEvent objects that will trigger all four rules:
  //
  //   OFF_HOURS_PRIVILEGED_ACTION:
  //     a delete at 02:00 UTC
  //
  //   IMPOSSIBLE_TRAVEL:
  //     login_success from "New York, US" then login_success from "Tokyo, JP"
  //     within 30 minutes for the same userId
  //
  //   DOWNLOAD_SPIKE:
  //     10+ download actions for the same userId within a 30-minute window
  //
  //   FAILED_LOGINS_THEN_SUCCESS:
  //     3+ login_failed followed by login_success within 20 minutes
  //
  //   Then call ingestEvents(events) and return the result.
  throw new Error("TODO: implement seedDemoEvents");
}

export async function listIntegrations() {
  // TODO:
  //   const db = getPrismaClient()
  //   db.integrationConnection.findMany({ orderBy: { provider: "asc" } })
  //   Map each row to the IntegrationConnection type (connectedAt as ISO string)
  throw new Error("TODO: implement listIntegrations");
}

export async function upsertIntegrationConnection(_opts: {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  displayName: string;
  metadata: unknown;
}) {
  // TODO:
  //   const db = getPrismaClient()
  //   db.integrationConnection.upsert({
  //     where: { provider },
  //     create: { provider, status, displayName, metadata, connectedAt: status === "connected" ? new Date() : null },
  //     update: { status, displayName, metadata, connectedAt: status === "connected" ? new Date() : undefined },
  //   })
  throw new Error("TODO: implement upsertIntegrationConnection");
}
