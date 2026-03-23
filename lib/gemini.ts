// ─────────────────────────────────────────────────────────────────────────────
// lib/gemini.ts — Google Gemini AI integration
//
// Two exported functions used by the API routes:
//
//   explainAlert(alert, model?)
//     Called by POST /api/alerts/:id/explain
//     Sends the alert's anomalies, event metadata, and summary to Gemini.
//     Returns: { headline, explanation, nextSteps, meta }
//
//   summariseUpload(summary, model?)
//     Called by POST /api/ingest/upload after parsing a log file.
//     Sends event count, alert count, and top alert summaries to Gemini.
//     Returns: { summary, risks, meta }
//
// IMPORTANT — fallback behaviour:
//   If the GEMINI_API_KEY is missing, the model errors, or any other failure
//   occurs, both functions must return a deterministic rule-based response
//   instead of throwing. Set meta.usedFallback = true so the UI can show
//   the "AI unavailable" banner.
// ─────────────────────────────────────────────────────────────────────────────

import type { AlertWithContext, ExplainMeta } from "@/lib/types";

export interface ExplainResult {
  headline: string;
  explanation: string;
  nextSteps: string[];
  meta: ExplainMeta;
}

export interface UploadInsightResult {
  summary: string;
  risks: string[];
  meta: { model: string; usedFallback: boolean; error?: string };
}

// ── explainAlert ─────────────────────────────────────────────────────────────

export async function explainAlert(
  _alert: AlertWithContext,
  _model?: string,
): Promise<ExplainResult> {
  // TODO:
  //   1. Import { GoogleGenAI } from "@google/genai"
  //   2. const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  //   3. Build a prompt string that includes:
  //        - alert.summary, alert.severity, alert.riskScore
  //        - Each anomaly: rule, score, reason
  //        - Event metadata: action, resource, geo, ip, timestamp
  //   4. Call ai.models.generateContent({ model, contents: prompt })
  //   5. Parse the text response — expect JSON with { headline, explanation, nextSteps }
  //   6. Return the parsed result with meta = { provider: "gemini", model, usedFallback: false }
  //   7. Wrap everything in try/catch — on error return a rule-based fallback:
  //        headline: alert.summary
  //        explanation: list the anomaly reasons
  //        nextSteps: ["Review user activity", "Contact user's manager", "Escalate if confirmed"]
  //        meta: { provider: "gemini", model, usedFallback: true, error: err.message }
  throw new Error("TODO: implement explainAlert");
}

// ── summariseUpload ───────────────────────────────────────────────────────────

export async function summariseUpload(
  _opts: {
    fileName: string;
    format: string;
    eventCount: number;
    alertCount: number;
    topAlerts: Array<{ userId: string; summary: string; severity: string }>;
  },
  _model?: string,
): Promise<UploadInsightResult> {
  // TODO:
  //   1. Same GoogleGenAI setup as above
  //   2. Build a prompt describing the upload: file name, format, counts, top alerts
  //   3. Ask Gemini to return JSON with { summary: string, risks: string[] }
  //   4. Return parsed result with meta
  //   5. On error return fallback: generic summary + risk bullet per alert
  throw new Error("TODO: implement summariseUpload");
}
