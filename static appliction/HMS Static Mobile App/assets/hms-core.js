/* CareAxis HMS - shared client-side data engine (static demo, synthetic data only).
   Shared by the web workspaces and the mobile app through localStorage key "careaxis_db_v2". */
(function (root) {
  'use strict';
  var KEY = 'careaxis_db_v2', SKEY = 'careaxis_session_v2';
  var mem = {}; // fallback when localStorage is unavailable
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] == null ? null : mem[k]; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }

  // ---------- deterministic random ----------
  var seed = 20261012;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  var DAY = 864e5;
  function iso(d) { return new Date(d).toISOString(); }
  function dateOnly(d) { var x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
  function today() { return dateOnly(Date.now()); }
  function at(dayOffset, hh, mm) { var d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hh, mm || 0, 0, 0); return iso(d); }

  var FIRST_M = ['Ramesh', 'Arjun', 'Vikram', 'Suresh', 'Mohammed', 'Rahul', 'Karthik', 'Imran', 'Rohit', 'Sanjay', 'Venkat', 'Prakash', 'Harish', 'Naveen', 'Abdul', 'Joseph'];
  var FIRST_F = ['Anita', 'Priya', 'Lakshmi', 'Fatima', 'Kavya', 'Sneha', 'Meera', 'Divya', 'Pooja', 'Asha', 'Swathi', 'Nandini', 'Rekha', 'Sunita', 'Ayesha', 'Mary'];
  var LAST = ['Kumar', 'Sharma', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Patel', 'Khan', 'Singh', 'Gupta', 'Menon', 'Das', 'Joshi', 'Verma', 'Pillai', 'Naidu'];
  var CITIES = ['Hyderabad', 'Secunderabad', 'Warangal', 'Bengaluru', 'Chennai', 'Vijayawada'];
  var DEPTS = ['General Medicine', 'Cardiology', 'Orthopaedics', 'Paediatrics', 'Obstetrics & Gynaecology', 'ENT', 'Dermatology', 'Neurology', 'General Surgery', 'Emergency'];
  var PAYERS = ['Self-pay', 'Self-pay', 'Insurance / TPA', 'Government scheme', 'Corporate'];
  var INSURERS = ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Care Health', 'Niva Bupa', 'Aarogyasri'];

  var LABTESTS = [
    { code: 'CBC', name: 'Complete Blood Count', price: 350, sample: 'EDTA blood', tat: 4, params: [['Haemoglobin', 'g/dL', 12, 16], ['WBC', 'x10^3/uL', 4, 11], ['Platelets', 'x10^3/uL', 150, 450]] },
    { code: 'FBS', name: 'Fasting Blood Sugar', price: 120, sample: 'Fluoride plasma', tat: 2, params: [['Glucose (fasting)', 'mg/dL', 70, 100]] },
    { code: 'HBA1C', name: 'HbA1c', price: 550, sample: 'EDTA blood', tat: 6, params: [['HbA1c', '%', 4, 5.6]] },
    { code: 'LFT', name: 'Liver Function Test', price: 750, sample: 'Serum', tat: 6, params: [['SGPT/ALT', 'U/L', 7, 56], ['SGOT/AST', 'U/L', 5, 40], ['Bilirubin total', 'mg/dL', 0.2, 1.2]] },
    { code: 'KFT', name: 'Kidney Function Test', price: 700, sample: 'Serum', tat: 6, params: [['Creatinine', 'mg/dL', 0.6, 1.3], ['Urea', 'mg/dL', 15, 45]] },
    { code: 'LIPID', name: 'Lipid Profile', price: 650, sample: 'Serum', tat: 6, params: [['Total cholesterol', 'mg/dL', 0, 200], ['LDL', 'mg/dL', 0, 130], ['HDL', 'mg/dL', 40, 80]] },
    { code: 'TROP', name: 'Troponin I', price: 1200, sample: 'Serum', tat: 1, params: [['Troponin I', 'ng/mL', 0, 0.04]] },
    { code: 'TSH', name: 'Thyroid Stimulating Hormone', price: 400, sample: 'Serum', tat: 8, params: [['TSH', 'mIU/L', 0.4, 4.0]] },
    { code: 'URINE', name: 'Urine Routine', price: 200, sample: 'Urine', tat: 3, params: [['Pus cells', '/hpf', 0, 5]] },
    { code: 'CRP', name: 'C-Reactive Protein', price: 450, sample: 'Serum', tat: 4, params: [['CRP', 'mg/L', 0, 6]] }
  ];
  var RADTESTS = [
    { code: 'XR-CH', name: 'X-Ray Chest PA', modality: 'X-Ray', price: 450 },
    { code: 'XR-KN', name: 'X-Ray Knee AP/Lat', modality: 'X-Ray', price: 550 },
    { code: 'US-AB', name: 'Ultrasound Abdomen', modality: 'Ultrasound', price: 1200 },
    { code: 'CT-BR', name: 'CT Brain Plain', modality: 'CT', price: 3500 },
    { code: 'MR-LS', name: 'MRI Lumbar Spine', modality: 'MRI', price: 7500 },
    { code: 'ECHO', name: '2D Echocardiography', modality: 'Echo', price: 2200 },
    { code: 'ECG', name: 'ECG 12-lead', modality: 'ECG', price: 300 }
  ];
  var DRUGS = [
    ['Paracetamol 650 mg', 'Tablet', 2.5], ['Amoxicillin 500 mg', 'Capsule', 8], ['Azithromycin 500 mg', 'Tablet', 22], ['Pantoprazole 40 mg', 'Tablet', 6],
    ['Metformin 500 mg', 'Tablet', 3], ['Amlodipine 5 mg', 'Tablet', 4], ['Atorvastatin 20 mg', 'Tablet', 9], ['Aspirin 75 mg', 'Tablet', 1.5],
    ['Cetirizine 10 mg', 'Tablet', 2], ['Ondansetron 4 mg', 'Tablet', 5], ['Ibuprofen 400 mg', 'Tablet', 3], ['Telmisartan 40 mg', 'Tablet', 7],
    ['ORS sachet', 'Sachet', 20], ['Insulin Glargine 100IU', 'Pen', 780], ['Ceftriaxone 1 g', 'Injection', 65], ['Salbutamol inhaler', 'Inhaler', 160],
    ['Vitamin D3 60K', 'Capsule', 30], ['Normal Saline 500 ml', 'IV fluid', 35], ['Diclofenac gel', 'Tube', 95], ['Clopidogrel 75 mg', 'Tablet', 6]
  ];
  var SUPPLIES = [['Surgical gloves (box)', 'Consumable', 420], ['Syringe 5 ml', 'Consumable', 6], ['IV cannula 20G', 'Consumable', 45], ['N95 mask', 'Consumable', 55], ['Gauze roll', 'Consumable', 30], ['Suture vicryl 2-0', 'Surgical', 310], ['Knee implant (TKR)', 'Implant', 85000], ['Drug-eluting stent', 'Implant', 32000]];
  var DX = ['Hypertension (I10)', 'Type 2 diabetes mellitus (E11)', 'Acute upper respiratory infection (J06.9)', 'Gastritis (K29.7)', 'Osteoarthritis knee (M17.1)', 'Migraine (G43.9)', 'Stable angina (I20.8)', 'Viral fever (A99)', 'Low back pain (M54.5)', 'Allergic rhinitis (J30.4)'];
  var COMPLAINTS = ['Fever and body ache for 3 days', 'Chest pain on exertion', 'Knee pain while climbing stairs', 'Cough and cold', 'Headache since morning', 'Burning sensation in stomach', 'Follow-up for sugar control', 'Lower back pain', 'Skin rash and itching', 'Routine health check-up'];

  function uid(prefix) { return prefix + '-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 90 + 10); }

  function buildSeed() {
    seed = 20261012;
    var db = { version: 2, createdAt: iso(Date.now()), counters: { uhid: 1240, token: {}, inv: 3100, rx: 5200, lab: 8100, rad: 900, adm: 410, ot: 120, er: 330, po: 70, claim: 210 } };
    db.hospitals = [
      { id: 'HSP-01', name: 'CareAxis CityCare Hospital', city: 'Hyderabad', beds: 120, plan: 'Enterprise', status: 'Active', users: 214, since: '2024-04-01' },
      { id: 'HSP-02', name: 'CareAxis Sunrise Clinic', city: 'Warangal', beds: 40, plan: 'Growth', status: 'Active', users: 58, since: '2025-01-15' },
      { id: 'HSP-03', name: 'Green Valley Multispeciality', city: 'Vijayawada', beds: 200, plan: 'Enterprise', status: 'Onboarding', users: 12, since: '2026-09-20' },
      { id: 'HSP-04', name: 'Lotus Children\'s Hospital', city: 'Bengaluru', beds: 80, plan: 'Growth', status: 'Active', users: 96, since: '2025-06-02' }
    ];
    db.plans = [{ id: 'PL-1', name: 'Starter', price: 15000, beds: '≤ 30 beds', modules: 'OPD, Billing, Pharmacy' }, { id: 'PL-2', name: 'Growth', price: 45000, beds: '≤ 100 beds', modules: '+ IPD, Lab, Radiology' }, { id: 'PL-3', name: 'Enterprise', price: 120000, beds: 'Unlimited', modules: 'All modules + OT, HR, analytics' }];
    db.integrations = [{ id: 'INT-1', name: 'UPI payment gateway', status: 'Sandbox', last: at(0, 9, 12) }, { id: 'INT-2', name: 'SMS / WhatsApp notifications', status: 'Sandbox', last: at(0, 10, 4) }, { id: 'INT-3', name: 'LIS analyser interface (HL7)', status: 'Planned', last: '' }, { id: 'INT-4', name: 'PACS / DICOM viewer', status: 'Planned', last: '' }, { id: 'INT-5', name: 'ABHA / health ID link', status: 'Sandbox', last: at(-1, 16, 40) }, { id: 'INT-6', name: 'TPA claim portal', status: 'Planned', last: '' }];
    db.settings = { hospitalName: 'CareAxis CityCare Hospital', gstin: '36AAACC1234F1Z5', consultFee: 500, followupDays: 7, tokenPrefix: 'T', currency: 'INR', otpDemoCode: '123456', theme: 'light' };

    // Doctors
    var docNames = [['Dr. Anand Rao', 'Cardiology'], ['Dr. Meera Iyer', 'General Medicine'], ['Dr. Sameer Khan', 'Orthopaedics'], ['Dr. Kavitha Reddy', 'Paediatrics'], ['Dr. Lakshmi Menon', 'Obstetrics & Gynaecology'], ['Dr. Vivek Sharma', 'ENT'], ['Dr. Nisha Patel', 'Dermatology'], ['Dr. Arvind Nair', 'Neurology'], ['Dr. Rajesh Gupta', 'General Surgery'], ['Dr. Farah Ali', 'Emergency']];
    db.doctors = docNames.map(function (d, i) { return { id: 'DOC-' + (101 + i), name: d[0], dept: d[1], qual: pick(['MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'MBBS, DM']), exp: ri(6, 25), fee: [800, 500, 700, 600, 700, 500, 600, 900, 700, 500][i], room: 'OPD-' + (10 + i), rating: (4 + rnd() * 0.9).toFixed(1), tele: i % 3 !== 2, days: 'Mon-Sat', start: '09:00', end: '17:00' }; });

    // Staff / users
    db.staff = [];
    var roles = [['Nurse', 'Nursing', 26], ['Lab Technician', 'Laboratory', 6], ['Radiographer', 'Radiology', 4], ['Pharmacist', 'Pharmacy', 5], ['Front Office Executive', 'Front Office', 6], ['Billing Executive', 'Billing', 4], ['Housekeeping', 'Support', 8], ['Store Keeper', 'Stores', 3], ['HR Executive', 'HR', 2], ['OT Technician', 'Operation Theatre', 4]];
    var sid = 2001;
    db.doctors.forEach(function (d) { db.staff.push({ id: 'EMP-' + (sid++), name: d.name, role: 'Consultant', dept: d.dept, phone: '98' + ri(10000000, 99999999), joined: dateOnly(Date.now() - ri(200, 3000) * DAY), salary: ri(150, 260) * 1000, shift: 'General', status: 'Active', licence: 'TSMC/' + ri(20000, 90000), licenceExpiry: dateOnly(Date.now() + ri(-20, 700) * DAY) }); });
    roles.forEach(function (r) { for (var k = 0; k < Math.min(r[2], 6); k++) { var f = rnd() > 0.45; db.staff.push({ id: 'EMP-' + (sid++), name: (f ? pick(FIRST_F) : pick(FIRST_M)) + ' ' + pick(LAST), role: r[0], dept: r[1], phone: '9' + ri(100000000, 999999999), joined: dateOnly(Date.now() - ri(100, 2500) * DAY), salary: ri(18, 65) * 1000, shift: pick(['Morning', 'Evening', 'Night', 'General']), status: rnd() > 0.93 ? 'On leave' : 'Active', licence: r[0] === 'Nurse' ? 'TSNC/' + ri(10000, 99999) : '', licenceExpiry: r[0] === 'Nurse' ? dateOnly(Date.now() + ri(-10, 600) * DAY) : '' }); } });

    db.users = [
      { id: 'U-1', name: 'Arunkumar K', email: 'admin@careaxis.demo', role: 'platform-admin', status: 'Active', last: at(0, 9, 2) },
      { id: 'U-2', name: 'Sunita Rao', email: 'ceo@careaxis.demo', role: 'hospital-management', status: 'Active', last: at(0, 8, 40) },
      { id: 'U-3', name: 'Pooja Verma', email: 'frontdesk@careaxis.demo', role: 'front-desk', status: 'Active', last: at(0, 8, 55) },
      { id: 'U-4', name: 'Dr. Meera Iyer', email: 'doctor@careaxis.demo', role: 'doctor', status: 'Active', last: at(0, 9, 10), doctorId: 'DOC-102' },
      { id: 'U-5', name: 'Asha Nair', email: 'nurse@careaxis.demo', role: 'nurse', status: 'Active', last: at(0, 7, 5) },
      { id: 'U-6', name: 'Dr. Farah Ali', email: 'er@careaxis.demo', role: 'emergency', status: 'Active', last: at(0, 6, 50), doctorId: 'DOC-110' },
      { id: 'U-7', name: 'Karthik Das', email: 'lab@careaxis.demo', role: 'laboratory', status: 'Active', last: at(0, 8, 0) },
      { id: 'U-8', name: 'Joseph Pillai', email: 'radiology@careaxis.demo', role: 'radiology', status: 'Active', last: at(0, 8, 20) },
      { id: 'U-9', name: 'Fatima Khan', email: 'pharmacy@careaxis.demo', role: 'pharmacy', status: 'Active', last: at(0, 8, 30) },
      { id: 'U-10', name: 'Rohit Joshi', email: 'billing@careaxis.demo', role: 'billing-insurance', status: 'Active', last: at(0, 8, 45) },
      { id: 'U-11', name: 'Rekha Menon', email: 'ward@careaxis.demo', role: 'ipd-ward', status: 'Active', last: at(0, 7, 30) },
      { id: 'U-12', name: 'Dr. Rajesh Gupta', email: 'ot@careaxis.demo', role: 'operation-theatre', status: 'Active', last: at(0, 7, 45), doctorId: 'DOC-109' },
      { id: 'U-13', name: 'Venkat Naidu', email: 'stores@careaxis.demo', role: 'inventory-purchase', status: 'Active', last: at(-1, 17, 10) },
      { id: 'U-14', name: 'Divya Singh', email: 'hr@careaxis.demo', role: 'hr-payroll', status: 'Active', last: at(-1, 18, 0) },
      { id: 'U-15', name: 'Swathi Reddy', email: 'mrd@careaxis.demo', role: 'medical-records', status: 'Active', last: at(-1, 16, 0) }
    ];

    // Patients
    db.patients = [];
    for (var i = 0; i < 42; i++) {
      var g = rnd() > 0.5 ? 'Female' : 'Male', fn = g === 'Female' ? pick(FIRST_F) : pick(FIRST_M), payer = pick(PAYERS);
      var p = { id: 'UHID-' + (db.counters.uhid++), name: fn + ' ' + pick(LAST), gender: g, dob: dateOnly(Date.now() - ri(2, 82) * 365.25 * DAY - ri(0, 300) * DAY), mobile: '9' + ri(100000000, 999999999), city: pick(CITIES), blood: pick(['A+', 'B+', 'O+', 'AB+', 'O-', 'B-']), payer: payer, insurer: payer === 'Insurance / TPA' ? pick(INSURERS) : (payer === 'Government scheme' ? 'Aarogyasri' : ''), policy: payer === 'Self-pay' ? '' : 'POL' + ri(100000, 999999), allergies: rnd() > 0.8 ? pick(['Penicillin', 'Sulfa drugs', 'Peanuts', 'Dust']) : 'None known', registered: iso(Date.now() - ri(0, 400) * DAY), photo: '', verified: true, family: [] };
      if (i === 0) { p.name = 'Ramesh Kumar'; p.gender = 'Male'; p.dob = dateOnly(Date.now() - 54 * 365.25 * DAY); p.mobile = '9876543210'; p.payer = 'Insurance / TPA'; p.insurer = 'Star Health'; p.policy = 'POL552210'; p.allergies = 'Penicillin'; p.family = [{ name: 'Lakshmi Kumar', relation: 'Spouse', age: 50, uhid: '' }, { name: 'Arjun Kumar', relation: 'Son', age: 22, uhid: '' }]; }
      db.patients.push(p);
    }

    db.appointments = []; db.encounters = []; db.prescriptions = []; db.labOrders = []; db.radOrders = []; db.invoices = []; db.payments = []; db.claims = []; db.notifications = []; db.audit = []; db.vitals = []; db.mar = []; db.notes = [];
    var tokenNo = {};
    function tok(dept) { tokenNo[dept] = (tokenNo[dept] || 0) + 1; return (dept === 'Emergency' ? 'E' : dept.charAt(0)) + '-' + String(tokenNo[dept]).padStart(3, '0'); }
    // Past encounters (history) + today's OPD
    for (var j = 0; j < 70; j++) {
      var pat = db.patients[j % db.patients.length], doc = db.doctors[j % 9];
      var off = j < 26 ? 0 : -ri(1, 120), h = 9 + (j % 8), m = (j * 7) % 60;
      var st = off < 0 ? 'Completed' : pick(['Booked', 'Checked-in', 'Checked-in', 'Waiting', 'In consultation', 'Completed', 'Completed']);
      if (j === 0) { st = 'Booked'; off = 1; doc = db.doctors[0]; h = 10; m = 30; }
      var appt = { id: 'APT-' + (5000 + j), patientId: pat.id, doctorId: doc.id, dept: doc.dept, when: at(off, h, m), type: pick(['New', 'Follow-up', 'Follow-up', 'Teleconsult']), status: st, token: '', source: pick(['Walk-in', 'App', 'Phone', 'Website']), fee: doc.fee, complaint: pick(COMPLAINTS), createdAt: at(off - 1, 18, 0) };
      if (off === 0 && st !== 'Booked') { appt.token = tok(doc.dept); appt.checkedInAt = at(0, h - 1 < 8 ? 8 : h - 1, 40); }
      db.appointments.push(appt);
      if (st === 'Completed') addEncounter(db, appt, true);
    }
    db.counters.token = tokenNo;
    // pending pharmacy / lab for today
    // Beds
    db.wards = [{ id: 'W-GEN-M', name: 'General Ward (Male)', type: 'General', rate: 1500 }, { id: 'W-GEN-F', name: 'General Ward (Female)', type: 'General', rate: 1500 }, { id: 'W-SEMI', name: 'Semi-private', type: 'Semi-private', rate: 3000 }, { id: 'W-PVT', name: 'Private Rooms', type: 'Private', rate: 5500 }, { id: 'W-ICU', name: 'ICU', type: 'ICU', rate: 12000 }, { id: 'W-PICU', name: 'Paediatric ICU', type: 'ICU', rate: 11000 }];
    db.beds = [];
    var counts = { 'W-GEN-M': 16, 'W-GEN-F': 16, 'W-SEMI': 10, 'W-PVT': 8, 'W-ICU': 10, 'W-PICU': 6 };
    db.wards.forEach(function (w) { for (var b = 1; b <= counts[w.id]; b++) db.beds.push({ id: w.id.replace('W-', '') + '-' + String(b).padStart(2, '0'), ward: w.id, status: 'Available', patientId: '', admissionId: '' }); });
    db.admissions = [];
    var admitted = db.patients.slice(5, 30);
    admitted.forEach(function (p, k) {
      var bed = db.beds[(k * 3 + 1) % db.beds.length];
      if (bed.status !== 'Available') return;
      var d = db.doctors[k % 9];
      var a = { id: 'ADM-' + (db.counters.adm++), patientId: p.id, doctorId: d.id, dept: d.dept, bedId: bed.id, ward: bed.ward, admittedAt: iso(Date.now() - ri(0, 6) * DAY - ri(1, 20) * 36e5), reason: pick(DX), status: k % 9 === 0 ? 'Discharge planned' : 'Admitted', deposit: ri(5, 50) * 1000, payer: p.payer, diet: pick(['Normal', 'Diabetic', 'Soft', 'Low salt', 'NBM']), consent: k % 4 !== 1 ? 'Signed' : 'Pending', expectedDischarge: dateOnly(Date.now() + ri(0, 5) * DAY) };
      bed.status = 'Occupied'; bed.patientId = p.id; bed.admissionId = a.id;
      db.admissions.push(a);
      db.vitals.push({ id: uid('VIT'), patientId: p.id, admissionId: a.id, at: at(0, 6, 0), bp: ri(110, 150) + '/' + ri(70, 95), pulse: ri(64, 104), temp: (97 + rnd() * 3).toFixed(1), spo2: ri(92, 100), rr: ri(14, 22), pain: ri(0, 6), by: 'Asha Nair', news: ri(0, 6) });
      var drug = pick(DRUGS);
      ['08:00', '14:00', '20:00'].forEach(function (t, q) { db.mar.push({ id: uid('MAR'), admissionId: a.id, patientId: p.id, drug: drug[0], dose: '1 ' + drug[1].toLowerCase(), route: drug[1] === 'Injection' ? 'IV' : 'Oral', time: t, status: q === 0 ? 'Given' : 'Due', by: q === 0 ? 'Asha Nair' : '' }); });
    });
    db.beds.forEach(function (b, k) { if (b.status === 'Available' && k % 11 === 0) b.status = 'Cleaning'; if (b.status === 'Available' && k % 17 === 5) b.status = 'Reserved'; });
    db.transfers = [];

    // ER
    db.erCases = [];
    for (var e = 0; e < 7; e++) { var ep = db.patients[30 + e]; db.erCases.push({ id: 'ER-' + (db.counters.er++), patientId: ep.id, arrival: at(0, ri(0, 10), ri(0, 59)), mode: pick(['Ambulance', 'Walk-in', 'Referred', 'Police']), complaint: pick(['Road traffic accident', 'Chest pain', 'Breathlessness', 'Fall from height', 'Seizure', 'High fever with drowsiness', 'Abdominal pain']), triage: pick(['Red', 'Orange', 'Yellow', 'Green']), status: pick(['Triage', 'Under treatment', 'Under treatment', 'Observation', 'Disposition pending']), mlc: e % 3 === 0, mlcNo: e % 3 === 0 ? 'MLC/' + ri(100, 999) + '/26' : '', interventions: ['IV access secured'], vitals: 'BP ' + ri(90, 160) + '/' + ri(60, 100) + ', HR ' + ri(70, 130) + ', SpO2 ' + ri(86, 99) + '%', disposition: '' }); }

    // OT
    db.theatres = [{ id: 'OT-1', name: 'OT 1 - General', status: 'In use' }, { id: 'OT-2', name: 'OT 2 - Ortho', status: 'Available' }, { id: 'OT-3', name: 'OT 3 - Cardiac', status: 'Cleaning' }];
    db.otCases = [];
    var procs = [['Laparoscopic cholecystectomy', 'DOC-109'], ['Total knee replacement', 'DOC-103'], ['Appendectomy', 'DOC-109'], ['Coronary angioplasty', 'DOC-101'], ['Caesarean section', 'DOC-105'], ['ORIF radius', 'DOC-103'], ['Tonsillectomy', 'DOC-106']];
    procs.forEach(function (pr, k) { var a = db.admissions[k]; db.otCases.push({ id: 'OTC-' + (db.counters.ot++), patientId: a.patientId, admissionId: a.id, procedure: pr[0], surgeonId: pr[1], anaesthetist: 'Dr. Prakash Joshi', theatre: db.theatres[k % 3].id, when: at(k < 4 ? 0 : 1, 8 + k * 2 % 10, 0), duration: ri(45, 180), status: ['Completed', 'In progress', 'Scheduled', 'Scheduled', 'Scheduled', 'Requested', 'Scheduled'][k], checklist: { signIn: k < 2, timeOut: k < 2, signOut: k < 1 }, recovery: k === 0 ? { aldrete: 9, at: at(0, 10, 15), status: 'In PACU' } : null, implants: pr[0] === 'Total knee replacement' ? ['Knee implant (TKR)'] : (pr[0] === 'Coronary angioplasty' ? ['Drug-eluting stent'] : []), consent: k === 5 ? 'Pending' : 'Signed' }); });

    // Inventory
    db.suppliers = [{ id: 'SUP-1', name: 'MedPlus Distributors', contact: '040-2345 6789', gst: '36ABCDE1234F1Z1', rating: 4.6, leadDays: 2, category: 'Pharmaceuticals' }, { id: 'SUP-2', name: 'Sri Sai Surgicals', contact: '040-2777 1200', gst: '36PQRS5678K1Z2', rating: 4.2, leadDays: 3, category: 'Consumables' }, { id: 'SUP-3', name: 'Ortho Implants India', contact: '080-4110 9000', gst: '29LMNOP9087Q1Z3', rating: 4.8, leadDays: 5, category: 'Implants' }, { id: 'SUP-4', name: 'Deccan Pharma Agencies', contact: '040-2398 1122', gst: '36WXYZ4321A1Z4', rating: 3.9, leadDays: 2, category: 'Pharmaceuticals' }];
    db.items = [];
    DRUGS.forEach(function (d, k) { db.items.push({ id: 'ITM-' + (100 + k), name: d[0], form: d[1], category: 'Medicine', store: 'Pharmacy', price: d[2], stock: k === 7 ? 40 : ri(60, 900), reorder: 100, batch: 'B' + ri(1000, 9999), expiry: dateOnly(Date.now() + (k % 6 === 0 ? ri(10, 80) : ri(120, 700)) * DAY), supplierId: k % 2 ? 'SUP-1' : 'SUP-4', rack: 'R' + ri(1, 9) + '-' + ri(1, 5) }); });
    SUPPLIES.forEach(function (d, k) { db.items.push({ id: 'ITM-' + (200 + k), name: d[0], form: d[1], category: d[1], store: 'Central store', price: d[2], stock: k === 2 ? 30 : ri(5, 600), reorder: d[1] === 'Implant' ? 3 : 80, batch: 'S' + ri(1000, 9999), expiry: dateOnly(Date.now() + ri(200, 900) * DAY), supplierId: d[1] === 'Implant' ? 'SUP-3' : 'SUP-2', rack: 'C' + ri(1, 6) }); });
    db.indents = [{ id: 'IND-301', from: 'Ward 2 (General Male)', items: 'IV cannula 20G x 50, Gauze roll x 20', priority: 'Normal', status: 'Pending', at: at(0, 8, 15), by: 'Asha Nair' }, { id: 'IND-302', from: 'ICU', items: 'Normal Saline 500 ml x 40', priority: 'Urgent', status: 'Approved', at: at(0, 7, 5), by: 'Rekha Menon' }, { id: 'IND-303', from: 'OT 1', items: 'Suture vicryl 2-0 x 12', priority: 'Normal', status: 'Issued', at: at(-1, 15, 30), by: 'OT store' }];
    db.purchaseRequests = [{ id: 'PR-801', itemId: 'ITM-107', qty: 500, reason: 'Below reorder level', status: 'Pending approval', at: at(0, 9, 0), by: 'Venkat Naidu' }, { id: 'PR-802', itemId: 'ITM-202', qty: 300, reason: 'Below reorder level', status: 'Approved', at: at(-1, 11, 0), by: 'Venkat Naidu' }];
    db.pos = [{ id: 'PO-' + (db.counters.po++), supplierId: 'SUP-2', lines: [{ itemId: 'ITM-202', qty: 300, rate: 42 }], status: 'Sent', at: at(-1, 12, 0), expected: dateOnly(Date.now() + 2 * DAY) }, { id: 'PO-' + (db.counters.po++), supplierId: 'SUP-1', lines: [{ itemId: 'ITM-100', qty: 2000, rate: 2.1 }, { itemId: 'ITM-103', qty: 1000, rate: 5.2 }], status: 'Received', at: at(-5, 12, 0), expected: dateOnly(Date.now() - 2 * DAY) }];
    db.grns = [{ id: 'GRN-41', poId: db.pos[1].id, at: at(-2, 15, 0), status: 'Accepted', note: 'All items received in good condition' }];
    db.stockAudits = [{ id: 'SA-11', store: 'Pharmacy', at: at(-7, 17, 0), variance: 3, status: 'Closed' }];
    db.returns = [];

    // HR
    db.attendance = []; db.leaves = []; db.payroll = []; db.roster = [];
    db.staff.forEach(function (s, k) { db.attendance.push({ id: uid('ATT'), staffId: s.id, date: today(), in: s.status === 'On leave' ? '' : ('0' + ri(7, 9) + ':' + String(ri(0, 59)).padStart(2, '0')), status: s.status === 'On leave' ? 'Leave' : (k % 13 === 4 ? 'Late' : 'Present') }); });
    db.staff.slice(10, 16).forEach(function (s, k) { db.leaves.push({ id: 'LV-' + (60 + k), staffId: s.id, type: pick(['Casual', 'Sick', 'Earned']), from: dateOnly(Date.now() + k * DAY), to: dateOnly(Date.now() + (k + 2) * DAY), reason: pick(['Family function', 'Fever', 'Personal work', 'Travel']), status: k < 3 ? 'Pending' : 'Approved' }); });
    var shifts = ['Morning', 'Evening', 'Night'];
    db.staff.filter(function (s) { return s.role === 'Nurse'; }).forEach(function (s, k) { for (var dd = 0; dd < 7; dd++) db.roster.push({ id: uid('ROS'), staffId: s.id, date: dateOnly(Date.now() + dd * DAY), shift: shifts[(k + dd) % 3], ward: db.wards[k % db.wards.length].name }); });
    db.payrollRuns = [{ id: 'PAY-2026-09', month: 'September 2026', status: 'Paid', gross: 0, at: at(-12, 10, 0) }];

    // Records
    db.recordRequests = [{ id: 'ROI-71', patientId: db.patients[3].id, requester: 'Star Health TPA', purpose: 'Claim processing', status: 'Pending', at: at(0, 9, 30) }, { id: 'ROI-72', patientId: db.patients[8].id, requester: 'Patient (self)', purpose: 'Second opinion', status: 'Released', at: at(-2, 12, 0) }, { id: 'ROI-73', patientId: db.patients[12].id, requester: 'Court summons', purpose: 'Legal / MLC', status: 'Under review', at: at(-1, 14, 0) }];
    db.consents = db.admissions.slice(0, 10).map(function (a, k) { return { id: 'CON-' + (500 + k), patientId: a.patientId, admissionId: a.id, type: pick(['General admission', 'Surgical procedure', 'Anaesthesia', 'Blood transfusion', 'High-risk']), status: a.consent === 'Signed' ? 'Signed' : 'Pending', witness: 'Rekha Menon', at: a.admittedAt }; });
    db.files = db.patients.slice(0, 20).map(function (p, k) { return { id: 'MRD-' + (9000 + k), patientId: p.id, location: 'Rack ' + ri(1, 30) + '-' + pick(['A', 'B', 'C']), status: pick(['In archive', 'In archive', 'Issued to ward', 'Digitised']), coded: k % 3 !== 0, retainUntil: dateOnly(Date.now() + ri(300, 3600) * DAY) }; });
    db.qc = LABTESTS.slice(0, 6).map(function (t, k) { return { id: 'QC-' + (k + 1), test: t.name, level: pick(['Level 1', 'Level 2']), value: (rnd() * 2 - 1).toFixed(2), status: k === 3 ? 'Out of range (2SD)' : 'Within range', at: at(0, 7, 30) }; });
    db.modalities = [{ id: 'MOD-1', name: 'Digital X-Ray (Room 1)', modality: 'X-Ray', status: 'Available', next: 'Service due 22 Oct' }, { id: 'MOD-2', name: 'CT 128-slice', modality: 'CT', status: 'In use', next: 'Service due 05 Nov' }, { id: 'MOD-3', name: 'MRI 1.5T', modality: 'MRI', status: 'Available', next: 'Helium check 30 Oct' }, { id: 'MOD-4', name: 'Ultrasound (Room 3)', modality: 'Ultrasound', status: 'Available', next: '-' }, { id: 'MOD-5', name: 'Echo (Cardiac lab)', modality: 'Echo', status: 'Maintenance', next: 'Probe replacement' }];
    db.tariffs = [{ id: 'TF-1', service: 'Consultation - Specialist', category: 'OPD', price: 700 }, { id: 'TF-2', service: 'Consultation - General', category: 'OPD', price: 500 }, { id: 'TF-3', service: 'Registration fee', category: 'OPD', price: 100 }, { id: 'TF-4', service: 'General ward bed (per day)', category: 'IPD', price: 1500 }, { id: 'TF-5', service: 'ICU bed (per day)', category: 'IPD', price: 12000 }, { id: 'TF-6', service: 'Nursing charges (per day)', category: 'IPD', price: 600 }, { id: 'TF-7', service: 'OT charges (per hour)', category: 'OT', price: 9000 }, { id: 'TF-8', service: 'Emergency consultation', category: 'ER', price: 1000 }, { id: 'TF-9', service: 'Health check-up package', category: 'Package', price: 2999 }];

    // Some pending orders for today's in-consultation / completed visits
    db.patients.filter(function (p) { return p.payer === 'Insurance / TPA'; }).slice(0, 5).forEach(function (p, k) { var amt = [42500, 18300, 76000, 9800, 31250][k]; db.claims.push({ id: 'CLM-' + (db.counters.claim++), patientId: p.id, invoiceId: '', insurer: p.insurer || 'TPA', policy: p.policy, amount: amt, approved: k === 3 ? amt : 0, status: ['Submitted', 'Query', 'Draft', 'Settled', 'Approved'][k], at: at(-k - 1, 11, 0), type: k % 2 ? 'Pre-authorisation' : 'Final claim' }); });
    db.audit.push({ id: uid('AUD'), at: iso(Date.now()), user: 'system', action: 'Demo data generated', detail: 'Synthetic dataset seeded' });
    notify(db, 'patient', 'UHID-1240', 'Appointment reminder', 'Cardiology with Dr. Anand Rao tomorrow at 10:30 AM', 'appointment');
    notify(db, 'patient', 'UHID-1240', 'Report ready', 'Your Lipid Profile report is ready to view', 'report');
    notify(db, 'all', '', 'Welcome to CareAxis', 'This is a static demo with synthetic data. Changes are saved in this browser.', 'info');
    return db;
  }

  function addEncounter(db, appt, past) {
    var pat = appt.patientId;
    var enc = { id: 'ENC-' + appt.id.slice(4), apptId: appt.id, patientId: pat, doctorId: appt.doctorId, at: appt.when, complaint: appt.complaint, vitals: 'BP ' + ri(110, 150) + '/' + ri(70, 95) + ', Pulse ' + ri(64, 100), diagnosis: pick(DX), notes: 'Advised diet and exercise. Review if symptoms persist.', followUp: dateOnly(new Date(appt.when).getTime() + 7 * DAY), status: 'Signed' };
    db.encounters.push(enc);
    var rx = { id: 'RX-' + (db.counters.rx++), encounterId: enc.id, patientId: pat, doctorId: appt.doctorId, at: appt.when, items: [], status: past ? 'Dispensed' : 'Pending' };
    var n = ri(1, 3);
    for (var k = 0; k < n; k++) { var d = pick(DRUGS); rx.items.push({ drug: d[0], dose: pick(['1-0-1', '1-0-0', '0-0-1', '1-1-1', 'SOS']), days: pick([3, 5, 7, 10, 30]), instructions: pick(['After food', 'Before food', 'At bedtime', 'With water']) }); }
    db.prescriptions.push(rx);
    var lt = pick(LABTESTS);
    var lo = { id: 'LAB-' + (db.counters.lab++), patientId: pat, encounterId: enc.id, doctorId: appt.doctorId, test: lt.code, name: lt.name, at: appt.when, priority: 'Routine', status: past ? 'Verified' : 'Ordered', results: past ? lt.params.map(function (pp) { var v = +(pp[2] + (pp[3] - pp[2]) * (rnd() * 1.3)).toFixed(1); return { param: pp[0], value: v, unit: pp[1], range: pp[2] + ' - ' + pp[3], flag: v > pp[3] ? 'H' : (v < pp[2] ? 'L' : '') }; }) : [], sampleId: past ? 'S' + ri(10000, 99999) : '' };
    db.labOrders.push(lo);
    var fee = appt.fee || 500, inv = { id: 'INV-' + (db.counters.inv++), patientId: pat, type: 'OPD', at: appt.when, lines: [{ desc: 'Consultation fee', qty: 1, rate: fee }, { desc: lt.name, qty: 1, rate: lt.price }], discount: 0, status: past ? 'Paid' : 'Unpaid', ref: appt.id };
    db.invoices.push(inv);
    if (past) db.payments.push({ id: 'RCPT-' + inv.id.slice(4), invoiceId: inv.id, patientId: pat, amount: invTotal(inv), mode: pick(['UPI', 'Cash', 'Card', 'UPI']), at: appt.when, by: 'Front desk' });
  }

  function notify(db, role, target, title, body, kind) { db.notifications.unshift({ id: uid('NTF'), role: role, target: target || '', title: title, body: body, kind: kind || 'info', at: iso(Date.now()), read: false }); if (db.notifications.length > 200) db.notifications.length = 200; }
  function invTotal(inv) { var s = 0; (inv.lines || []).forEach(function (l) { s += (+l.qty || 1) * (+l.rate || 0); }); var net = Math.max(0, s - (+inv.discount || 0)); return Math.round(net + net * (+inv.taxPct || 0) / 100); }
  function invPaid(db, inv) { var s = 0; db.payments.forEach(function (p) { if (p.invoiceId === inv.id) s += +p.amount; }); return s; }

  // ---------- ADMIN CONFIG (single source of truth for every role) ----------
  var ALLROLES = ['platform-admin', 'hospital-management', 'front-desk', 'doctor', 'nurse', 'emergency', 'laboratory', 'radiology', 'pharmacy', 'billing-insurance', 'ipd-ward', 'operation-theatre', 'inventory-purchase', 'hr-payroll', 'medical-records', 'patient-portal'];
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function defaultConfig(db) {
    var rbac = {}; ALLROLES.forEach(function (r) { rbac[r] = (r === 'platform-admin' || r === 'hospital-management') ? ALLROLES.slice() : [r]; });
    rbac['front-desk'].push('patient-portal'); rbac['billing-insurance'].push('pharmacy');
    return {
      version: 1,
      hospital: { name: (db.settings && db.settings.hospitalName) || 'CareAxis CityCare Hospital', legalName: 'CareAxis Healthcare Pvt Ltd', gstin: (db.settings && db.settings.gstin) || '36AAACC1234F1Z5', accreditation: 'NABH (demo)', address: 'Road No. 12, Banjara Hills, Hyderabad 500034', phone: '040-4000 1234', email: 'care@careaxis.demo', opdHours: 'Mon-Sat 9:00 AM - 5:00 PM', emergency: '24 x 7' },
      branches: [{ id: 'BR-1', name: 'CityCare Banjara Hills (main)', city: 'Hyderabad', beds: 120, active: true }, { id: 'BR-2', name: 'CityCare Kukatpally clinic', city: 'Hyderabad', beds: 0, active: true }],
      departments: DEPTS.map(function (d, i) { return { code: 'D' + (i + 1), name: d, active: true, specialties: [], head: '' }; }),
      labTests: clone(LABTESTS).map(function (t) { t.active = true; return t; }),
      radTests: clone(RADTESTS).map(function (t) { t.active = true; return t; }),
      packages: [{ id: 'PKG-1', name: 'Executive health check', price: 4999, includes: 'CBC, FBS, LIPID, LFT, KFT, TSH, ECG, X-Ray chest, Physician consult', active: true }, { id: 'PKG-2', name: 'Normal delivery package (3 days)', price: 35000, includes: 'Semi-private room, delivery charges, paediatric check, medicines', active: true }, { id: 'PKG-3', name: 'Cataract surgery (per eye)', price: 28000, includes: 'Surgery, IOL, day-care', active: true }],
      insurers: INSURERS.map(function (n, i) { return { id: 'INS-' + (i + 1), name: n, type: n === 'Aarogyasri' ? 'Government' : (i % 2 ? 'TPA' : 'Insurer'), active: true, copayPct: n === 'Aarogyasri' ? 0 : 10, preauthAbove: 25000, roomRentCap: n === 'Aarogyasri' ? 2000 : 5000, cashless: true }; }),
      billing: { gstPharmacy: 12, gstServices: 0, roundOff: true, discountLimits: { 'billing-insurance': 10, 'front-desk': 5, 'pharmacy': 5, 'hospital-management': 100, 'platform-admin': 100 }, ipdDeposit: { General: 10000, 'Semi-private': 20000, Private: 30000, ICU: 50000 }, requireDeposit: true, receiptPrefix: 'RCPT' },
      triage: [{ level: 'Red', label: 'Immediate (resuscitation)', targetMin: 0 }, { level: 'Orange', label: 'Very urgent', targetMin: 10 }, { level: 'Yellow', label: 'Urgent', targetMin: 60 }, { level: 'Green', label: 'Standard', targetMin: 120 }],
      queue: { avgConsultMin: 8, maxTokensPerDoctor: 40, prefix: {}, tvShowNames: false },
      appt: { windowDays: 7, slotMinutes: 15, lunchStart: '13:00', lunchEnd: '14:00', cancelHoursBefore: 2, maxPerPatientPerDay: 3 },
      templates: [
        { key: 'appt_confirmed', title: 'Appointment confirmed', body: '{doctor} · {when}', active: true },
        { key: 'checked_in', title: 'You are checked in', body: 'Token {token} · {doctor} · Room {room}', active: true },
        { key: 'report_ready', title: 'Report ready', body: 'Your {test} report is ready to view', active: true },
        { key: 'payment_success', title: 'Payment successful', body: '₹{amount} paid for {invoice} via {mode}', active: true }
      ],
      broadcasts: [{ id: 'BC-1', text: 'Free diabetes screening camp this Saturday 9 AM - 1 PM at OPD block.', kind: 'info', audience: 'patient', active: true, until: '' }],
      flags: { onlineBooking: true, teleconsult: true, onlinePayments: true, familyMembers: true, sos: true, medicineReminders: true, selfRegistration: true },
      maintenance: { on: false, message: 'Scheduled maintenance in progress. Please try again shortly.', allowRoles: ['platform-admin'] },
      content: { faqs: [{ q: 'How do I check in?', a: 'On the day of your visit, open the appointment and tap “Check in now”, or show your Health ID at reception.' }, { q: 'How do I get my reports?', a: 'Reports appear under Health records as soon as the lab verifies them. You also get a notification.' }, { q: 'Can I cancel an appointment?', a: 'Yes, up to the cut-off time set by the hospital before your slot.' }, { q: 'Is my payment real?', a: 'No. This is a demo application; payments are simulated.' }], consents: [{ id: 'CF-1', title: 'General admission consent', body: 'I consent to admission, examination and treatment as advised by the treating team.', required: true }, { id: 'CF-2', title: 'Surgical / anaesthesia consent', body: 'I consent to the proposed procedure and anaesthesia after the risks were explained to me.', required: true }, { id: 'CF-3', title: 'High-risk / blood transfusion consent', body: 'I consent to transfusion of blood products if required.', required: false }] },
      rbac: rbac
    };
  }
  function ensureConfig(db) {
    var changed = false;
    if (!db.config) { db.config = defaultConfig(db); changed = true; }
    var c = db.config, d = defaultConfig(db);
    Object.keys(d).forEach(function (k) { if (c[k] == null) { c[k] = d[k]; changed = true; } });
    (db.doctors || []).forEach(function (x) { if (x.active == null) { x.active = true; x.consultTypes = x.tele ? ['In-clinic', 'Video'] : ['In-clinic']; x.teleFee = x.fee; x.schedule = { days: [1, 2, 3, 4, 5, 6], start: x.start || '09:00', end: x.end || '17:00', slotMin: 0 }; x.leaves = []; x.bio = x.bio || ''; changed = true; } });
    (db.items || []).forEach(function (i) { if (i.active == null) { i.active = true; changed = true; } });
    (db.theatres || []).forEach(function (t) { if (t.active == null) { t.active = true; changed = true; } });
    (db.wards || []).forEach(function (w) { if (!w.type) { w.type = /ICU/.test(w.name) ? 'ICU' : /Semi/.test(w.name) ? 'Semi-private' : /Private/.test(w.name) ? 'Private' : 'General'; changed = true; } if (w.active == null) { w.active = true; changed = true; } });
    syncMasters(db); return changed;
  }
  function syncMasters(db) { var c = db.config; LABTESTS = c.labTests; RADTESTS = c.radTests; }
  function cfg() { return load().config; }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function setPath(obj, path, v) { var ks = path.split('.'), o = obj; for (var i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = v; }
  function resolveTarget(path) { var db = load(); return path.indexOf('config.') === 0 ? getPath(db, path) : db[path]; }
  function setCfg(path, value, note) { var db = load(); setPath(db.config, path, value); syncMasters(db); log('Config: ' + path, note || (typeof value === 'object' ? JSON.stringify(value).slice(0, 80) : String(value))); save(); return value; }
  function upsert(path, obj, key) { key = key || 'id'; var arr = resolveTarget(path); if (!Array.isArray(arr)) throw new Error('Unknown master ' + path); var i = -1; arr.forEach(function (x, k) { if (x[key] === obj[key]) i = k; }); if (i > -1) { for (var p in obj) arr[i][p] = obj[p]; } else arr.push(obj); syncMasters(load()); log('Config: ' + (i > -1 ? 'updated ' : 'added ') + path.replace('config.', ''), obj[key] + (obj.name ? ' ' + obj.name : '')); save(); return i > -1 ? arr[i] : obj; }
  function removeFrom(path, id, key) { key = key || 'id'; var arr = resolveTarget(path); var i = arr.map(function (x) { return x[key]; }).indexOf(id); if (i > -1) { arr.splice(i, 1); log('Config: removed from ' + path.replace('config.', ''), id); save(); } }
  function flag(n) { var f = cfg().flags; return f[n] !== false; }
  function broadcastsFor(aud) { var now = dateOnly(Date.now()); return cfg().broadcasts.filter(function (b) { return b.active && (!b.until || b.until >= now) && (b.audience === 'all' || b.audience === aud); }); }
  function tpl(key, vars, title, body) { var t = cfg().templates.filter(function (x) { return x.key === key; })[0]; if (t && t.active === false) return null; var f = function (s) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? m : vars[k]; }); }; return { title: f(t ? t.title : title), body: f(t ? t.body : body) }; }
  function tnotify(db, role, target, key, vars, title, body, kind) { var t = tpl(key, vars, title, body); if (t) notify(db, role, target, t.title, t.body, kind); }
  function onLeave(d, date) { return (d.leaves || []).some(function (l) { return date >= l.from && date <= (l.to || l.from); }); }
  function doctorBookable(id, date) { var d = doctor(id); if (!d) return 'Doctor not found'; if (d.active === false) return d.name + ' is not available for booking'; if (date) { if (onLeave(d, date)) return d.name + ' is on leave on ' + fmtDate(date); var dow = new Date(date + 'T00:00:00').getDay(); if (d.schedule && d.schedule.days.indexOf(dow) < 0) return d.name + ' has no OPD on this day'; var lim = dateOnly(Date.now() + cfg().appt.windowDays * DAY); if (date > lim) return 'Bookings open only ' + cfg().appt.windowDays + ' days ahead'; if (date < dateOnly(Date.now())) return 'Date is in the past'; } return ''; }
  function triageLevels() { return cfg().triage; }
  function applyDiscount(invId, amount, reason) { var db = load(), inv = byId('invoices', invId), s = session() || {}; if (!inv) throw new Error('Invoice not found'); amount = +amount; if (!(amount > 0)) throw new Error('Enter a discount amount'); if (!reason) throw new Error('Reason / approver is required'); var gross = (inv.lines || []).reduce(function (t, l) { return t + (+l.qty || 1) * (+l.rate || 0); }, 0); var lim = (cfg().billing.discountLimits || {})[s.role]; if (lim == null) lim = 0; var pct = Math.round(((+inv.discount || 0) + amount) * 1000 / Math.max(1, gross)) / 10; if (pct > lim) throw new Error('Discount ' + pct + '% exceeds your approval limit of ' + lim + '%. Needs higher approval.'); inv.discount = (+inv.discount || 0) + amount; if (invPaid(db, inv) >= invTotal(inv)) inv.status = 'Paid'; log('Discount applied', inv.id + ' ₹' + amount + ' (' + pct + '%) · ' + reason); save(); return inv; }
  var CFG_COLLECTIONS = ['doctors', 'wards', 'beds', 'tariffs', 'items', 'theatres', 'users', 'suppliers'];
  function exportConfig() { var db = load(), out = { kind: 'careaxis-config', exportedAt: iso(Date.now()), config: db.config }; CFG_COLLECTIONS.forEach(function (k) { out[k] = db[k]; }); return JSON.stringify(out, null, 1); }
  function importConfig(json) { var o = typeof json === 'string' ? JSON.parse(json) : json; if (!o || o.kind !== 'careaxis-config' || !o.config || !o.config.flags || !Array.isArray(o.config.labTests)) throw new Error('Not a valid CareAxis config file'); var db = load(); db.config = o.config; CFG_COLLECTIONS.forEach(function (k) { if (Array.isArray(o[k])) db[k] = o[k]; }); ensureConfig(db); log('Config: imported', 'exported ' + (o.exportedAt || '?')); save(); return true; }
  var extListeners = []; function onExternal(fn) { extListeners.push(fn); }

  // ---------- persistence ----------
  var cache = null;
  function load() {
    if (cache) return cache;
    var raw = lsGet(KEY);
    if (raw) { try { cache = JSON.parse(raw); if (!cache || cache.version !== 2) cache = null; } catch (e) { cache = null; } }
    if (!cache) { cache = buildSeed(); ensureConfig(cache); save(); } else if (ensureConfig(cache)) save();
    return cache;
  }
  function save() { try { lsSet(KEY, JSON.stringify(cache)); } catch (e) { /* quota */ } emit(); }
  function reset() { lsDel(KEY); cache = null; load(); }
  var listeners = [];
  function on(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (f) { try { f(); } catch (e) { console.warn(e); } }); }
  if (root.addEventListener) root.addEventListener('storage', function (e) { if (e.key === KEY) { cache = null; emit(); extListeners.forEach(function (f) { try { f(e); } catch (x) { console.warn(x); } }); } });

  // ---------- session / auth ----------
  var ROLES = {
    'platform-admin': 'System Administrator', 'hospital-management': 'Hospital Management', 'front-desk': 'Front Desk & Registration', 'doctor': 'Doctor', 'nurse': 'Nurse', 'emergency': 'Emergency Team', 'laboratory': 'Laboratory', 'radiology': 'Radiology', 'pharmacy': 'Pharmacy', 'billing-insurance': 'Billing & Insurance', 'ipd-ward': 'IPD & Ward', 'operation-theatre': 'Operation Theatre', 'inventory-purchase': 'Inventory & Purchase', 'hr-payroll': 'HR & Payroll', 'medical-records': 'Medical Records', 'patient-portal': 'Patient & Family'
  };
  function session() { try { return JSON.parse(lsGet(SKEY) || 'null'); } catch (e) { return null; } }
  function login(email, password, role) {
    var db = load();
    if (!email || !password) return { ok: false, error: 'Enter email and password' };
    if (password !== 'demo123' && password !== 'careaxis-demo') return { ok: false, error: 'Incorrect password. Demo password is demo123' };
    var u = db.users.filter(function (x) { return x.email.toLowerCase() === String(email).toLowerCase(); })[0];
    if (!u) return { ok: false, error: 'No account found for ' + email };
    if (u.status !== 'Active') return { ok: false, error: 'This account is ' + u.status.toLowerCase() };
    var r = role || u.role;
    var mt = (db.config || {}).maintenance; if (mt && mt.on && (mt.allowRoles || []).indexOf(r) < 0) return { ok: false, error: 'Under maintenance: ' + mt.message };
    if (r !== u.role && u.role !== 'platform-admin' && u.role !== 'hospital-management') return { ok: false, error: u.name + ' is not authorised for ' + (ROLES[r] || r) };
    var s = { userId: u.id, name: u.name, email: u.email, role: r, homeRole: u.role, doctorId: u.doctorId || (r === 'doctor' ? 'DOC-102' : ''), at: iso(Date.now()) };
    lsSet(SKEY, JSON.stringify(s)); u.last = s.at; log('Signed in', u.name + ' as ' + (ROLES[r] || r)); save();
    return { ok: true, session: s };
  }
  function patientLogin(mobile) {
    var db = load(); var p = db.patients.filter(function (x) { return x.mobile === mobile; })[0];
    var s = { userId: p ? p.id : '', name: p ? p.name : 'New user', role: 'patient-portal', patientId: p ? p.id : '', mobile: mobile, at: iso(Date.now()) };
    lsSet(SKEY, JSON.stringify(s)); return s;
  }
  function setSession(s) { lsSet(SKEY, JSON.stringify(s)); }
  function logout() { var s = session(); if (s) log('Signed out', s.name); lsDel(SKEY); }
  function inMaintenance(s) { var m = cfg().maintenance; return !!(m && m.on && (!s || (m.allowRoles || []).indexOf(s.role) < 0)); }
  function canAccess(s, module) { if (!s) return false; if (inMaintenance(s)) return false; if (s.role === 'platform-admin') return true; var r = cfg().rbac[s.role]; if (!r) return s.role === module; return r.indexOf(module) > -1; }

  function log(action, detail) { var db = load(); var s = session(); db.audit.unshift({ id: uid('AUD'), at: iso(Date.now()), user: s ? s.name : 'anonymous', role: s ? s.role : '', action: action, detail: detail || '' }); if (db.audit.length > 400) db.audit.length = 400; }

  // ---------- lookups ----------
  function byId(col, id) { var a = load()[col] || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function patient(id) { return byId('patients', id); }
  function doctor(id) { return byId('doctors', id); }
  function pname(id) { var p = patient(id); return p ? p.name : (id || '-'); }
  function dname(id) { var d = doctor(id); return d ? d.name : (id || '-'); }
  function age(dob) { if (!dob) return ''; var a = (Date.now() - new Date(dob)) / (365.25 * DAY); return a < 1 ? Math.round(a * 12) + 'm' : Math.floor(a) + 'y'; }
  function searchPatients(q) { q = String(q || '').toLowerCase().trim(); if (!q) return []; return load().patients.filter(function (p) { return (p.name + ' ' + p.id + ' ' + p.mobile).toLowerCase().indexOf(q) >= 0; }).slice(0, 8); }
  function isToday(d) { return d && dateOnly(d) === today(); }

  // ---------- workflow actions ----------
  function registerPatient(data) {
    var db = load();
    if (!data.name || String(data.name).trim().length < 2) throw new Error('Patient name is required');
    if (!/^[6-9]\d{9}$/.test(data.mobile || '')) throw new Error('Enter a valid 10-digit mobile number');
    var dup = db.patients.filter(function (p) { return p.mobile === data.mobile && p.name.toLowerCase() === String(data.name).toLowerCase(); })[0];
    if (dup) return dup;
    var p = { id: 'UHID-' + (db.counters.uhid++), name: String(data.name).trim(), gender: data.gender || 'Other', dob: data.dob || '', mobile: data.mobile, email: data.email || '', city: data.city || data.address || '', address: data.address || '', blood: data.blood || '', payer: data.payer || 'Self-pay', insurer: data.insurer || '', policy: data.policy || '', allergies: data.allergies || 'None known', emergencyContact: data.emergencyContact || '', registered: iso(Date.now()), photo: data.photo || '', verified: !!data.verified, family: [] };
    db.patients.unshift(p);
    var inv = { id: 'INV-' + (db.counters.inv++), patientId: p.id, type: 'OPD', at: iso(Date.now()), lines: [{ desc: 'Registration fee', qty: 1, rate: 100 }], discount: 0, status: 'Unpaid', ref: 'REG' };
    if (data.waiveFee) inv.discount = 100;
    db.invoices.unshift(inv); if (data.waiveFee) inv.status = 'Paid';
    log('Patient registered', p.id + ' ' + p.name); notify(db, 'patient', p.id, 'Welcome to CareAxis', 'Your UHID is ' + p.id + '. Download the app to book visits and view reports.', 'info');
    save(); return p;
  }
  function slotsFor(doctorId, date) {
    var db = load(), d = doctor(doctorId); if (!d) return [];
    var taken = {}; db.appointments.forEach(function (a) { if (a.doctorId === doctorId && dateOnly(a.when) === date && a.status !== 'Cancelled') { var t = new Date(a.when); taken[String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0')] = 1; } });
    var out = [], now = new Date();
    if (doctorBookable(doctorId, date)) return out;
    var A = cfg().appt, sc = d.schedule || {}, step = +sc.slotMin || +A.slotMinutes || 15, toM = function (x) { var p = String(x || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }, ls = toM(A.lunchStart), le = toM(A.lunchEnd);
    for (var mm = toM(sc.start || '09:00'); mm + step <= toM(sc.end || '17:00'); mm += step) { if (A.lunchStart && mm >= ls && mm < le) continue; var h = Math.floor(mm / 60), m = mm % 60; var t = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); var dt = new Date(date + 'T' + t + ':00'); out.push({ time: t, available: !taken[t] && dt > now, label: (h > 12 ? h - 12 : h) + ':' + String(m).padStart(2, '0') + (h >= 12 ? ' PM' : ' AM') }); }
    return out;
  }
  function bookAppointment(o) {
    var db = load();
    if (!patient(o.patientId)) throw new Error('Select a registered patient');
    var d = doctor(o.doctorId); if (!d) throw new Error('Select a doctor');
    if (!o.date || !o.time) throw new Error('Select a date and time slot');
    var why = doctorBookable(d.id, o.date); if (why) throw new Error(why);
    var fromApp = /Patient app/.test(o.source || ''); if (fromApp && !flag('onlineBooking')) throw new Error('Online booking is currently disabled by the hospital');
    if (o.type === 'Teleconsult') { if (!flag('teleconsult')) throw new Error('Video consultation is currently disabled'); if ((d.consultTypes || []).indexOf('Video') < 0) throw new Error(d.name + ' does not offer video consultation'); }
    var sameDay = db.appointments.filter(function (a) { return a.patientId === o.patientId && a.status !== 'Cancelled' && dateOnly(a.when) === o.date; }).length; if (sameDay >= (cfg().appt.maxPerPatientPerDay || 99)) throw new Error('Maximum ' + cfg().appt.maxPerPatientPerDay + ' appointments per patient per day');
    var when = new Date(o.date + 'T' + o.time + ':00');
    var clash = db.appointments.filter(function (a) { return a.doctorId === d.id && a.status !== 'Cancelled' && Math.abs(new Date(a.when) - when) < 6e4; })[0];
    if (clash) throw new Error('That slot was just taken. Please choose another.');
    var a = { id: 'APT-' + (5000 + db.appointments.length + Math.floor(Math.random() * 900)), patientId: o.patientId, doctorId: d.id, dept: d.dept, when: iso(when), type: o.type || 'New', status: 'Booked', token: '', source: o.source || 'Front desk', fee: o.type === 'Teleconsult' ? (+d.teleFee || d.fee) : d.fee, complaint: o.complaint || 'Consultation', createdAt: iso(Date.now()) };
    db.appointments.push(a);
    log('Appointment booked', a.id + ' ' + pname(a.patientId) + ' with ' + d.name);
    tnotify(db, 'patient', a.patientId, 'appt_confirmed', { doctor: d.name, when: fmtDateTime(a.when), patient: pname(a.patientId) }, 'Appointment confirmed', '{doctor} · {when}', 'appointment');
    notify(db, 'doctor', d.id, 'New appointment', pname(a.patientId) + ' at ' + fmtTime(a.when), 'appointment');
    save(); return a;
  }
  function cancelAppointment(id, reason, byPatient) { var a = byId('appointments', id); if (!a) return; var ch = cfg().appt.cancelHoursBefore; if (byPatient && ch && new Date(a.when) - Date.now() < ch * 36e5) throw new Error('Cancellation closes ' + ch + ' h before the slot. Please call the hospital.'); a.status = 'Cancelled'; a.cancelReason = reason || ''; log('Appointment cancelled', id); notify(load(), 'patient', a.patientId, 'Appointment cancelled', dname(a.doctorId) + ' · ' + fmtDateTime(a.when), 'appointment'); save(); }
  function reschedule(id, date, time) { var a = byId('appointments', id); if (!a) return; a.when = iso(new Date(date + 'T' + time + ':00')); a.status = 'Booked'; log('Appointment rescheduled', id); save(); return a; }
  function checkIn(apptId) {
    var db = load(), a = byId('appointments', apptId); if (!a) throw new Error('Appointment not found');
    if (a.token) return a;
    var dept = a.dept; db.counters.token[dept] = (db.counters.token[dept] || 0) + 1;
    var Q = cfg().queue; var cnt = queue(a.doctorId).length; if (Q.maxTokensPerDoctor && cnt >= Q.maxTokensPerDoctor) throw new Error('Token limit (' + Q.maxTokensPerDoctor + ') reached for ' + dname(a.doctorId) + ' today');
    a.token = ((Q.prefix || {})[dept] || (dept === 'Emergency' ? 'E' : dept.charAt(0))) + '-' + String(db.counters.token[dept]).padStart(3, '0');
    a.status = 'Waiting'; a.checkedInAt = iso(Date.now());
    if (!isToday(a.when)) a.when = iso(Date.now());
    var has = db.invoices.filter(function (i) { return i.ref === a.id; })[0];
    if (!has) db.invoices.unshift({ id: 'INV-' + (db.counters.inv++), patientId: a.patientId, type: 'OPD', at: iso(Date.now()), lines: [{ desc: 'Consultation - ' + dname(a.doctorId), qty: 1, rate: a.fee || 500 }], discount: 0, status: 'Unpaid', ref: a.id });
    log('Checked in', a.id + ' token ' + a.token); tnotify(db, 'patient', a.patientId, 'checked_in', { token: a.token, doctor: dname(a.doctorId), room: (doctor(a.doctorId) || {}).room }, 'You are checked in', 'Token {token} · {doctor} · Room {room}', 'queue');
    save(); return a;
  }
  function walkIn(patientId, doctorId, complaint) { var d = new Date(); var a = { id: 'APT-' + (7000 + Math.floor(Math.random() * 2900)), patientId: patientId, doctorId: doctorId, dept: doctor(doctorId).dept, when: iso(d), type: 'New', status: 'Booked', token: '', source: 'Walk-in', fee: doctor(doctorId).fee, complaint: complaint || 'Walk-in consultation', createdAt: iso(d) }; load().appointments.push(a); return checkIn(a.id); }
  function queue(doctorId) { var db = load(); return db.appointments.filter(function (a) { return isToday(a.when) && a.token && (!doctorId || a.doctorId === doctorId) && a.status !== 'Cancelled'; }).sort(function (x, y) { return (x.checkedInAt || x.when) < (y.checkedInAt || y.when) ? -1 : 1; }); }
  function callNext(doctorId) { var q = queue(doctorId).filter(function (a) { return a.status === 'Waiting' || a.status === 'Checked-in'; }); if (!q.length) return null; var a = q[0]; a.status = 'In consultation'; a.calledAt = iso(Date.now()); log('Patient called', a.token + ' ' + pname(a.patientId)); notify(load(), 'patient', a.patientId, 'It is your turn', 'Please proceed to ' + (doctor(a.doctorId) || {}).room, 'queue'); save(); return a; }
  function setStatus(col, id, status, extra) { var r = byId(col, id); if (!r) return null; r.status = status; if (extra) for (var k in extra) r[k] = extra[k]; log(col + ' status', id + ' → ' + status); save(); return r; }

  function completeConsultation(o) {
    var db = load(), a = byId('appointments', o.apptId); if (!a) throw new Error('Appointment not found');
    if (!o.diagnosis) throw new Error('Diagnosis is required');
    var enc = { id: 'ENC-' + a.id.slice(4) + '-' + Math.floor(Math.random() * 99), apptId: a.id, patientId: a.patientId, doctorId: a.doctorId, at: iso(Date.now()), complaint: o.complaint || a.complaint, vitals: o.vitals || '', diagnosis: o.diagnosis, notes: o.notes || '', followUp: o.followUp || '', status: 'Signed' };
    db.encounters.push(enc);
    var inv = db.invoices.filter(function (i) { return i.ref === a.id; })[0];
    if (!inv) { inv = { id: 'INV-' + (db.counters.inv++), patientId: a.patientId, type: 'OPD', at: iso(Date.now()), lines: [{ desc: 'Consultation - ' + dname(a.doctorId), qty: 1, rate: a.fee || 500 }], discount: 0, status: 'Unpaid', ref: a.id }; db.invoices.unshift(inv); }
    if (o.rx && o.rx.length) { var rx = { id: 'RX-' + (db.counters.rx++), encounterId: enc.id, patientId: a.patientId, doctorId: a.doctorId, at: enc.at, items: o.rx, status: 'Pending' }; db.prescriptions.unshift(rx); notify(db, 'pharmacy', '', 'New e-prescription', rx.id + ' · ' + pname(a.patientId), 'rx'); notify(db, 'patient', a.patientId, 'Prescription ready', o.rx.length + ' medicines prescribed by ' + dname(a.doctorId), 'rx'); }
    (o.labs || []).forEach(function (code) { var t = LABTESTS.filter(function (x) { return x.code === code; })[0]; if (!t) return; db.labOrders.unshift({ id: 'LAB-' + (db.counters.lab++), patientId: a.patientId, encounterId: enc.id, doctorId: a.doctorId, test: t.code, name: t.name, at: enc.at, priority: o.priority || 'Routine', status: 'Ordered', results: [], sampleId: '' }); inv.lines.push({ desc: t.name, qty: 1, rate: t.price }); });
    (o.rads || []).forEach(function (code) { var t = RADTESTS.filter(function (x) { return x.code === code; })[0]; if (!t) return; db.radOrders.unshift({ id: 'RAD-' + (db.counters.rad++), patientId: a.patientId, encounterId: enc.id, doctorId: a.doctorId, test: t.code, name: t.name, modality: t.modality, at: enc.at, priority: o.priority || 'Routine', status: 'Ordered', slot: '', report: '', impression: '' }); inv.lines.push({ desc: t.name, qty: 1, rate: t.price }); });
    if ((o.labs || []).length) notify(db, 'laboratory', '', 'New lab orders', o.labs.join(', ') + ' · ' + pname(a.patientId), 'lab');
    if ((o.rads || []).length) notify(db, 'radiology', '', 'New imaging orders', o.rads.join(', ') + ' · ' + pname(a.patientId), 'rad');
    a.status = o.admit ? 'Admission advised' : 'Completed'; a.completedAt = iso(Date.now());
    if (o.admit) { notify(db, 'ipd-ward', '', 'Admission request', pname(a.patientId) + ' advised admission by ' + dname(a.doctorId), 'ipd'); db.admissionRequests = db.admissionRequests || []; db.admissionRequests.unshift({ id: uid('ARQ'), patientId: a.patientId, doctorId: a.doctorId, reason: o.diagnosis, wardType: o.wardType || 'General', at: iso(Date.now()), status: 'Pending' }); }
    log('Consultation signed', enc.id + ' ' + pname(a.patientId)); save(); return enc;
  }
  function collectSample(labId) { var l = byId('labOrders', labId); if (!l) return; l.status = 'Sample collected'; l.sampleId = 'S' + Math.floor(10000 + Math.random() * 89999); l.collectedAt = iso(Date.now()); log('Sample collected', l.id + ' ' + l.sampleId); save(); return l; }
  function enterResults(labId, values) {
    var l = byId('labOrders', labId); if (!l) return; var t = LABTESTS.filter(function (x) { return x.code === l.test; })[0];
    l.results = (t ? t.params : []).map(function (pp, i) { var v = parseFloat(values[i]); return { param: pp[0], value: isNaN(v) ? '' : v, unit: pp[1], range: pp[2] + ' - ' + pp[3], flag: isNaN(v) ? '' : (v > pp[3] ? 'H' : (v < pp[2] ? 'L' : '')) }; });
    l.status = 'Resulted'; l.resultedAt = iso(Date.now()); log('Results entered', l.id); save(); return l;
  }
  function verifyResult(labId) { var db = load(), l = byId('labOrders', labId); if (!l) return; l.status = 'Verified'; l.verifiedAt = iso(Date.now()); var crit = l.results.some(function (r) { return r.flag; }); notify(db, 'doctor', l.doctorId, (crit ? 'Abnormal result: ' : 'Result ready: ') + l.name, pname(l.patientId), 'lab'); tnotify(db, 'patient', l.patientId, 'report_ready', { test: l.name }, 'Report ready', 'Your {test} report is ready to view', 'report'); log('Result verified', l.id); save(); return l; }
  function radSchedule(id, slot) { var r = byId('radOrders', id); if (!r) return; r.status = 'Scheduled'; r.slot = slot; log('Imaging scheduled', id); save(); return r; }
  function radReport(id, findings, impression) { var db = load(), r = byId('radOrders', id); if (!r) return; r.report = findings; r.impression = impression; r.status = 'Reported'; r.reportedAt = iso(Date.now()); notify(db, 'doctor', r.doctorId, 'Imaging reported: ' + r.name, pname(r.patientId), 'rad'); notify(db, 'patient', r.patientId, 'Imaging report ready', r.name, 'report'); log('Imaging reported', id); save(); return r; }
  function dispense(rxId, qtyMap) {
    var db = load(), rx = byId('prescriptions', rxId); if (!rx) throw new Error('Prescription not found');
    if (rx.status === 'Dispensed') throw new Error('Already dispensed');
    var inv = { id: 'INV-' + (db.counters.inv++), patientId: rx.patientId, type: 'Pharmacy', at: iso(Date.now()), lines: [], discount: 0, taxPct: +cfg().billing.gstPharmacy || 0, status: 'Unpaid', ref: rx.id };
    rx.items.forEach(function (it, i) { var item = db.items.filter(function (x) { return x.name === it.drug; })[0]; var perDay = String(it.dose).split('-').reduce(function (s, x) { return s + (parseFloat(x) || 0); }, 0) || 1; var q = qtyMap && qtyMap[i] != null ? +qtyMap[i] : Math.ceil(perDay * (+it.days || 1)); if (item) { if (item.stock < q) throw new Error('Insufficient stock for ' + item.name + ' (' + item.stock + ' left)'); } it.qty = q; });
    rx.items.forEach(function (it) { var item = db.items.filter(function (x) { return x.name === it.drug; })[0]; if (item) { item.stock -= it.qty; if (item.stock < item.reorder) notify(db, 'inventory-purchase', '', 'Low stock', item.name + ' · ' + item.stock + ' left', 'stock'); } inv.lines.push({ desc: it.drug + ' x' + it.qty, qty: it.qty, rate: item ? item.price : 5 }); });
    db.invoices.unshift(inv); rx.status = 'Dispensed'; rx.dispensedAt = iso(Date.now()); rx.invoiceId = inv.id;
    notify(db, 'patient', rx.patientId, 'Medicines dispensed', rx.items.length + ' items · bill ' + inv.id, 'rx'); log('Dispensed', rx.id); save(); return inv;
  }
  function pay(invoiceId, amount, mode, ref) {
    var db = load(), inv = byId('invoices', invoiceId); if (!inv) throw new Error('Invoice not found');
    var due = invTotal(inv) - invPaid(db, inv); amount = Math.round(+amount || due);
    if (amount <= 0) throw new Error('Nothing due on this invoice'); if (amount > due) throw new Error('Amount exceeds balance due (₹' + due + ')');
    var p = { id: 'RCPT-' + Date.now().toString().slice(-7), invoiceId: inv.id, patientId: inv.patientId, amount: amount, mode: mode || 'Cash', txn: ref || ('TXN' + Date.now().toString().slice(-9)), at: iso(Date.now()), by: (session() || {}).name || 'Patient app' };
    db.payments.unshift(p); inv.status = invPaid(db, inv) >= invTotal(inv) ? 'Paid' : 'Part paid';
    tnotify(db, 'patient', inv.patientId, 'payment_success', { amount: amount, invoice: inv.id, mode: p.mode }, 'Payment successful', '₹{amount} paid for {invoice} via {mode}', 'payment'); log('Payment received', p.id + ' ₹' + amount); save(); return p;
  }
  function admit(o) {
    var db = load(); if (!patient(o.patientId)) throw new Error('Select patient'); var bed = byId('beds', o.bedId); if (!bed || bed.status !== 'Available') throw new Error('Select an available bed'); var wd = byId('wards', bed.ward) || {}; if (wd.active === false) throw new Error(wd.name + ' is closed for admissions'); var B = cfg().billing, minDep = (B.ipdDeposit || {})[wd.type] || 0, pt = patient(o.patientId); if (B.requireDeposit && pt.payer === 'Self-pay' && (+o.deposit || 0) < minDep) throw new Error('Minimum deposit for ' + (wd.type || 'this ward') + ' is ₹' + minDep);
    var open = db.admissions.filter(function (a) { return a.patientId === o.patientId && a.status !== 'Discharged'; })[0]; if (open) throw new Error('Patient already admitted in ' + open.bedId);
    var a = { id: 'ADM-' + (db.counters.adm++), patientId: o.patientId, doctorId: o.doctorId || 'DOC-102', dept: (doctor(o.doctorId) || {}).dept || 'General Medicine', bedId: bed.id, ward: bed.ward, admittedAt: iso(Date.now()), reason: o.reason || 'Observation', status: 'Admitted', deposit: +o.deposit || 0, payer: (patient(o.patientId) || {}).payer, diet: o.diet || 'Normal', consent: o.consent ? 'Signed' : 'Pending', expectedDischarge: o.expectedDischarge || '' };
    db.admissions.unshift(a); bed.status = 'Occupied'; bed.patientId = a.patientId; bed.admissionId = a.id;
    (db.admissionRequests || []).forEach(function (r) { if (r.patientId === a.patientId && r.status === 'Pending') r.status = 'Admitted'; });
    db.consents.unshift({ id: 'CON-' + Math.floor(Math.random() * 9000 + 1000), patientId: a.patientId, admissionId: a.id, type: 'General admission', status: a.consent, witness: (session() || {}).name || '', at: a.admittedAt });
    if (a.deposit) { var inv = { id: 'INV-' + (db.counters.inv++), patientId: a.patientId, type: 'IPD', at: a.admittedAt, lines: [{ desc: 'Admission deposit', qty: 1, rate: a.deposit }], discount: 0, status: 'Unpaid', ref: a.id }; db.invoices.unshift(inv); }
    notify(db, 'nurse', '', 'New admission', pname(a.patientId) + ' → bed ' + bed.id, 'ipd'); notify(db, 'patient', a.patientId, 'Admission confirmed', 'Bed ' + bed.id + ' · ' + wardName(bed.ward), 'ipd'); log('Admitted', a.id + ' bed ' + bed.id); save(); return a;
  }
  function wardName(id) { var w = byId('wards', id); return w ? w.name : id; }
  function transfer(admId, bedId, reason) { var db = load(), a = byId('admissions', admId), nb = byId('beds', bedId); if (!a || !nb || nb.status !== 'Available') throw new Error('Choose an available bed'); var ob = byId('beds', a.bedId); if (ob) { ob.status = 'Cleaning'; ob.patientId = ''; ob.admissionId = ''; } db.transfers.unshift({ id: uid('TRF'), admissionId: a.id, patientId: a.patientId, from: a.bedId, to: nb.id, reason: reason || '', at: iso(Date.now()) }); a.bedId = nb.id; a.ward = nb.ward; nb.status = 'Occupied'; nb.patientId = a.patientId; nb.admissionId = a.id; log('Bed transfer', a.id + ' → ' + nb.id); save(); return a; }
  function ipdBill(admId) {
    var db = load(), a = byId('admissions', admId); if (!a) return null; var w = byId('wards', a.ward) || { rate: 1500 };
    var days = Math.max(1, Math.ceil((Date.now() - new Date(a.admittedAt)) / DAY));
    var lines = [{ desc: 'Bed charges - ' + w.name, qty: days, rate: w.rate }, { desc: 'Nursing charges', qty: days, rate: 600 }, { desc: 'Consultant visits', qty: days, rate: 800 }];
    db.labOrders.forEach(function (l) { if (l.patientId === a.patientId && new Date(l.at) >= new Date(a.admittedAt)) lines.push({ desc: 'Lab: ' + l.name, qty: 1, rate: (LABTESTS.filter(function (t) { return t.code === l.test; })[0] || { price: 300 }).price }); });
    db.otCases.forEach(function (o) { if (o.admissionId === a.id && o.status === 'Completed') lines.push({ desc: 'Procedure: ' + o.procedure, qty: 1, rate: 45000 }); });
    return { days: days, lines: lines, total: lines.reduce(function (s, l) { return s + l.qty * l.rate; }, 0), deposit: a.deposit };
  }
  function discharge(admId, summary) {
    var db = load(), a = byId('admissions', admId); if (!a) throw new Error('Admission not found'); var b = ipdBill(admId);
    var inv = { id: 'INV-' + (db.counters.inv++), patientId: a.patientId, type: 'IPD', at: iso(Date.now()), lines: b.lines, discount: 0, status: 'Unpaid', ref: a.id + '-FINAL' };
    db.invoices.unshift(inv);
    var dep = db.invoices.filter(function (i) { return i.ref === a.id && i.status === 'Paid'; })[0]; if (dep) inv.lines.push({ desc: 'Less: deposit paid', qty: 1, rate: -invTotal(dep) });
    a.status = 'Discharged'; a.dischargedAt = iso(Date.now()); a.summary = summary || {}; a.finalInvoiceId = inv.id;
    var bed = byId('beds', a.bedId); if (bed) { bed.status = 'Cleaning'; bed.patientId = ''; bed.admissionId = ''; }
    var p = patient(a.patientId); if (p && p.payer !== 'Self-pay') { db.claims.unshift({ id: 'CLM-' + (db.counters.claim++), patientId: p.id, invoiceId: inv.id, insurer: p.insurer || 'TPA', policy: p.policy, amount: invTotal(inv), approved: 0, status: 'Draft', at: iso(Date.now()), type: 'Final claim' }); }
    notify(db, 'patient', a.patientId, 'Discharge summary ready', 'Final bill ' + inv.id + ' · ₹' + invTotal(inv), 'ipd'); notify(db, 'billing-insurance', '', 'Final bill raised', inv.id + ' · ' + pname(a.patientId), 'billing'); log('Discharged', a.id); save(); return inv;
  }
  function recordVitals(o) { var db = load(); var v = { id: uid('VIT'), patientId: o.patientId, admissionId: o.admissionId || '', at: iso(Date.now()), bp: o.bp, pulse: +o.pulse, temp: o.temp, spo2: +o.spo2, rr: +o.rr || 16, pain: +o.pain || 0, by: (session() || {}).name || 'Nurse' }; var news = 0; if (v.spo2 < 92) news += 3; else if (v.spo2 < 94) news += 2; if (v.pulse > 110 || v.pulse < 50) news += 2; if (parseFloat(v.temp) > 101) news += 1; if (v.rr > 24) news += 2; v.news = news; db.vitals.unshift(v); if (news >= 5) notify(db, 'doctor', '', 'Early warning score ' + news, pname(v.patientId) + ' needs review', 'alert'); log('Vitals recorded', pname(v.patientId) + ' NEWS ' + news); save(); return v; }
  function erRegister(o) { var db = load(); var p = o.patientId ? patient(o.patientId) : null; if (!p) { p = { id: 'UHID-' + (db.counters.uhid++), name: o.name || ('Unknown ' + (o.gender || 'patient') + ' ' + new Date().toLocaleTimeString().slice(0, 5)), gender: o.gender || 'Other', dob: o.age ? dateOnly(Date.now() - o.age * 365.25 * DAY) : '', mobile: o.mobile || '', city: '', payer: 'Self-pay', allergies: 'Unknown', registered: iso(Date.now()), verified: false, family: [], emergency: true }; db.patients.unshift(p); } var c = { id: 'ER-' + (db.counters.er++), patientId: p.id, arrival: iso(Date.now()), mode: o.mode || 'Walk-in', complaint: o.complaint || 'Not stated', triage: o.triage || 'Pending', status: 'Triage', mlc: !!o.mlc, mlcNo: o.mlc ? 'MLC/' + Math.floor(100 + Math.random() * 899) + '/26' : '', interventions: [], vitals: '', disposition: '' }; db.erCases.unshift(c); notify(db, 'emergency', '', 'New ER arrival', p.name + ' · ' + c.complaint, 'alert'); log('ER registration', c.id); save(); return c; }

  function poCreate(supplierId, lines) { var db = load(); var po = { id: 'PO-' + (db.counters.po++), supplierId: supplierId, lines: lines, status: 'Sent', at: iso(Date.now()), expected: dateOnly(Date.now() + 3 * DAY) }; db.pos.unshift(po); log('PO created', po.id); save(); return po; }
  function grn(poId) { var db = load(), po = byId('pos', poId); if (!po || po.status === 'Received') throw new Error('PO already received'); po.lines.forEach(function (l) { var it = byId('items', l.itemId); if (it) it.stock += +l.qty; }); po.status = 'Received'; db.grns.unshift({ id: 'GRN-' + Math.floor(Math.random() * 900 + 100), poId: po.id, at: iso(Date.now()), status: 'Accepted', note: 'Received against ' + po.id }); log('Goods received', po.id); save(); return po; }
  function runPayroll(month) { var db = load(); var run = { id: 'PAY-' + month.replace(/\s/g, '-'), month: month, status: 'Processed', at: iso(Date.now()), gross: 0, lines: [] }; db.staff.forEach(function (s) { var basic = Math.round(s.salary * 0.5), hra = Math.round(s.salary * 0.2), allow = s.salary - basic - hra, pf = Math.round(basic * 0.12), pt = 200, tds = s.salary > 100000 ? Math.round(s.salary * 0.1) : 0; run.lines.push({ staffId: s.id, gross: s.salary, basic: basic, hra: hra, allow: allow, pf: pf, pt: pt, tds: tds, net: s.salary - pf - pt - tds }); run.gross += s.salary; }); db.payrollRuns = db.payrollRuns.filter(function (r) { return r.id !== run.id; }); db.payrollRuns.unshift(run); log('Payroll processed', month); save(); return run; }

  // ---------- formatting ----------
  function fmtDate(d) { if (!d) return '-'; var x = new Date(d); if (isNaN(x)) return d; return x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  function fmtTime(d) { if (!d) return '-'; var x = new Date(d); return x.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
  function fmtDateTime(d) { if (!d) return '-'; return fmtDate(d) + ', ' + fmtTime(d); }
  function ago(d) { if (!d) return '-'; var s = (Date.now() - new Date(d)) / 1000; if (s < 0) { s = -s; if (s < 3600) return 'in ' + Math.round(s / 60) + ' min'; if (s < 86400) return 'in ' + Math.round(s / 3600) + ' h'; return 'in ' + Math.round(s / 86400) + ' d'; } if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; }
  function money(n) { return '₹' + Math.round(+n || 0).toLocaleString('en-IN'); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  root.HMS = {
    load: load, db: load, save: save, reset: reset, on: on, uid: uid, log: log, notify: function (role, target, t, b, k) { notify(load(), role, target, t, b, k); save(); },
    ROLES: ROLES, DX: DX,
    session: session, login: login, logout: logout, canAccess: canAccess, patientLogin: patientLogin, setSession: setSession,
    byId: byId, patient: patient, doctor: doctor, pname: pname, dname: dname, age: age, searchPatients: searchPatients, isToday: isToday, today: today, dateOnly: dateOnly, wardName: wardName,
    registerPatient: registerPatient, slotsFor: slotsFor, bookAppointment: bookAppointment, cancelAppointment: cancelAppointment, reschedule: reschedule, checkIn: checkIn, walkIn: walkIn, queue: queue, callNext: callNext, setStatus: setStatus,
    completeConsultation: completeConsultation, collectSample: collectSample, enterResults: enterResults, verifyResult: verifyResult, radSchedule: radSchedule, radReport: radReport, dispense: dispense, pay: pay, invTotal: invTotal, invPaid: function (inv) { return invPaid(load(), inv); },
    admit: admit, transfer: transfer, ipdBill: ipdBill, discharge: discharge, recordVitals: recordVitals, erRegister: erRegister, poCreate: poCreate, grn: grn, runPayroll: runPayroll,
    cfg: cfg, setCfg: setCfg, upsert: upsert, removeFrom: removeFrom, flag: flag, broadcastsFor: broadcastsFor, doctorBookable: doctorBookable, triageLevels: triageLevels, applyDiscount: applyDiscount, exportConfig: exportConfig, importConfig: importConfig, onExternal: onExternal, inMaintenance: function (s) { return inMaintenance(s === undefined ? session() : s); }, ALLROLES: ALLROLES,
    fmtDate: fmtDate, fmtTime: fmtTime, fmtDateTime: fmtDateTime, ago: ago, money: money, esc: esc
  };
  var Hx = root.HMS;
  Object.defineProperty(Hx, 'LABTESTS', { get: function () { return cfg().labTests.filter(function (t) { return t.active !== false; }); } });
  Object.defineProperty(Hx, 'RADTESTS', { get: function () { return cfg().radTests.filter(function (t) { return t.active !== false; }); } });
  Object.defineProperty(Hx, 'DEPTS', { get: function () { return cfg().departments.filter(function (d) { return d.active !== false; }).map(function (d) { return d.name; }); } });
  Object.defineProperty(Hx, 'INSURERS', { get: function () { return cfg().insurers.filter(function (d) { return d.active !== false; }).map(function (d) { return d.name; }); } });
  Object.defineProperty(Hx, 'LABMASTER', { get: function () { return cfg().labTests; } });
  Object.defineProperty(Hx, 'RADMASTER', { get: function () { return cfg().radTests; } });
})(typeof window !== 'undefined' ? window : this);
