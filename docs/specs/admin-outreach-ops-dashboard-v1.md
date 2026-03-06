# Admin Outreach Ops Dashboard v1

## 1. Objective

Build a functional, operations-first admin dashboard for:

- analytics decision-making (ad/source performance),
- outreach pipeline control (step visibility and manual sends),
- lightweight but durable operational auditability.

This spec prioritizes clarity, speed, and control over decorative UI.

## 2. Product Principles

- Function over form (Dieter Rams style): dense information, minimal ornament.
- Fast operator workflow: key decisions in under 60 seconds.
- One truth source: outreach state is table-first and explicit.
- Safe manual intervention: explicit confirmation before irreversible send actions.
- Code defaults, admin overrides: email templates have code defaults but can be overridden in admin (with reset-to-default).

## 3. Scope

### In Scope

- Analytics dashboard with ad/source visibility and period comparison.
- Outreach pipeline table with clear step state.
- Manual send action: send next step for a single lead.
- Manual lead creation from admin.
- Template overrides (subject + HTML body) editable from admin.
- Scheduler controls: run scheduler now; start all not-started leads.
- Persistent, visible audit log.

### Out of Scope (v1)

- Rich WYSIWYG editing of email templates (HTML editing is sufficient for v1).
- Bulk manual send actions.
- Complex visual dashboards that reduce readability.

## 4. Information Architecture

- Single admin dashboard with top-level view switch:
  - `Analytics`
  - `Email funnel`

Global control bar:

- Date range selector with presets: `7d`, `30d`, `90d`.
- Compare toggle default: `ON` (`vs previous period` visible by default).
- Timezone: viewer local timezone.
- Last refresh indicator.

## 5. Analytics Requirements

Top-screen blocks (must all be present):

1. Sessions vs Unique Sessions trend.
2. Leads trend.
3. Source/Channel mix.
4. Top countries.
5. Campaign table (UTM + conversion).

### 5.1 Unique Session Definitions (all required)

Expose all three variants:

- `Unique (ever)`: unique browser cookie ever seen.
- `Unique (daily)`: unique cookies per day.
- `Unique (selected range)`: unique cookies within selected date range.

### 5.2 Attribution Rule

- Primary attribution: UTM parameters.
- Fallback attribution: referrer/source when UTM is absent.

### 5.3 Sorting & Interaction

- Table columns sortable by clicking the column title.
- First click sorts ascending, second click descending, third click resets.
- Default analytics table sort can be `createdAt desc` where relevant.

## 6. Outreach Funnel Requirements

Table-first view must be the primary interface.

### 6.1 Table Columns (exact order)

`createdAt | email | name | source | country | currentStep | stepsDone | nextSendAt | status | action`

### 6.2 Step Visualization

Step cell style:

- `current=2` display format for current step.
- Chips `S1 S2 S3` where sent steps are filled and unsent are outlined.

### 6.3 Manual Action

Single-lead action only:

- `Send next step now`.

Behavior:

- Always allowed to bypass schedule when confirmed.
- Not disabled by minimum-wait guard in v1.
- Requires confirmation modal before sending.

### 6.4 Confirmation Modal (must include all)

- Recipient.
- Step number.
- Email subject.
- Snippet preview.
- Explicit warning: “bypasses schedule”.
- Last sent timestamp.

### 6.5 Template Visibility

- Admin can view step templates (subject + rendered preview/sample).
- Admin can override `subject` and `bodyHtml` for each step from UI, with:
  - token support,
  - reset-to-default.
- Code remains the default source of truth in:
  - `src/lib/outreach-emails/email-1.ts`
  - `src/lib/outreach-emails/email-2.ts`
  - `src/lib/outreach-emails/email-3.ts`

Overrides are persisted outside the repo (Supabase Storage) so they survive deploys.

### 6.6 Scheduler Controls (v1)

- `Run scheduler now`: triggers the drip scheduler to send any due emails (does not bypass schedule).
- `Start all`: enrolls all not-started (deduped) leads into the sequence by writing step `0` start logs.

### 6.7 De-dupe Rules (v1)

