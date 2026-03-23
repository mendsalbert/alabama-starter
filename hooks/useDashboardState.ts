"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useDashboardState — central state + data-fetching hook
//
// This custom hook is the "brain" of the dashboard. It owns all React state,
// all API calls, and all derived values. The page component (app/page.tsx)
// calls this once and passes slices of the returned object as props to each
// child component. This keeps the components pure and easy to reason about.
//
// The hook is split into these logical sections:
//   1. State declarations
//   2. Utility: withLoading()   — wraps any async task with a loading label
//   3. Data fetchers            — refreshAlerts, loadIntegrations, loadAlertDetail
//   4. Effects                  — initial load, 12-second poll, selectedAlertId watcher
//   5. Derived / memoised values — filteredAlerts, openRate
//   6. Action functions         — seedDemo, resetAll, ingestCustom, etc.
//   7. Return object
// ─────────────────────────────────────────────────────────────────────────────

import { DEFAULT_MODEL, MODEL_OPTIONS, SAMPLE_PAYLOAD } from "@/components/dashboard/constants";
import type {
  AlertsResponse,
  ExplanationResponse,
  IntegrationFormState,
  SelectedAlert,
  UploadInsightReport,
} from "@/components/dashboard/types";
import type { Alert, AlertStatus, IntegrationConnection, IntegrationProvider } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

