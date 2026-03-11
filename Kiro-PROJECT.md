# VeniCX — Kiro Project Knowledge File
# Read this file at the start of every session before doing anything else.

---

## What Is VeniCX?

VeniCX (pronounced "Venice-X") is a **Unified Lead Identity & Communication Engine** built for
lenders and lead-driven businesses in South Africa. It solves a specific, costly problem:
companies receive lead data from multiple partners in inconsistent formats, end up with thousands
of duplicate records, and have no unified view of a customer across sources. They also have no
compliant, auditable way to communicate with those customers.

VeniCX fixes this by:
1. Ingesting partner data from CSV, Excel, and JSON files
2. Normalizing all data into a canonical schema
3. Building a **Super Record** — a single unified customer identity assembled from all sources
4. Maintaining a full auditable event timeline per customer
5. Enabling compliant, rate-limited SMS and Email communication

This is not a simple CRUD app. It is a data platform with identity resolution, probabilistic
matching, PII hashing, consent management, and communication auditability at its core.

---

## Who Uses It?

**Operations Admins** — Upload partner files, map field schemas, monitor ingestion batches,
review merge decisions, send communications.

**Operators** — Search Super Records, view customer timelines, trigger communications,
manage consent.

**Viewers** — Read-only access to dashboards and records.

All users authenticate via JWT. All actions are logged. All PII is hashed before storage.

---

## Current Project State

| Item | Status |
|---|---|
| Product specification | ✅ Complete (see spec section below) |
| Figma design | ✅ Complete |
| GitHub organization | ✅ Created (`venicx`) |
| Backend repo | ✅ Cloned locally (`venicx/backend`) |
| Frontend repo | ✅ Cloned locally (`venicx/frontend`) |
| Google Cloud project (dev) | ✅ Created (`VenicCX-dev`) |
| Supabase project (dev) | ✅ Created |
| Staging GCP project | ❌ Needs creating (`venicx-staging`) |
| Production GCP project | ❌ Needs creating (`venicx-prod`) |
| Staging Supabase | ❌ Needs creating |
| Production Supabase | ❌ Needs creating |

---

## Technology Decisions & Rationale

### Backend: Rust + Axum
Chosen for performance (100k row CSV ingestion), memory safety, and reliable async concurrency.
The ingestion worker processes large files without memory pressure. SQLx provides compile-time
query checking against the actual database schema, catching SQL errors before runtime.

### Database: Supabase (PostgreSQL)
Managed Postgres with Row Level Security, automatic backups, and a Supabase connection string
compatible with SQLx. Three separate projects: dev, staging, prod. Never share connection
strings across environments.

### Frontend: Next.js 14 + TypeScript
App Router for server/client component separation. TypeScript enforced everywhere — no `any`
types in production code. Tailwind CSS for utility styling. React Query for all server state.

### Communication: SMSPortal + SendGrid
SMSPortal for SMS (South African provider). SendGrid for email. Both support delivery webhooks
so VeniCX can track receipt, opens, clicks, and bounces back to the customer record.

### Infrastructure: Google Cloud Run
Serverless containers. Scales to zero. Three Cloud Run services: API, ingestion worker,
communication dispatcher. All secrets via Google Secret Manager — zero hardcoded credentials.

---

## Critical Rules — Never Violate These

### PII Handling
- **Raw PII never touches the database.** Phone numbers, emails, and national IDs are
  HMAC-SHA256 hashed with a salt before any INSERT or SELECT.
- The `PII_HASH_SALT` environment variable must be set once and **never changed** after
  real data exists. If it changes, all identity matching breaks permanently.
- Only display-safe fields are returned from APIs: `msisdn_last4`, `email_domain`,
  `has_national_id` (boolean). Never full PII values.
- Never log raw PII. No phone numbers, emails, or national IDs in any log line.

### Consent
- SMS and Email cannot be dispatched without active consent on record.
- Consent validation is enforced at middleware level, not inside handlers.
- It must be architecturally impossible to call dispatch without passing the consent gate.

