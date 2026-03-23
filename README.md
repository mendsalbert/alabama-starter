# Project Alabama — Starter Kit

A full-stack, AI-powered security operations dashboard for insider-threat detection.
Built with Next.js 16, Prisma, Neon PostgreSQL, Google Gemini, and Tailwind CSS 4.

---

## What You Are Building

A Security Operations Console (SOC) dashboard that:

- Ingests raw log events from APIs or uploaded files
- Runs four rule-based anomaly detections automatically
- Raises alerts with risk scores and severity levels
- Lets analysts triage alerts, add notes, and update status
- Calls Google Gemini to generate AI-powered explanations
- Tracks mock cloud integration connections (AWS, GCP, Azure, GitHub, Slack)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16 (App Router)             |
| Language   | TypeScript                          |
| Styling    | Tailwind CSS 4                      |
| ORM        | Prisma 7                            |
| Database   | Neon (serverless PostgreSQL)        |
| AI         | Google Gemini via @google/genai     |
| Hosting    | Hostinger                           |

---

## Prerequisites

- Node.js 20 or later
- A free Neon account at neon.tech (for the PostgreSQL database)
- A Google AI Studio API key at aistudio.google.com (for Gemini)
- A Hostinger account for deployment

---

## Folder Structure

```
starter/
├── app/
│   ├── api/
│   │   ├── alerts/
│   │   │   └── [id]/
│   │   │       ├── route.ts          ← GET and PATCH a single alert
│   │   │       └── explain/
│   │   │           └── route.ts      ← POST to generate Gemini explanation
│   │   ├── ingest/
│   │   │   ├── route.ts              ← POST raw JSON events
│   │   │   └── upload/
│   │   │       └── route.ts          ← POST a log file (multipart/form-data)
│   │   ├── integrations/
│   │   │   └── route.ts              ← GET and POST integration connections
│   │   ├── seed/
│   │   │   └── route.ts              ← POST to seed demo data
│   │   └── reset/
│   │       └── route.ts              ← POST to clear all data
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      ← Main dashboard UI
├── lib/
│   ├── types.ts                      ← All shared TypeScript types
│   ├── db.ts                         ← Prisma client singleton
│   ├── detection.ts                  ← Rule engine and risk scoring
│   ├── gemini.ts                     ← Gemini prompt calls and fallbacks
│   ├── log-file.ts                   ← Log file parser (JSON/CSV/NDJSON/kv)
│   ├── store.ts                      ← Database operations
│   └── integrations.ts               ← Integration DB helpers
├── prisma/
│   └── schema.prisma                 ← Full database schema
├── .env.example                      ← Environment variable template
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Step 1 — Clone and Install

```bash
git clone <your-repo-url>
cd starter
npm install
```

---

## Step 2 — Set Up Neon Database

1. Go to neon.tech and create a free account
2. Create a new project (any name, pick the region closest to you)
3. Open your project and click Connection Details
4. Copy the Pooled connection string — this becomes your DATABASE_URL
5. Copy the Direct connection string — this becomes your DIRECT_URL

The pooled connection is used at runtime because it handles many simultaneous
requests efficiently. The direct connection is used by Prisma CLI for migrations
because it needs a stable persistent connection.

---

## Step 3 — Get a Gemini API Key

1. Go to aistudio.google.com
2. Click Get API Key and create a new key
3. Copy the key — this becomes your GEMINI_API_KEY

---

## Step 4 — Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open .env and add your credentials:

```
DATABASE_URL="postgresql://USER:PASSWORD@EP-XXXX-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@EP-XXXX.REGION.aws.neon.tech/DBNAME?sslmode=require"
GEMINI_API_KEY="your-key-here"
GEMINI_MODEL="gemini-3-flash-preview"
```

---

## Step 5 — Initialize the Database

```bash
npm run prisma:generate
npm run prisma:push
```

prisma:generate builds the TypeScript client from your schema.
prisma:push pushes the schema to your Neon database and creates all tables.

---

## Step 6 — Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.
Click Seed Demo to load realistic sample data and see the dashboard in action.

---

## Detection Rules

The rule engine runs on every ingested event and checks four patterns:

**OFF_HOURS_PRIVILEGED_ACTION** (weight: 35)
Triggered when a user performs a privileged action (delete, download, export,
privilege_change) between 20:00 and 06:00 UTC.

**IMPOSSIBLE_TRAVEL** (weight: 40)
Triggered when a user logs in successfully from two different geographic
locations within a 2-hour window. Physically impossible travel.

**DOWNLOAD_SPIKE** (weight: 30)
Triggered when a user performs 10 or more download or export actions within
any 30-minute sliding window.

**FAILED_LOGINS_THEN_SUCCESS** (weight: 25)
Triggered when a user has 3 or more failed login attempts followed by a
successful login within 20 minutes. Classic brute-force signature.

Risk scores from multiple triggered rules are added together, capped at 100,
and mapped to severity: low (0–34), medium (35–59), high (60–79), critical (80+).

---

## AI Integration

Gemini is used in two places:

**Alert Explanation**
POST /api/alerts/:id/explain
Sends full alert context to Gemini and returns a headline, explanation
paragraph, and three concrete next steps for the analyst.

**Upload Insight Summary**
POST /api/ingest/upload
After processing a log file, sends the event count, alert count, and top alerts
to Gemini and returns a summary and risk highlights.

Both endpoints accept an optional model parameter so you can choose between:
- gemini-3-flash-preview (default, balanced speed and quality)
- gemini-3.1-pro-preview (deepest analysis, best for critical incidents)
- gemini-3.1-flash-lite-preview (fastest, lowest cost, high-volume workloads)

If Gemini is unavailable the app falls back to a deterministic rule-based
summary automatically so the UI never breaks.

---

## Supported Log File Formats

The upload endpoint accepts:

| Format       | Example                                                    |
|--------------|------------------------------------------------------------|
| JSON array   | [ { "userId": "bob", "action": "download", ... } ]         |
| JSON object  | { "events": [ ... ] }                                      |
| NDJSON       | One JSON object per line                                   |
| CSV          | Headers in first row, userId/user/user_id column required  |
| Key=value    | userId=bob action=download geo="Tokyo, JP"                 |

Max file size is 5 MB.

---

## API Reference

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| POST   | /api/ingest                   | Ingest a JSON event array          |
| POST   | /api/ingest/upload            | Upload and parse a log file        |
| GET    | /api/alerts                   | List all alerts and stats          |
| GET    | /api/alerts/:id               | Get alert with full context        |
| PATCH  | /api/alerts/:id               | Update status or add analyst note  |
| POST   | /api/alerts/:id/explain       | Generate Gemini explanation        |
| GET    | /api/integrations             | List integration connections       |
| POST   | /api/integrations             | Create or update an integration    |
| POST   | /api/seed                     | Reset and load demo data           |
| POST   | /api/reset                    | Clear all stored data              |

---

## Deploying to Hostinger

1. Push your project to a GitHub repository
2. Log in to Hostinger and go to your hosting dashboard
3. Connect your GitHub repository
4. Set your environment variables in the Hostinger environment config panel:
   - DATABASE_URL
   - DIRECT_URL
   - GEMINI_API_KEY
   - GEMINI_MODEL
5. Hostinger will detect the Next.js project, run the build, and deploy

Important: Do NOT run prisma:push in production manually. Set up a build
hook or run it once from your local machine pointing at the production
DATABASE_URL to initialize your production schema.

---

## Available Scripts

```bash
npm run dev              # Start local development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Regenerate Prisma TypeScript client
npm run prisma:push      # Push schema changes to the database
```

---

## Data Model Summary

**Event** — a raw normalized log event from any source
**Anomaly** — a single rule violation detected on an event
**Alert** — raised when anomalies are found; links to the triggering event
**AlertAnomaly** — join table connecting alerts to their anomaly signals
**IntegrationConnection** — stores connection state for cloud provider integrations

---

## Environment Variables Reference

| Variable      | Required | Description                                        |
|---------------|----------|----------------------------------------------------|
| DATABASE_URL  | Yes      | Pooled Neon connection string (runtime use)        |
| DIRECT_URL    | Yes      | Direct Neon connection string (Prisma CLI only)    |
| GEMINI_API_KEY| Yes      | Google AI Studio API key                           |
| GEMINI_MODEL  | No       | Default Gemini model ID (overridable in the UI)    |
