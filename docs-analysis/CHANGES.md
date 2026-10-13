# CHANGES

## Added (assets)
| File | Where | Purpose |
|---|---|---|
| hms-core.js | web + mobile `assets/` | Data engine and workflows; seed data (42 patients, 10 doctors, 66 beds, ...); session/roles |
| hms-ui.js, hms-app.js, hms-app.css | web `assets/` | Web UI kit, auth guard, dashboards and a screen for every module page; Patient 360; queue TV display |
| mobile-app.js, mobile-app.css | mobile `assets/` | Phone-frame mobile engine: patient app and 15 staff role apps |

## Modified
- All 116 web pages except `index.html` and `workspaces.html`, which have no script, plus all 102 mobile pages: the `assets/app.js` tag was replaced with the new scripts and the new CSS link was added (`docs-analysis/tools/patch-html.js`, idempotent).
- The original `app.js` and `app.css` are left in place and unused (not deleted).

## Per module (web and mobile)
- **Auth**: demo accounts, role-based access, `?next=` redirect, access-denied screen. Patients log in with mobile + OTP.
- **Front desk**: mobile OTP registration with optional photo, duplicate detection, booking, check-in/token slip, walk-in, queue call-next, admission requests.
- **Doctor**: queue, call next, consultation (ICD datalist, e-Rx rows, lab/imaging orders, advise admission), Penicillin allergy guard, results acknowledgement.
- **Lab**: collect sample → enter results (H/L flags) → verify and release, which notifies the patient and the doctor.
- **Radiology**: schedule → scan → report with impression.
- **Pharmacy**: dispense with stock check → bill → payment; stock, expiry and returns.
- **Billing**: OPD/IPD bills, payment collection, discounts, claim workflow (Draft → Submitted → Query → Approved → Settled/Rejected), receipts.
- **IPD**: bed board, admit with deposit, transfer, discharge with auto final bill (plus a claim for insured patients).
- **Nursing**: vitals with NEWS early-warning (alerts the doctor), medication administration record (MAR) give/hold, SBAR handover.
- **ER**: quick/unknown registration, MLC, triage colours, interventions, disposition that raises an admission request.
- **OT**: booking with theatre-clash check; WHO checklist gates the case status.
- **Inventory**: purchase request → PO → goods receipt (GRN) updates stock; indents, suppliers.
- **HR**: staff, attendance, leave approval, roster, payroll run.
- **MRD**: search, patient file/timeline, release-of-information requests, consents.
- **Management/Admin**: KPIs, department/flow/revenue bars, CSV reports, tenants, users, audit trail, settings, demo-data reset.
- **Patient mobile**:
  - Home: quick grid, live token tracking, search suggestions.
  - Booking: in-clinic or video, slot picker, booking for a family member, pay now.
  - UPI/card payment with success animation and receipt download/share.
  - Health records timeline with filters; prescriptions and medicine reminders.
  - Family, notifications, profile, dark mode/large text, SOS, help, digital UHID card.

## Fixes found by testing
- The slot picker now skips days with no remaining slots (late-evening bookings).
- Onboarding no longer reloads the page; it re-renders in place.
- The seed data now includes insurance claims, so the claims screens are not empty.

## Round 2 - Admin-controlled configuration
- Single source of truth db.config (hms-core.js) with migration ensureConfig; all modules read masters via live getters.
- New assets/hms-admin.js (Admin Control Centre, 27 sections incl. RBAC matrix, MIS CSV, config export/import).
- Linked assets/hms-admin.js and assets/hms-app.css in all desktop pages.
- Mobile app reads config/flags; admin subset on mobile system-admin Settings.
- Tests: 36/36 flows; crawl 220/220 clean.
