import type { Anomaly, DetectionRule, NormalizedEvent } from "@/lib/types";

// ── Rule weights — these sum to produce the risk score (max 100) ──────────

const RULE_WEIGHTS: Record<DetectionRule, number> = {
  OFF_HOURS_PRIVILEGED_ACTION: 35,
  IMPOSSIBLE_TRAVEL: 40,
  DOWNLOAD_SPIKE: 30,
  FAILED_LOGINS_THEN_SUCCESS: 25,
};

const PRIVILEGED_ACTIONS = new Set(["delete", "download", "export", "privilege_change"]);
const DOWNLOAD_ACTIONS = new Set(["download", "export"]);

// ── Helpers ───────────────────────────────────────────────────────────────

function toDate(iso: string): Date {
  return new Date(iso);
}

function minutesBetween(a: string, b: string): number {
  return Math.abs(toDate(a).getTime() - toDate(b).getTime()) / (1000 * 60);
}

function isOffHours(iso: string): boolean {
  const hour = toDate(iso).getUTCHours();
  return hour < 6 || hour > 20;
}

function toRiskScore(rules: DetectionRule[]): number {
  const total = rules.reduce((sum, rule) => sum + RULE_WEIGHTS[rule], 0);
  return Math.min(100, total);
}

function toSeverity(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function buildSummary(userId: string, rules: DetectionRule[]): string {
  const labels = rules.map((r) => r.toLowerCase().replaceAll("_", " "));
  return `User ${userId} triggered ${labels.join(", ")}.`;
}

// ── Main detection function ───────────────────────────────────────────────
//
// Called once per ingested event. allEvents includes all previously stored
// events for the same user so temporal rules can look back in time.

export function runDetections(
  event: NormalizedEvent,
  allEvents: NormalizedEvent[],
): { anomalies: Anomaly[]; riskScore: number; severity: "low" | "medium" | "high" | "critical" } {
  const anomalies: Anomaly[] = [];
  const userEvents = allEvents.filter((e) => e.userId === event.userId);
  const now = new Date().toISOString();

  // ── Rule 1: Off-hours privileged action ──────────────────────────────
  if (isOffHours(event.timestamp) && PRIVILEGED_ACTIONS.has(event.action)) {
    anomalies.push({
      id: `anomaly_${crypto.randomUUID()}`,
      eventId: event.id,
      userId: event.userId,
      rule: "OFF_HOURS_PRIVILEGED_ACTION",
      score: RULE_WEIGHTS.OFF_HOURS_PRIVILEGED_ACTION,
      reason: "Privileged action occurred in off-hours UTC window (20:00–06:00).",
      createdAt: now,
    });
  }

  // ── Rule 2: Impossible travel ────────────────────────────────────────
  if (event.eventType === "auth" && event.action === "login_success") {
    const prevLogins = userEvents
      .filter((e) => e.id !== event.id && e.eventType === "auth" && e.action === "login_success")
      .sort((a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime());

    const prev = prevLogins[0];
    if (prev && prev.geo !== event.geo && minutesBetween(prev.timestamp, event.timestamp) <= 120) {
      anomalies.push({
        id: `anomaly_${crypto.randomUUID()}`,
        eventId: event.id,
        userId: event.userId,
        rule: "IMPOSSIBLE_TRAVEL",
        score: RULE_WEIGHTS.IMPOSSIBLE_TRAVEL,
        reason: `Login moved from ${prev.geo} to ${event.geo} within 2 hours.`,
        createdAt: now,
      });
    }
  }

  // ── Rule 3: Download spike ───────────────────────────────────────────
  if (DOWNLOAD_ACTIONS.has(event.action)) {
    const windowStart = toDate(event.timestamp).getTime() - 30 * 60 * 1000;
    const recent = userEvents.filter(
      (e) =>
        DOWNLOAD_ACTIONS.has(e.action) &&
        toDate(e.timestamp).getTime() >= windowStart &&
        toDate(e.timestamp).getTime() <= toDate(event.timestamp).getTime(),
    );
    if (recent.length >= 10) {
      anomalies.push({
        id: `anomaly_${crypto.randomUUID()}`,
        eventId: event.id,
        userId: event.userId,
        rule: "DOWNLOAD_SPIKE",
        score: RULE_WEIGHTS.DOWNLOAD_SPIKE,
        reason: `High-volume download pattern: ${recent.length} actions in 30 minutes.`,
        createdAt: now,
      });
    }
  }

  // ── Rule 4: Failed logins then success ───────────────────────────────
  if (event.eventType === "auth" && event.action === "login_success") {
    const windowStart = toDate(event.timestamp).getTime() - 20 * 60 * 1000;
    const recentAuth = userEvents.filter(
      (e) =>
        e.eventType === "auth" &&
        toDate(e.timestamp).getTime() >= windowStart &&
        toDate(e.timestamp).getTime() <= toDate(event.timestamp).getTime(),
    );
    const failedCount = recentAuth.filter((e) => e.action === "login_failed").length;
    if (failedCount >= 3) {
      anomalies.push({
        id: `anomaly_${crypto.randomUUID()}`,
        eventId: event.id,
        userId: event.userId,
        rule: "FAILED_LOGINS_THEN_SUCCESS",
        score: RULE_WEIGHTS.FAILED_LOGINS_THEN_SUCCESS,
        reason: `${failedCount} failed login attempts before successful login within 20 minutes.`,
        createdAt: now,
      });
    }
  }

  const rules = anomalies.map((a) => a.rule);
  const riskScore = toRiskScore(rules);
  return { anomalies, riskScore, severity: toSeverity(riskScore) };
}
