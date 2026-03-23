// ─────────────────────────────────────────────────────────────────────────────
// lib/log-file.ts — log file parser
//
// Called by POST /api/ingest/upload after reading the uploaded file as text.
//
//   parseLogFile(text, filename)
//     Detects the format automatically and returns:
//       { events: IngestEvent[], format, warnings }
//
// Supported formats (auto-detected in this order):
//
//   JSON array     [ { userId, action, ... }, ... ]
//   JSON object    { "events": [ ... ] }  or  { "data": [ ... ] }
//   NDJSON         one JSON object per line
//   CSV            header row + data rows; userId/user/user_id column required
//   key=value      userId=bob action=download geo="Tokyo, JP" per line
//
// Any row that cannot be parsed should be skipped and a warning added.
// The function should never throw — return { events: [], format: "unknown", warnings }
// if nothing can be parsed at all.
// ─────────────────────────────────────────────────────────────────────────────

import type { IngestEvent } from "@/lib/types";

export interface ParseResult {
  events: IngestEvent[];
  format: string;
  warnings: string[];
}

export function parseLogFile(_text: string, _filename: string): ParseResult {
  // TODO:
  //
  //   const warnings: string[] = []
  //
  //   ── Attempt 1: JSON ──────────────────────────────────────────────────
  //   try {
  //     const parsed = JSON.parse(text)
  //     if (Array.isArray(parsed)) {
  //       return { events: normaliseArray(parsed, warnings), format: "json-array", warnings }
  //     }
  //     if (parsed && typeof parsed === "object") {
  //       const arr = parsed.events ?? parsed.data ?? parsed.logs ?? Object.values(parsed)[0]
  //       if (Array.isArray(arr)) {
  //         return { events: normaliseArray(arr, warnings), format: "json-object", warnings }
  //       }
  //     }
  //   } catch {}
  //
  //   ── Attempt 2: NDJSON ────────────────────────────────────────────────
  //   const lines = text.trim().split("\n").filter(Boolean)
  //   const ndjsonEvents = []
  //   for (const line of lines) {
  //     try { ndjsonEvents.push(JSON.parse(line)) } catch { warnings.push(`Skipped: ${line.slice(0, 60)}`) }
  //   }
  //   if (ndjsonEvents.length > 0) {
  //     return { events: normaliseArray(ndjsonEvents, warnings), format: "ndjson", warnings }
  //   }
  //
  //   ── Attempt 3: CSV ───────────────────────────────────────────────────
  //   const [headerLine, ...dataLines] = lines
  //   const headers = headerLine.split(",").map(h => h.trim().toLowerCase())
  //   if (headers.includes("userid") || headers.includes("user_id") || headers.includes("user")) {
  //     // parse CSV rows, map column names to IngestEvent fields
  //     return { events: csvEvents, format: "csv", warnings }
  //   }
  //
  //   ── Attempt 4: key=value ─────────────────────────────────────────────
  //   // parse "key=value key2="multi word"" per line using a regex
  //   // return { events: kvEvents, format: "key-value", warnings }
  //
  //   return { events: [], format: "unknown", warnings: ["Could not detect log format"] }

  throw new Error("TODO: implement parseLogFile");
}

// Helper: normalise a raw array of unknown objects into IngestEvent[].
// Rows missing a userId field are skipped with a warning.
// function normaliseArray(rows: unknown[], warnings: string[]): IngestEvent[] { ... }
