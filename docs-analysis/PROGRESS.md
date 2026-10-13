# PROGRESS (CareAxis HMS static rebuild)
- [x] Backup: D:\git\hms_backup_20261012-2255
- [x] Analysis -> PROJECT-ANALYSIS.md
- [x] Shared engine assets/hms-core.js; web hms-ui.js/hms-app.js/hms-app.css; mobile mobile-app.js/mobile-app.css
- [x] All 218 pages rewired (tools/patch-html.js); node --check green
- [x] test-flows.js: 24/24 end-to-end flows pass
- [x] Fixes from tests: slot picker skips full days; onboarding re-renders without reload; seed claims; login demo buttons show selection; sheet close state
- [x] Final crawl.js all: 220 pages, 0 errors, 0 dead links, 0 inert (1054 buttons clicked); flows 24/24
- [x] CHANGES.md

## Round 2 (admin control)
- [x] Backup D:\git\hms_backup_20261013-0720
- [x] ADMIN-CONTROL-DESIGN.md
- [ ] core config layer + rules
- [ ] web Admin Control Centre (hms-admin.js)
- [ ] mobile reads masters/flags/broadcasts + admin subset
- [ ] admin-control tests + crawl green

## Round 2 status (2026-10-13) - COMPLETE
- [x] Backup D:\git\hms_backup_20261013-0720
- [x] ADMIN-CONTROL-DESIGN.md
- [x] hms-core.js config layer (masters, rules, flags, maintenance, RBAC, templates, broadcasts, export/import, live storage sync) - both apps
- [x] hms-admin.js Admin Control Centre (web: platform-admin/system-settings + hospital-management/settings), script tag on 116 pages
- [x] hms-app.css linked on 117 web pages (was never linked before; holds cx-* + admin styles)
- [x] hms-app.js: locked links for any module hidden (not only dashboards), active doctors, config triage, discount limits, banners, maintenance screen
- [x] Mobile: flags, active doctors/consult types/tele fee, banners, FAQs/hospital profile from config, maintenance + self-registration gate, byPatient cancel, triage, discount limit, live re-render, mobile admin control centre (system-admin/settings)
- [x] test-flows.js: 12 admin-control flows added -> 36/36 PASS
- [x] crawl.js all -> 220 pages clean, 1297 buttons, 0 inert, 0 dead links
