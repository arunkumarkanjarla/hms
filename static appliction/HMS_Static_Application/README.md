# CareAxis HMS — Static Application

## Run locally
1. Extract the ZIP.
2. Open `index.html` or `login.html` in Chrome, Edge, or Firefox.
3. Choose a role on the sign-in page to open its workspace.
4. You can also open any role folder and launch `dashboard.html` directly.

No backend, database, Node.js, PHP, Python, build tools, or internet connection is required.

## Included workspaces
- Platform / System Administrator
- Hospital Management
- Front Desk & Registration
- Doctor / OPD / EMR
- Nursing
- Emergency / Triage / MLC
- Laboratory / LIS
- Radiology / RIS
- Pharmacy
- Billing / Insurance / TPA
- IPD / Ward / Beds / Discharge
- Operation Theatre
- Inventory / Purchase / GRN
- HR / Payroll / Rosters
- Medical Records
- Patient & Family Portal

Each workspace includes a dashboard plus separate HTML screens for the listed modules. The UI is responsive for desktop, tablet, and mobile.

## Static behaviour
- Forms accept input and save entries to the browser's `localStorage`.
- Tables include filtering, sample records, CSV export and print controls.
- Role links allow navigation between workspaces.
- The login is a visual entry point only. It does not authenticate users.
- The sample data and actions are illustrative. There is no server, API, shared database, real-time synchronization, actual SMS/payment/insurance integration, or secure clinical record storage.
- Browser local storage is device/browser-specific. Clearing browser data removes saved entries.

## Folder structure
- `assets/styles.css` — responsive UI
- `assets/app.js` — static interactions
- `login.html` — role-select sign-in screen
- `<role-folder>/*.html` — full pages for each role and module

## Important
This package is a front-end workflow prototype, not a production hospital information system. Do not use it for actual patient care or store real patient information in it. Production deployment requires backend services, authentication, access enforcement, audit logging, validated clinical workflows, backups, and security/compliance review.