export function useDashboardState() {
  // ── 1. State ────────────────────────────────────────────────────────────

  const [tab, setTab]                     = useState<"alerts" | "upload" | "ingest" | "integrations">("alerts");
  const [alerts, setAlerts]               = useState<Alert[]>([]);
  const [stats, setStats]                 = useState<AlertsResponse["stats"]>({
    totalEvents: 0, totalAlerts: 0, openAlerts: 0, criticalAlerts: 0,
  });

  // The ID of the row selected in the alert table
  const [selectedAlertId, setSelectedAlertId] = useState("");
  // Full alert with anomalies and related events loaded for the detail panel
  const [selectedAlert, setSelectedAlert]     = useState<SelectedAlert>(null);

  const [status, setStatus]           = useState<AlertStatus>("open");
  const [noteInput, setNoteInput]     = useState("");
  const [jsonInput, setJsonInput]     = useState(SAMPLE_PAYLOAD);
  const [uploadFile, setUploadFile]   = useState<File | null>(null);
  const [uploadReport, setUploadReport] = useState<UploadInsightReport | null>(null);

  const [msg, setMsg]                 = useState("");
  // Non-null while an async operation is running — drives the Spinner overlay
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);

  // Alert list filters
  const [query, setQuery]                   = useState("");
  const [statusFilter, setStatusFilter]     = useState<"all" | AlertStatus>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high" | "critical">("all");

  // Modal visibility flags
  const [isAiModalOpen, setIsAiModalOpen]               = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  // Gemini model selection (persisted in localStorage)
  const [aiModel, setAiModel]       = useState(DEFAULT_MODEL);
  const [customModel, setCustomModel] = useState("");

  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [integrationForm, setIntegrationForm] = useState<IntegrationFormState>({
    provider: "aws", displayName: "", accountId: "", region: "",
  });

  // ── 2. Utility ───────────────────────────────────────────────────────────

  // Wraps any async task with a loading label displayed in the Spinner.
  // Always clears the label even if the task throws.
  async function withLoading<T>(label: string, task: () => Promise<T>): Promise<T> {
    setLoadingLabel(label);
    try {
      return await task();
    } finally {
      setLoadingLabel(null);
    }
  }

  // ── 3. Data fetchers ─────────────────────────────────────────────────────

  // Fetches all alerts and stats from the backend.
  // TODO: implement GET /api/alerts to make this work.
  async function refreshAlerts() {
    const res = await fetch("/api/alerts", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not fetch alerts.");
    const data: AlertsResponse = await res.json();
    setAlerts(data.alerts);
    setStats(data.stats);
    if (!selectedAlertId && data.alerts.length > 0) setSelectedAlertId(data.alerts[0].id);
  }

  // Fetches all integration connection records.
  // TODO: implement GET /api/integrations to make this work.
  async function loadIntegrations() {
    const res = await fetch("/api/integrations", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not fetch integrations.");
    const data = (await res.json()) as { integrations: IntegrationConnection[] };
    setIntegrations(data.integrations);
  }

  // Fetches full alert context for the detail panel.
  // TODO: implement GET /api/alerts/:id to make this work.
  async function loadAlertDetail(id: string) {
    if (!id) { setSelectedAlert(null); setExplanation(null); return; }
    const res = await fetch(`/api/alerts/${id}`, { cache: "no-store" });
    if (!res.ok) { setSelectedAlert(null); return; }
    const data = (await res.json()) as SelectedAlert;
    setSelectedAlert(data);
    if (data) setStatus(data.status);
    setExplanation(null);
  }

  // ── 4. Effects ───────────────────────────────────────────────────────────

  // Restore Gemini model preference from localStorage on first render
  useEffect(() => {
    const stored = window.localStorage.getItem("alabama:ai:model");
    if (stored) {
      setAiModel(stored);
      if (!MODEL_OPTIONS.some((m) => m.id === stored)) setCustomModel(stored);
    }
  }, []);

  // Initial data load + 12-second background polling
  useEffect(() => {
    withLoading("Initialising...", () =>
      Promise.all([refreshAlerts(), loadIntegrations()]),
    ).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Load error."));

    const interval = setInterval(() => {
      Promise.all([refreshAlerts(), loadIntegrations()]).catch(() => {});
    }, 12000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load detail whenever the selected alert ID changes
  useEffect(() => {
    loadAlertDetail(selectedAlertId).catch(() => setMsg("Could not load alert detail."));
  }, [selectedAlertId]);

  // ── 5. Derived values ────────────────────────────────────────────────────

  // Client-side filtering — no extra network requests needed
  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
        if (statusFilter !== "all" && alert.status !== statusFilter) return false;
        if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
        if (query.trim() && !`${alert.userId} ${alert.summary}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [alerts, query, severityFilter, statusFilter],
  );

  // Percentage of alerts that are still open (drives the "Open pressure" bar)
  const openRate = useMemo(
    () => (stats.totalAlerts === 0 ? 0 : Math.round((stats.openAlerts / stats.totalAlerts) * 100)),
    [stats.openAlerts, stats.totalAlerts],
  );

  // ── 6. Action functions ──────────────────────────────────────────────────

  function saveModel(model: string) {
    setAiModel(model);
    window.localStorage.setItem("alabama:ai:model", model);
  }

  function clearUploadSelection() {
    setUploadFile(null);
    setUploadReport(null);
  }

  // Calls POST /api/seed — resets DB and loads curated demo data
  // TODO: implement POST /api/seed to make this work.
  async function seedDemo() {
    await withLoading("Seeding demo data...", async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed.");
      await refreshAlerts();
      setMsg(`Seeded ${data.ingestedCount} events · ${data.alertCount} alerts.`);
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Seed failed."));
  }

  // Calls POST /api/reset — clears all events, anomalies and alerts
  // TODO: implement POST /api/reset to make this work.
  async function resetAll() {
    await withLoading("Resetting workspace...", async () => {
      await fetch("/api/reset", { method: "POST" });
      setSelectedAlertId("");
      setSelectedAlert(null);
      setExplanation(null);
      await Promise.all([refreshAlerts(), loadIntegrations()]);
      setMsg("Workspace reset.");
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Reset failed."));
  }

  // Parses the JSON textarea and calls POST /api/ingest
  // TODO: implement POST /api/ingest to make this work.
  async function ingestCustom() {
    await withLoading("Ingesting payload...", async () => {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ingestion failed.");
      await refreshAlerts();
      setMsg(`Ingested ${data.ingestedCount} events · ${data.alertCount} alerts.`);
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Ingestion failed."));
  }

  // Sends the picked file as multipart/form-data to POST /api/ingest/upload
  // TODO: implement POST /api/ingest/upload to make this work.
  async function uploadLogFile() {
    if (!uploadFile) { setMsg("Select a file first."); return; }
    await withLoading("Analysing log file...", async () => {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("model", aiModel);
      const res = await fetch("/api/ingest/upload", { method: "POST", body: formData });
      const data = (await res.json()) as UploadInsightReport | { error: string };
      if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Upload failed.");
      setUploadReport(data);
      await refreshAlerts();
      setMsg(`${(data as UploadInsightReport).fileName} processed · ${(data as UploadInsightReport).eventCount} events.`);
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Upload failed."));
  }

  // Sends status + note via PATCH /api/alerts/:id
  // TODO: implement PATCH /api/alerts/:id to make this work.
  async function updateSelectedAlert() {
    if (!selectedAlertId) return;
    await withLoading("Updating alert...", async () => {
      const res = await fetch(`/api/alerts/${selectedAlertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: noteInput.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setNoteInput("");
      await Promise.all([refreshAlerts(), loadAlertDetail(selectedAlertId)]);
      setMsg("Alert updated.");
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Update failed."));
  }

  // Requests a Gemini explanation via POST /api/alerts/:id/explain
  // TODO: implement POST /api/alerts/:id/explain to make this work.
  async function explainSelectedAlert() {
    if (!selectedAlertId) return;
    await withLoading("Generating explanation...", async () => {
      const res = await fetch(`/api/alerts/${selectedAlertId}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: aiModel }),
      });
      const data = (await res.json()) as ExplanationResponse | { error: string };
      if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Explain failed.");
      setExplanation(data);
      setMsg("Explanation generated.");
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Explain failed."));
  }

  // Creates or updates an IntegrationConnection via POST /api/integrations
  // TODO: implement POST /api/integrations to make this work.
  async function connectIntegration() {
    await withLoading("Connecting integration...", async () => {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: integrationForm.provider,
          status: "connected",
          displayName: integrationForm.displayName.trim() || integrationForm.provider.toUpperCase(),
          metadata: { accountId: integrationForm.accountId.trim(), region: integrationForm.region.trim() },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Integration connect failed.");
      await loadIntegrations();
      setIsIntegrationModalOpen(false);
      setMsg(`${integrationForm.provider.toUpperCase()} connected.`);
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Integration connect failed."));
  }

  // Sets an integration to "disconnected" via POST /api/integrations
  async function disconnectIntegration(provider: IntegrationProvider) {
    await withLoading("Disconnecting integration...", async () => {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, status: "disconnected", displayName: provider.toUpperCase(), metadata: {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Disconnect failed.");
      await loadIntegrations();
      setMsg(`${provider.toUpperCase()} disconnected.`);
    }).catch((err: unknown) => setMsg(err instanceof Error ? err.message : "Disconnect failed."));
  }

  // ── 7. Return ────────────────────────────────────────────────────────────

  return {
    tab, setTab,
    alerts, stats,
    selectedAlertId, setSelectedAlertId,
    selectedAlert,
    status, setStatus,
    noteInput, setNoteInput,
    jsonInput, setJsonInput,
    uploadFile, setUploadFile,
    uploadReport,
    msg, loadingLabel,
    explanation,
    query, setQuery,
    statusFilter, setStatusFilter,
    severityFilter, setSeverityFilter,
    isAiModalOpen, setIsAiModalOpen,
    isIntegrationModalOpen, setIsIntegrationModalOpen,
    aiModel, customModel, setCustomModel,
    integrations,
    integrationForm, setIntegrationForm,
    filteredAlerts, openRate,
    saveModel, clearUploadSelection,
    seedDemo, resetAll,
    ingestCustom, uploadLogFile,
    updateSelectedAlert, explainSelectedAlert,
    connectIntegration, disconnectIntegration,
  };
}
