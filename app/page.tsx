"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/page.tsx — Dashboard root
//
// This file is intentionally thin. All state lives in useDashboardState and
// all UI lives in the components/dashboard/ folder. This page's only job is:
//   1. Call useDashboardState() to get everything the UI needs
//   2. Render the layout shell (sidebar + topbar + main content area)
//   3. Pass props down to each child component
//
// The four main views are tab-switched via {dashboard.tab}:
//   "alerts"       → AlertsView       — the main SOC triage dashboard
//   "upload"       → UploadView       — log file upload with AI insight
//   "ingest"       → IngestView       — raw JSON payload submission
//   "integrations" → IntegrationsView — cloud/SaaS connector cards
//
// Two overlay modals are rendered unconditionally at the bottom and shown
// when their isOpen flags are true:
//   AiSessionModal     — Gemini model selector
//   IntegrationModal   — integration connect form
// ─────────────────────────────────────────────────────────────────────────────

import { AiSessionModal }     from "@/components/dashboard/AiSessionModal";
import { AlertsView }          from "@/components/dashboard/AlertsView";
import { IngestView }          from "@/components/dashboard/IngestView";
import { IntegrationModal }    from "@/components/dashboard/IntegrationModal";
import { IntegrationsView }    from "@/components/dashboard/IntegrationsView";
import { Sidebar }             from "@/components/dashboard/Sidebar";
import { TopBar }              from "@/components/dashboard/TopBar";
import { UploadView }          from "@/components/dashboard/UploadView";
import { Spinner }             from "@/components/dashboard/ui";
import { useDashboardState }   from "@/hooks/useDashboardState";

export default function Home() {
  const dashboard = useDashboardState();

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080f] text-[#e8eeff] antialiased">

      {/* Full-screen loading overlay — visible while any async task runs */}
      {dashboard.loadingLabel && <Spinner label={dashboard.loadingLabel} />}

      {/* Left navigation sidebar */}
      <Sidebar
        tab={dashboard.tab}
        setTab={dashboard.setTab}
        aiModel={dashboard.aiModel}
        openAiModal={() => dashboard.setIsAiModalOpen(true)}
        openIntegrationModal={() => dashboard.setIsIntegrationModalOpen(true)}
      />

      {/* Right content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          tab={dashboard.tab}
          filteredAlertCount={dashboard.filteredAlerts.length}
          msg={dashboard.msg}
          seedDemo={dashboard.seedDemo}
          resetAll={dashboard.resetAll}
        />

        <main className="flex-1 overflow-y-auto">
          {dashboard.tab === "alerts" && (
            <AlertsView
              stats={dashboard.stats}
              openRate={dashboard.openRate}
              query={dashboard.query}
              setQuery={dashboard.setQuery}
              statusFilter={dashboard.statusFilter}
              setStatusFilter={dashboard.setStatusFilter}
              severityFilter={dashboard.severityFilter}
              setSeverityFilter={dashboard.setSeverityFilter}
              filteredAlerts={dashboard.filteredAlerts}
              selectedAlertId={dashboard.selectedAlertId}
              setSelectedAlertId={dashboard.setSelectedAlertId}
              selectedAlert={dashboard.selectedAlert}
              status={dashboard.status}
              setStatus={dashboard.setStatus}
              noteInput={dashboard.noteInput}
              setNoteInput={dashboard.setNoteInput}
              updateSelectedAlert={dashboard.updateSelectedAlert}
              aiModel={dashboard.aiModel}
              openAiModal={() => dashboard.setIsAiModalOpen(true)}
              explainSelectedAlert={dashboard.explainSelectedAlert}
              explanation={dashboard.explanation}
            />
          )}

          {dashboard.tab === "upload" && (
            <UploadView
              uploadFile={dashboard.uploadFile}
              setUploadFile={dashboard.setUploadFile}
              uploadReport={dashboard.uploadReport}
              aiModel={dashboard.aiModel}
              saveModel={dashboard.saveModel}
              uploadLogFile={dashboard.uploadLogFile}
              clearUploadSelection={dashboard.clearUploadSelection}
              msg={dashboard.msg}
            />
          )}

          {dashboard.tab === "ingest" && (
            <IngestView
              jsonInput={dashboard.jsonInput}
              setJsonInput={dashboard.setJsonInput}
              ingestCustom={dashboard.ingestCustom}
              msg={dashboard.msg}
            />
          )}

          {dashboard.tab === "integrations" && (
            <IntegrationsView
              integrations={dashboard.integrations}
              openIntegrationModal={() => dashboard.setIsIntegrationModalOpen(true)}
              setIntegrationForm={dashboard.setIntegrationForm}
              disconnectIntegration={dashboard.disconnectIntegration}
              msg={dashboard.msg}
            />
          )}
        </main>
      </div>

      {/* Modals — always mounted, shown via isOpen prop */}
      <AiSessionModal
        isOpen={dashboard.isAiModalOpen}
        onClose={() => dashboard.setIsAiModalOpen(false)}
        aiModel={dashboard.aiModel}
        saveModel={dashboard.saveModel}
        customModel={dashboard.customModel}
        setCustomModel={dashboard.setCustomModel}
      />

      <IntegrationModal
        isOpen={dashboard.isIntegrationModalOpen}
        onClose={() => dashboard.setIsIntegrationModalOpen(false)}
        integrationForm={dashboard.integrationForm}
        setIntegrationForm={dashboard.setIntegrationForm}
        connectIntegration={dashboard.connectIntegration}
      />
    </div>
  );
}