### Audit Integrity
- `merge_logs` and `events` tables are append-only. No UPDATE or DELETE permitted.
- Every merge decision — automated or manual — writes a merge log record.
- Every state change writes an event record.

### Security
- All endpoints except `/health` and `/api/v1/auth/login` require a valid JWT.
- File upload GCS paths are generated server-side only.
- Uploaded files are validated by MIME type AND magic bytes, not just extension.
- Webhook endpoints validate provider signatures before processing.

### Environment Separation
- Dev, staging, and prod are completely isolated: separate GCP projects, separate Supabase
  projects, separate GCS buckets, separate Secret Manager entries.
- Never reference staging or prod credentials from dev code.

---

## Design System

### Colors
```
Primary blue:    #3B5BFF  (buttons, active nav, links)
SMS purple:      #8B5CF6  (SMS metrics, charts)
Email teal:      #10B981  (email metrics, charts)
Success:         #16A34A
Warning:         #D97706
Error:           #DC2626
Page bg:         #F8FAFC
Card bg:         #FFFFFF
Border:          #E2E8F0
Text primary:    #111827
Text secondary:  #6B7280
```

### Layout
- Sidebar: 240px fixed width, white bg, left-aligned navigation
- Top bar: 56px height, white bg, page title left, user info right
- Page content: padded 24px, neutral-50 background
- Cards: white bg, rounded-xl, subtle border + shadow

### Navigation (5 items in sidebar)
1. Dashboard — grid icon
2. Data Ingestion — upload icon
3. Super Records — users icon
4. Communications — message-square icon
5. Settings — settings icon (pinned to bottom)

### Typography
- Page titles: 24px semibold
- Metric numbers: 28–32px bold
- Card labels: 13px regular, neutral-500
- Body text: 14px regular
- Nav labels: 14px medium

---

## Full Database Schema

### Tables

**roles** — system roles: admin, operator, viewer

**users** — platform users with email, password_hash, role, full_name

**customers** — core demographic record, no raw PII, may have `merged_into` pointer

**identities** — hashed identity fields per customer:
- `msisdn_hash` — HMAC-SHA256 of normalized phone number
- `email_hash` — HMAC-SHA256 of lowercase trimmed email
- `national_id_hash` — HMAC-SHA256 of national ID
- `msisdn_last4` — last 4 digits only (for display)
- `email_domain` — domain portion only (for display)

**consent_logs** — per-customer per-channel consent history (append-only)

**mapping_templates** — saved field mapping configurations for reuse

**ingestion_batches** — one record per uploaded file, tracks status + counts

**ingestion_rows** — one record per row in an uploaded file, tracks per-row outcome

**merge_logs** — every merge decision (automated or manual), append-only

**communications** — every outbound SMS/email attempt with status + cost

**events** — full customer event timeline, append-only

### Key Relationships
```
users → roles (many-to-one)
customers → customers (self-ref: merged_into)
identities → customers (many-to-one)
consent_logs → customers
ingestion_rows → ingestion_batches
ingestion_rows → customers (set after processing)
merge_logs → customers (source + target)
communications → customers
events → customers
events → ingestion_batches (optional)
events → communications (optional)
```

---

## Backend Module Map

### `src/modules/ingestion/`
- `handlers.rs` — Axum route handlers for upload, map, status, templates
- `parser.rs` — CSV, XLSX, JSON file parsing into row vectors
- `mapper.rs` — Apply field mapping template to parsed rows
- `validator.rs` — Validate normalized rows against canonical schema rules
- `worker.rs` — Async background worker: polls pending batches, runs full pipeline

### `src/modules/super_record/`
- `handlers.rs` — GET by ID, search endpoint
- `hasher.rs` — HMAC-SHA256 PII hashing (single code path for all hashing)
- `matcher.rs` — Deterministic matching cascade (MSISDN → email → national ID)
- `merger.rs` — Execute merge, update customer record, write merge log
- `timeline.rs` — Write events, assemble timeline for API response

