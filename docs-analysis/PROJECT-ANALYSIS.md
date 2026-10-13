# CareAxis HMS – project analysis & plan

## Sources reviewed
- `README.md` files (root, web app, mobile app) and `CareAxis_HMS_Architecture_Static` pages: 16 role apps, OPD/ER/IPD flow, mobile UX rules, data domains, future integrations.
- PDFs (their text is vector outlines and can't be extracted, so I read them as rendered images):
  - **HMS-1**: national multi-tenant SaaS. People → channels (web/mobile/kiosk) → edge/API gateway → domain services (Registry, Appointments/Queue, OPD/EMR, ER, LIS, RIS, Pharmacy, Billing, TPA, HR, Notifications) → event bus → data stores.
  - **HMS-2**: patient journey of "Ramesh Kumar" (registration → token → doctor → lab/X-ray → pharmacy → billing, or admission).
  - **16-page deck**: how a hospital works; clinical, clinical-support and admin departments; OPD vs IPD journeys.
- **"How a hospital works" image** (14 steps): ambulance → ER → reception → vitals/token → doctor → lab/X-ray → decision. OPD path: pharmacy → billing → home. IPD path: admission → ward → OT → discharge → follow-up. Plus the behind-the-scenes teams.

## What was wrong
- Every page was a standalone template with hard-coded sample rows. Buttons were `data-demo`/`data-toast` placeholders that showed a toast and did nothing.
- Each form saved its own localStorage blob. No data was shared between pages, roles, web and mobile.
- Login didn't authenticate and didn't apply role access control.
- The mobile app was a set of static screens: no phone frame, OTP, booking, payments or real lists.

## Target architecture (static, no backend)
1. `assets/hms-core.js`: one domain engine with deterministic synthetic seed data.
   - Stored in localStorage `careaxis_db_v2`, with an in-memory fallback if storage fails (try/catch).
   - Implements the PDF workflows: register → book → check-in/token → consult/e-Rx/orders → LIS/RIS → pharmacy → billing/claims → IPD/OT → discharge. Also covers inventory, HR and MRD.
2. Web app: `hms-ui.js` (UI kit) + `hms-app.js` (auth guard, shell, a screen for every module/page) + `hms-app.css`.
3. Mobile app: `mobile-app.js` + `mobile-app.css`.
   - Phone frame on wide screens; patient-first app plus 15 staff role apps.
   - Mobile UX patterns: bottom sheets, OTP, slot picker, UPI-style payment with success/receipt, timeline, reminders, family, notifications, dark mode, offline banner, skeletons, a11y.
4. Both apps use the same core and storage key, so changes made on one appear on the other (same browser).
5. Tests: plain-node CDP scripts (`cdp.js`, `crawl.js`, `test-flows.js`) driving headless Chrome over file:// URLs.