- Deduplicate outreach UI and sending by normalized email.
- Delete/archive/unsubscribe operate across all lead rows for the same email.

## 7. Manual Lead Creation (new requirement)

Admin must be able to add leads directly from dashboard.

### 7.1 Required Input Fields

- `source` (dropdown),
- `email`,
- `first name`,
- `surname` (last name).

### 7.2 Source Dropdown

Must include known outreach sources at minimum:

- `white_paper_download`
- `white_paper_landing`
- `linkedin_manual` (new manual source)
- `google_ads_manual` (new manual source)
- `other_manual`

### 7.3 Validation

- Email required and valid format.
- First name and surname optional as a pair if business requires flexibility, but both fields present in UI.
- Deduplicate by email (case-insensitive) with clear conflict feedback.

## 8. Pipeline Health Model

Default thresholds accepted:

- Send success:
  - Green `>= 99%`
  - Warn `97% - <99%`
  - Red `<97%`
- Bounce:
  - Green `<= 2%`
  - Warn `>2% - <=5%`
  - Red `>5%`
- Open:
  - Green `>= 35%`
  - Warn `>=20% - <35%`
  - Red `<20%`
- Click:
  - Green `>= 3%`
  - Warn `>=1% - <3%`
  - Red `<1%`
- Overdue leads:
  - Green `0-5`
  - Warn `6-20`
  - Red `>20`

## 9. Audit Requirements

Audit model: lightweight but visible in UI.

Retention:

- Forever.

Audit events (minimum):

- `manual_send_confirmed`
- `manual_send_failed`
- `lead_created_manual`
- `lead_archived`
- `lead_unarchived`
- `lead_name_updated`
- `dashboard_filter_changed` (optional, if low overhead)

Audit entry shape:

- `id`
- `created_at`
- `actor` (admin username/session id)
- `event_type`
- `target_type` (`lead`, `outreach_step`, `template_view`, etc.)
- `target_id`
- `metadata` JSON

## 10. API & Backend Changes

### 10.1 Add/Update Endpoints

- `GET /api/admin/data`
  - Add range (`7d|30d|90d`) and compare window support.
  - Return metrics for all unique session variants.
- `GET /api/admin/outreach`
  - Keep table-ready lead rows and step state.
- `POST /api/admin/outreach/send-next`
  - Body: `{ leadId }`
  - Server computes next step and sends via Resend.
  - Writes outreach log and audit record.
- `POST /api/admin/leads`
  - Body: `{ source, email, firstName, lastName }`
  - Creates lead and audit record.
- `GET /api/admin/outreach/templates`
  - Read-only view models for current code templates.
- `GET /api/admin/audit`
  - Paginated audit feed for UI.

### 10.2 Data Model Additions

- Ensure `leads.archived` exists (already applied).
- Add `admin_audit_log` table for long-term events.
- Consider source normalization via enum/check constraint for manual entries.

## 11. UI/UX Behavior

- Dense desktop table, horizontal scroll allowed on mobile (user requested table behavior on mobile over card transformation).
- Minimal chrome, strong typography, clear borders, no decorative clutter.
- Actions are right-aligned and predictable.
- Filter/sort state reflected in URL query params when feasible.

## 12. Success Criteria

Dashboard is accepted when:

- Operator can evaluate ad/source performance in under 60 seconds.
- Operator can identify each lead’s current funnel position instantly.
- Operator can manually send next step with explicit confirmation.
- Operator can add manual leads directly from admin.
- Audit trail is visible and persists indefinitely.

## 13. Implementation Notes

- Keep outreach logic source-of-truth in `src/lib/outreach-emails/*`.
- UI rendering should consume normalized API response objects, not raw DB rows.
- Maintain schema fallback resilience for Supabase errors (`42703`, `PGRST204`) where practical.

## 14. Current State (as of 2026-02-12)

- Supabase migration for `leads.archived` and index has been applied to:
  - project `claudeworkshop.com`
  - ref `feyssxbbdxvbwmbdyvtb`
- Archive/unarchive API behavior is now healthy again.