### `src/modules/communication/`
- `handlers.rs` — SMS send, email send, webhook receive
- `consent.rs` — Consent validation middleware
- `sms.rs` — SMSPortal API client
- `email.rs` — SendGrid API client

### `src/modules/dashboard/`
- `handlers.rs` — Metrics + recent uploads endpoints
- `queries.rs` — Aggregation SQL queries

### `src/middleware/`
- `auth.rs` — JWT extraction and validation
- `rate_limit.rs` — Per-IP request rate limiting

---

## API Reference

```
POST   /api/v1/auth/login                    Public
POST   /api/v1/auth/logout                   Auth required
GET    /api/v1/auth/me                       Auth required

GET    /api/v1/dashboard/metrics             Auth required
GET    /api/v1/dashboard/recent-uploads      Auth required

POST   /api/v1/ingestion/upload              Auth required (operator+)
POST   /api/v1/ingestion/map                 Auth required (operator+)
GET    /api/v1/ingestion/batches             Auth required
GET    /api/v1/ingestion/status/{batch_id}   Auth required
GET    /api/v1/ingestion/templates           Auth required
POST   /api/v1/ingestion/templates           Auth required (operator+)

GET    /api/v1/super-record/{id}             Auth required
GET    /api/v1/super-record/search           Auth required

POST   /api/v1/communication/sms             Auth required (operator+) + consent gate
POST   /api/v1/communication/email           Auth required (operator+) + consent gate
GET    /api/v1/communication/campaigns       Auth required
POST   /api/v1/communication/campaigns       Auth required (operator+)
GET    /api/v1/communication/templates       Auth required
POST   /api/v1/communication/templates       Auth required (operator+)
POST   /api/v1/communication/webhooks/smsportal    Webhook (signature validated)
POST   /api/v1/communication/webhooks/sendgrid     Webhook (signature validated)

GET    /api/v1/customers/{id}/consent        Auth required
POST   /api/v1/customers/{id}/consent        Auth required (operator+)

GET    /health                               Public
```

---

## Ingestion Pipeline (Step by Step)

```
1.  User uploads file via POST /api/v1/ingestion/upload
2.  Backend validates file: MIME type + magic bytes + size limit (100MB)
3.  File stored in GCS at: uploads/{batch_id}/{filename} — immutable after write
4.  ingestion_batches record created with status='pending', gcs_path set
5.  API returns {batch_id} immediately — async from here

6.  Worker polls ingestion_batches WHERE status='pending' every 5 seconds
7.  Worker atomically sets status='processing'
8.  Worker fetches file from GCS by gcs_path
9.  Parser reads file into Vec<HashMap<String, String>>
10. User has already submitted mapping via POST /api/v1/ingestion/map
    (or worker uses saved template if mapping_template_id is set)
11. Mapper applies field_mappings to each row → normalized row

Per row:
12. Validator checks required fields present, formats valid
13. PII hasher normalizes + hashes msisdn, email, national_id
14. Deterministic matcher queries identities table:
      a. msisdn_hash match? → existing customer_id
      b. email_hash match? → existing customer_id
      c. national_id_hash match? → existing customer_id
      d. No match → new customer
15. If new customer: INSERT customers + identities, merge_action='created'
16. If match found: update customer demographics if enriched, merge_action='merged_deterministic'
17. Probabilistic scoring runs if no deterministic match and name+DOB present:
      Score ≥ 0.85 → auto-merge, merge_action='merged_probabilistic'
      Score 0.65–0.84 → flag, merge_action='pending_review'
      Score < 0.65 → new customer
18. Write ingestion_rows record with outcome
19. Write events record: event_type='ingested'
20. Write merge_logs record if merge occurred

21. After all rows: update ingestion_batches with final counts + status='completed'
```

---

## Super Record Assembly

When `GET /api/v1/super-record/{id}` is called, the backend assembles a response from
multiple tables — it is NOT a single table query:

