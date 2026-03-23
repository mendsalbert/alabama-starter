"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard constants
//
// Centralising these here keeps components clean. Any value that is shared
// across more than one component or hard to read inline belongs here.
// ─────────────────────────────────────────────────────────────────────────────

import type { ModelOption } from "@/components/dashboard/types";

// Pre-filled payload shown in the Raw JSON Ingest tab.
// Demonstrates the FAILED_LOGINS_THEN_SUCCESS + IMPOSSIBLE_TRAVEL detection:
// charlie fails login 3× from Berlin then succeeds from Singapore.
export const SAMPLE_PAYLOAD = JSON.stringify(
  [
    { userId: "charlie", eventType: "auth", action: "login_failed", geo: "Berlin, DE", resource: "vpn" },
    { userId: "charlie", eventType: "auth", action: "login_failed", geo: "Berlin, DE", resource: "vpn" },
    { userId: "charlie", eventType: "auth", action: "login_failed", geo: "Berlin, DE", resource: "vpn" },
    { userId: "charlie", eventType: "auth", action: "login_success", geo: "Singapore, SG", resource: "vpn" },
  ],
  null,
  2,
);

// The model that is selected when no localStorage preference exists
export const DEFAULT_MODEL = "gemini-3-flash-preview";

// Model options shown in the AI Session modal.
// tagColor uses Tailwind utility classes for the badge style.
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-3-flash-preview",
    title: "Gemini 3 Flash",
    description: "Balanced speed & reasoning for everyday SOC work.",
    tag: "Recommended",
    tagColor: "bg-blue-500/15 text-blue-300",
  },
  {
    id: "gemini-3.1-pro-preview",
    title: "Gemini 3.1 Pro",
    description: "Deepest analysis quality for high-risk incidents.",
    tag: "Most Capable",
    tagColor: "bg-violet-500/15 text-violet-300",
  },
  {
    id: "gemini-3.1-flash-lite-preview",
    title: "Gemini 3.1 Flash-Lite",
    description: "High-volume workloads at minimal cost.",
    tag: "Cost Efficient",
    tagColor: "bg-emerald-500/15 text-emerald-300",
  },
];
