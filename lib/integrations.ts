// ─────────────────────────────────────────────────────────────────────────────
// lib/integrations.ts — integration seed helper
//
// Called once when GET /api/integrations runs and no rows exist yet.
// Seeds the five default IntegrationConnection rows (all disconnected) so
// the Integrations tab always shows all five provider cards even before
// the user has connected anything.
// ─────────────────────────────────────────────────────────────────────────────

import type { IntegrationProvider } from "@/lib/types";
import { getPrismaClient } from "@/lib/db";

const DEFAULT_PROVIDERS: IntegrationProvider[] = ["aws", "gcp", "azure", "github", "slack"];

export async function ensureDefaultIntegrations(): Promise<void> {
  // TODO:
  //   const db = getPrismaClient()
  //   For each provider in DEFAULT_PROVIDERS:
  //     db.integrationConnection.upsert({
  //       where: { provider },
  //       create: { provider, status: "disconnected", displayName: provider.toUpperCase(), metadata: {} },
  //       update: {},   // ← don't overwrite existing connected records
  //     })
  //   Use Promise.all to run all upserts in parallel.
  void getPrismaClient();
  throw new Error("TODO: implement ensureDefaultIntegrations");
}
