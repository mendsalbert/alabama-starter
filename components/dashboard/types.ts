"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard-level TypeScript types
//
// These are UI-specific shapes that live on top of the core lib/types.ts.
// lib/types.ts defines the raw data model (what the DB and API return).
// This file adds the extra shapes the React components need.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Alert,
  AlertStatus,
  AlertWithContext,
  ExplainMeta,
  IntegrationProvider,
} from "@/lib/types";

// ── API response shapes ───────────────────────────────────────────────────

export interface AlertsStats {
  totalEvents: number;
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
}

// Shape returned by GET /api/alerts
export interface AlertsResponse {
  stats: AlertsStats;
  alerts: Alert[];
}

// Shape returned by POST /api/alerts/:id/explain
export interface ExplanationResponse {
  headline: string;
  explanation: string;
  nextSteps: string[];
  meta?: ExplainMeta;
}

// Shape returned by POST /api/ingest/upload
export interface UploadInsightReport {
  fileName: string;
  format: string;
  eventCount: number;
  alertCount: number;
  warnings: string[];
  insight: {
    summary: string;
    risks: string[];
    meta?: { model: string; usedFallback: boolean; error?: string };
  };
}

// ── UI-specific types ─────────────────────────────────────────────────────

// Describes each Gemini model option shown in the AI Session modal
export interface ModelOption {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

// Form state for the Connect Integration modal
export interface IntegrationFormState {
  provider: IntegrationProvider;
  displayName: string;
  accountId: string;
  region: string;
}

// The four navigation tabs
export type NavTab = "alerts" | "upload" | "ingest" | "integrations";

// Combined alert filter state used in the alerts list
export type AlertFilters = {
  query: string;
  statusFilter: "all" | AlertStatus;
  severityFilter: "all" | "low" | "medium" | "high" | "critical";
};

// The currently selected alert in the detail panel (null = nothing selected)
export type SelectedAlert = AlertWithContext | null;