```sql
-- Core demographics
SELECT * FROM customers WHERE id = $1

-- Display-safe identity
SELECT msisdn_last4, email_domain,
       national_id_hash IS NOT NULL as has_national_id
FROM identities WHERE customer_id = $1

-- Latest consent per channel
SELECT DISTINCT ON (channel) channel, status, granted_at, revoked_at
FROM consent_logs WHERE customer_id = $1
ORDER BY channel, created_at DESC

-- Lead history (which batches this customer appeared in)
SELECT b.id, b.filename, b.partner_name, r.created_at
FROM ingestion_rows r JOIN ingestion_batches b ON r.batch_id = b.id
WHERE r.customer_id = $1

-- Communication history
SELECT channel, status, sent_at, cost_amount
FROM communications WHERE customer_id = $1
ORDER BY created_at DESC LIMIT 20

-- Merge history
SELECT merge_type, match_field, confidence_score, created_at
FROM merge_logs
WHERE source_customer_id = $1 OR target_customer_id = $1

-- Event timeline
SELECT event_type, event_data, source, created_at
FROM events WHERE customer_id = $1
ORDER BY created_at DESC
```

The response shape is documented in the API spec — never return raw PII fields.

---

## Deterministic Matching Logic

```
incoming record → hash MSISDN → SELECT customer_id FROM identities WHERE msisdn_hash = $hash
  → match found? → return existing customer_id, log merge (match_field='msisdn')

→ no match → hash email → SELECT customer_id FROM identities WHERE email_hash = $hash
  → match found? → return existing customer_id, log merge (match_field='email')

→ no match → hash national_id → SELECT customer_id FROM identities WHERE national_id_hash = $hash
  → match found? → return existing customer_id, log merge (match_field='national_id')

→ no match → create new customer
```

---

## Probabilistic Scoring Weights

| Signal | Weight |
|---|---|
| Name similarity (Jaro-Winkler on full name) | 0.30 |
| Date of birth exact match | 0.40 |
| Address string similarity | 0.20 |
| City exact match | 0.10 |

Thresholds are configurable via environment variables:
- `PROBABILISTIC_MERGE_AUTO_THRESHOLD` (default 0.85) → auto-merge
- `PROBABILISTIC_MERGE_REVIEW_THRESHOLD` (default 0.65) → flag for review

---

## Frontend Pages

### `/login` — Login Page
Email + password form. On success: store JWT in cookie, redirect to `/`.

### `/` — Dashboard
- Two charts: Records+Uploads over 7 days (line), SMS+Email per day (grouped bar)
- Recent uploads table with live status badges and result counts

### `/ingestion` — Data Ingestion
Two-step flow:
- Step 1: File upload (drag-drop), file preview (first 5 rows)
- Step 2: Field mapping (source column → canonical field dropdown), template save/load
- After submit: live progress polling every 3 seconds

### `/records` — Super Records List
- Search bar (name, phone tail, email domain)
- Table: name, identity indicators, city, consent badges, last activity

### `/records/[id]` — Super Record Detail
- Full assembled Super Record view
- Demographics, consent toggles, event timeline, lead history,
  communication history, merge history

### `/communications` — Communications
- 4 metric cards: SMS Sent, Emails Sent, Delivery Rate, Total Cost (ZAR)
- 2 action cards: SMS Campaigns, Email Templates
- Communication performance bar chart

---

## Environment Variables Reference

