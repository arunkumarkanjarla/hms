# Admin Control Centre – design (round 2)

## Principle
The admin is the single source of truth. Every master and rule lives in `db.config`, plus the existing master collections, inside the one shared store (`careaxis_db_v2`, managed by `hms-core.js`). Role modules never hard-code masters; they read them through `HMS` getters and core rules. That means an admin change applies to every role, on web and mobile:
- **Same tab:** applies on the next render.
- **Other tabs/windows:** applies live, because core re-reads the store on the browser `storage` event and fires `HMS.onExternal` listeners. The web and mobile shells re-render when it fires.

Workflows follow NABH/JCI-style controls: consent before admission, deposit rules, discount approval limits, the WHO OT checklist, triage targets, and audit of every admin change.

## Who can administer
- **platform-admin:** full control centre, including RBAC, feature flags, maintenance and import.
- **hospital-management:** same control centre minus maintenance and RBAC editing (read-only).
- The control centre is at web `platform-admin/system-settings.html` and `hospital-management/settings.html`, with sections addressed by `#section`.
- Mobile `system-admin/settings.html` exposes the operational subset: doctor leave/fee/active, broadcasts, flags, maintenance.

## Masters & rules → consumers
| Admin master / rule | Stored in | Read by (effect) |
|---|---|---|
| Hospital profile, branches | config.hospital, config.branches | Headers, receipts/invoices, patient app info page |
| Departments & specialties (active) | config.departments | `HMS.DEPTS` → booking chips, doctor forms, MIS, queue |
| Doctors: profile, fee, video fee, consult types, OPD days/hours/slot length, active, leave | db.doctors | `slotsFor`/`bookAppointment`: inactive → hidden & not bookable; leave/off-day → no slots; fee → price at booking & bill; no "Video" → not offered for teleconsult |
| Staff users, roles, permissions matrix | db.users, config.rbac | `canAccess`: menu links hidden + page blocked (web nav, workspaces, mobile apps) |
| Wards/bed types, bed tariff, beds | db.wards, db.beds | Bed board, admission, `ipdBill` bed charges |
| Service/procedure tariff, packages | db.tariffs, config.packages | Billing add-service, package billing |
| Lab test master (params, ranges, TAT, price, active) | config.labTests | `HMS.LABTESTS` → doctor order list, lab result ranges/flags, invoice line price |
| Radiology master | config.radTests | `HMS.RADTESTS` → orders and billing |
| Drug formulary (price, reorder, active) | db.items | e-Rx drug list, dispense price, low-stock alerts |
| Insurance/TPA panels + rules (co-pay %, pre-auth limit, room-rent cap) | config.insurers | `HMS.INSURERS` → registration, claims (co-pay split, pre-auth flag) |
| Billing rules: GST %, discount approval limit per role, IPD deposit minimum per ward type | config.billing | Pharmacy invoice tax, `applyDiscount` limit check, `admit` deposit check |
| OT rooms | db.theatres | OT booking/schedule |
| ER triage config (levels, target minutes) | config.triage | ER triage choices and overdue flags |
| Queue/token rules (prefix per department, average consult minutes, max tokens) | config.queue | `checkIn` token prefix/cap, wait-time estimate |
| Appointment rules (booking window, slot minutes, lunch break, cancellation cut-off hours) | config.appt | Slot picker, booking validation, patient cancel |
| Notification templates | config.templates | Core `notify` for booking, check-in, report, payment |
| Broadcasts/banners (audience, until) | config.broadcasts | Patient app home + every app/web shell banner |
| Feature flags | config.flags | Patient app: teleconsult, online booking, payments, family, SOS, reminders, self-registration |
| Maintenance mode (message, allowed roles) | config.maintenance | `canAccess` blocks all other roles and shows a maintenance screen |
| Content: FAQs, consent forms | config.content | Patient help, admission consent |
| Audit log | db.audit | Every admin change is logged as `Config: …` |
| MIS reports / CSV | derived | Admin reports section, with CSV export |
| Export / Import config JSON | `HMS.exportConfig()` / `importConfig()` | Download/upload; validated, audited, then applied everywhere |

## Core API added
- `HMS.cfg()`; `HMS.setCfg(path, value, note)`; `HMS.upsert(collectionOrCfgPath, obj, key)`; `HMS.removeFrom(path, id)`.
- `HMS.applyDiscount(invId, amount, reason)`; `HMS.exportConfig()`; `HMS.importConfig(json)`; `HMS.onExternal(fn)`.
- `HMS.broadcastsFor(aud)`; `HMS.flag(name)`; `HMS.doctorBookable(id, date)`; `HMS.triageLevels()`.
- Existing data in the browser is migrated in place (`ensureConfig`), so no reset is needed.

## Tests
`test-flows.js` admin-control tests check that:
- A doctor fee change shows as the new price in the patient app.
- A disabled doctor can't be booked.
- Doctor leave blocks slots.
- A new lab test can be ordered by the doctor and billed.
- A bed tariff change shows in the IPD bill.
- A removed role permission hides the menu and blocks the page.
- Broadcasts reach the patient app.
- The teleconsult flag works.
- Maintenance mode blocks access.
- Discount limits are enforced.
- The booking window is enforced.
- The token prefix is applied.
- Export/import works.
- Changes made in one tab reach another tab live.
