// ── Event types ───────────────────────────────────────────────────────────

export type EventType = "auth" | "file" | "admin" | "network" | "app";

export type EventAction =
  | "login_success"
  | "login_failed"
  | "read"
  | "download"
  | "delete"
  | "export"
  | "privilege_change"
  | "other";

export type AlertStatus = "open" | "investigating" | "resolved";

export type DetectionRule =
  | "OFF_HOURS_PRIVILEGED_ACTION"
  | "IMPOSSIBLE_TRAVEL"
  | "DOWNLOAD_SPIKE"
  | "FAILED_LOGINS_THEN_SUCCESS";

// ── Ingestion ─────────────────────────────────────────────────────────────

// Shape of an event as it arrives from an external source
export interface IngestEvent {
  userId: string;
  eventType: EventType;
  action: EventAction;
  timestamp?: string;
  deviceId?: string;
  ip?: string;
  geo?: string;
  resource?: string;
  role?: string;
  metadata?: Record<string, string | number | boolean>;
  raw?: unknown;
}

// Shape after normalization and storage
export interface NormalizedEvent {
  id: string;
  timestamp: string;
  userId: string;
  deviceId: string;
  ip: string;
  geo: string;
  eventType: EventType;
  action: EventAction;
  resource: string;
  role: string;
  metadata: Record<string, string | number | boolean>;
  raw: unknown;
}

// ── Detection ─────────────────────────────────────────────────────────────

export interface Anomaly {
  id: string;
  eventId: string;
  userId: string;
  rule: DetectionRule;
  score: number;
  reason: string;
  createdAt: string;
}

// ── Alerts ────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  userId: string;
  eventId: string;
  anomalyIds: string[];
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number;
  summary: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  notes: string[];
}

// Alert with all related context loaded (for the detail panel)
export interface AlertWithContext extends Alert {
  anomalies: Anomaly[];
  event: NormalizedEvent | null;
  relatedEvents: NormalizedEvent[];
}

// ── Integrations ──────────────────────────────────────────────────────────

export type IntegrationProvider = "aws" | "gcp" | "azure" | "github" | "slack";
export type IntegrationStatus = "disconnected" | "connected" | "error";

export interface IntegrationConnection {
  id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  displayName: string | null;
  metadata: unknown;
  connectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── AI / Gemini ───────────────────────────────────────────────────────────

export interface ExplainMeta {
  provider: "gemini";
  model: string;
  usedFallback: boolean;
  error?: string;
}