```bash
# Backend
APP_ENV=development|staging|production
PORT=8080
RUST_LOG=debug|info|warn|error
DATABASE_URL=                          # From Supabase settings
GCS_BUCKET_NAME=                       # venicx-uploads-{env}
GCS_PROJECT_ID=                        # venicx-{env}
JWT_SECRET=                            # openssl rand -hex 64
JWT_EXPIRY_SECONDS=86400
PII_HASH_SALT=                         # openssl rand -hex 64 — SET ONCE FOREVER
SMSPORTAL_CLIENT_ID=
SMSPORTAL_CLIENT_SECRET=
SMSPORTAL_BASE_URL=https://rest.smsportal.com
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@venicx.app
SENDGRID_FROM_NAME=VeniCX
RATE_LIMIT_REQUESTS_PER_MINUTE=60
SMS_DAILY_LIMIT_PER_CUSTOMER=3
SMS_WEEKLY_LIMIT_PER_CUSTOMER=10
EMAIL_DAILY_LIMIT_PER_CUSTOMER=5
EMAIL_WEEKLY_LIMIT_PER_CUSTOMER=20
PROBABILISTIC_MERGE_AUTO_THRESHOLD=0.85
PROBABILISTIC_MERGE_REVIEW_THRESHOLD=0.65

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Logging Rules

Every log entry must be JSON (structured). Use `tracing` crate in Rust.

**Always log:**
- Every API request: method, path, status code, latency_ms
- Every ingestion batch state change: batch_id, old_status → new_status
- Every merge decision: customer_id, match_field, merge_type, decision
- Every communication dispatch: customer_id, channel, provider, outcome
- Every consent change: customer_id, channel, old_status → new_status
- Every auth event: user_id, event (login/logout/token_expired)

**Never log:**
- Raw phone numbers, emails, national IDs
- JWT token values
- API keys or secrets
- Password hashes

**Log format:**
```json
{
  "timestamp": "2026-03-10T14:30:00Z",
  "level": "INFO",
  "service": "api",
  "trace_id": "uuid",
  "user_id": "uuid or null",
  "message": "...",
  "data": {}
}
```

---

## Git Workflow

```
feature/your-feature-name
    ↓ PR (1 approval required)
staging
    ↓ CI runs: test → lint → build → deploy to staging Cloud Run
    ↓ PR (2 approvals required)
main
    ↓ CI runs: test → lint → build → manual approval gate → deploy to prod Cloud Run
```

**Rules:**
- Never push directly to `main` or `staging`
- All work starts on a `feature/` branch
- PRs must have passing CI before merge
- Migrations run automatically in CI before deploy

---

## Canonical Field Names (for ingestion mapping)

These are the only valid target field names in a mapping template:

```
first_name
last_name
date_of_birth         # format: YYYY-MM-DD or DD/MM/YYYY (auto-detected)
gender                # M / F / Male / Female (normalized to M/F on ingest)
msisdn                # phone number — normalized to E.164 before hashing
email
national_id
address_line_1
address_line_2
city
province
postal_code
consent_sms           # true/false/yes/no/1/0 (normalized to boolean)
consent_email         # true/false/yes/no/1/0 (normalized to boolean)
[ignore]              # explicitly skip this column
```

---

## File Structure Summary

```
venicx/backend/                    ← Rust/Axum API + workers
venicx/frontend/                   ← Next.js 14 dashboard
```

Both repos are in the `venicx` GitHub organization.
Both repos have `main` (prod) and `staging` branches with protection rules.
All work happens on `feature/*` branches, merged to `staging` via PR.

---

## What Has NOT Been Built Yet

As of project start, both repos are empty. Everything needs to be built.
Kiro should begin with the backend init prompt, then the frontend init prompt,
then continue feature by feature in the order specified in each init prompt.

The build order within each repo is strict — do not skip steps or build out of order.
Dependencies between modules are real: the PII hasher must exist before the matcher,
the matcher must exist before the worker, consent middleware must exist before
communication handlers, etc.

---

## Business Context

VeniCX operates in South Africa. Currency is ZAR (South African Rand).
Phone numbers use the South African format: +27XXXXXXXXX (E.164).
The primary compliance concern is POPIA (Protection of Personal Information Act) —
the South African equivalent of GDPR. PII hashing, consent management, and audit
logging are all POPIA requirements, not just good practice.

The MVP serves lenders and lead brokers. A typical ingestion batch might be 1,000–50,000
leads from a single partner. Duplicate rates of 15–40% are expected and normal.
The Super Record engine exists specifically to collapse those duplicates into one
unified view so a customer is never contacted twice by different campaigns.

---

*This file is the single source of truth for the VeniCX project.
Any ambiguity in other files should be resolved by the rules in this file.*