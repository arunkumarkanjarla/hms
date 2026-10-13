/* CareAxis HMS - shared UI helpers for the web workspaces (vanilla JS). */
(function (W) {
  'use strict';
  var H = W.HMS, esc = H.esc;
  var UI = {};
  UI.$ = function (s, r) { return (r || document).querySelector(s); };
  UI.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  UI.toast = function (msg, kind) { var t = document.getElementById('cxToast'); if (!t) { t = document.createElement('div'); t.id = 'cxToast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); } t.className = 'cx-toast show ' + (kind || ''); t.textContent = msg; clearTimeout(UI._tt); UI._tt = setTimeout(function () { t.className = 'cx-toast'; }, 3200); };
  var BADGE = { green: /^(paid|completed|verified|reported|dispensed|signed|active|available|present|approved|received|released|settled|given|discharged|within|accepted|closed|issued|digitised|in archive|connected|done)/i, orange: /^(pending|booked|waiting|checked-in|scheduled|ordered|part|due|draft|requested|submitted|under|late|sample|resulted|reserved|cleaning|sandbox|onboarding|discharge planned|admission advised|query|processed|sent|in pacu|observation|yellow|orange|disposition)/i, red: /^(cancelled|rejected|unpaid|overdue|critical|red|out of|expired|denied|missed|maintenance|absent|urgent|stat|h$|l$)/i, blue: /^(in consultation|in progress|occupied|admitted|in use|under treatment|planned|leave|triage|issued to|green)/i };
  UI.badge = function (s) { s = String(s == null ? '' : s); var c = 'gray'; for (var k in BADGE) if (BADGE[k].test(s)) { c = k; break; } return '<span class="badge ' + c + '">' + esc(s || '-') + '</span>'; };
  UI.kpis = function (items) { return '<div class="stats">' + items.map(function (k) { return '<div class="stat"' + (k.href ? ' data-href="' + esc(k.href) + '" tabindex="0" role="link" style="cursor:pointer"' : '') + '><div class="stathead"><span>' + esc(k.label) + '</span><span class="staticon" aria-hidden="true">' + (k.icon || '•') + '</span></div><div class="statnum">' + esc(k.value) + '</div><div class="trend">' + esc(k.sub || '') + '</div></div>'; }).join('') + '</div>'; };
  UI.panel = function (title, body, extra) { return '<section class="panel"><div class="panelhead"><h2>' + esc(title) + '</h2>' + (extra || '') + '</div>' + body + '</section>'; };
  UI.empty = function (msg, cta) { return '<div class="empty cx-empty"><div class="cx-empty-ico" aria-hidden="true">🗂️</div><p>' + esc(msg) + '</p>' + (cta || '') + '</div>'; };

  /* Data table with search, filter chips, sort, paging, CSV export, row actions */
  UI.table = function (host, cfg) {
    var state = { q: '', filter: cfg.defaultFilter || 'All', sort: null, dir: 1, page: 0 }, per = cfg.perPage || 10;
    function rows() {
      var r = cfg.rows();
      if (cfg.filters && state.filter !== 'All') r = r.filter(function (x) { return cfg.filterFn ? cfg.filterFn(x, state.filter) : String(x.status) === state.filter; });
      if (state.q) { var q = state.q.toLowerCase(); r = r.filter(function (x) { return cfg.cols.map(function (c) { return strip(c.get(x)); }).join(' ').toLowerCase().indexOf(q) >= 0; }); }
      if (state.sort != null) { var c = cfg.cols[state.sort]; r = r.slice().sort(function (a, b) { var x = c.sortVal ? c.sortVal(a) : strip(c.get(a)), y = c.sortVal ? c.sortVal(b) : strip(c.get(b)); return (x > y ? 1 : x < y ? -1 : 0) * state.dir; }); }
      return r;
    }
    function strip(v) { return String(v == null ? '' : v).replace(/<[^>]+>/g, ''); }
    function draw() {
      var all = rows(), pages = Math.max(1, Math.ceil(all.length / per)); if (state.page >= pages) state.page = pages - 1;
      var view = all.slice(state.page * per, state.page * per + per);
      var html = '<div class="tabletoolbar cx-toolbar"><input class="searchbox cx-tsearch" type="search" aria-label="Search ' + esc(cfg.title || 'table') + '" placeholder="Search ' + esc((cfg.title || 'records').toLowerCase()) + '…" value="' + esc(state.q) + '">';
      if (cfg.filters) html += '<div class="cx-chips" role="tablist">' + ['All'].concat(cfg.filters).map(function (f) { return '<button type="button" role="tab" aria-selected="' + (f === state.filter) + '" class="cx-chip' + (f === state.filter ? ' on' : '') + '" data-f="' + esc(f) + '">' + esc(f) + '</button>'; }).join('') + '</div>';
      html += '<span class="muted cx-count">' + all.length + ' records</span><button type="button" class="secondary small cx-csv">Export CSV</button></div>';
      if (!all.length) html += UI.empty(cfg.emptyText || 'No records match. Try another filter or search.');
      else {
        html += '<div class="tablewrap"><table class="cx-table"><thead><tr>' + cfg.cols.map(function (c, i) { return '<th scope="col"><button type="button" class="cx-sort" data-i="' + i + '">' + esc(c.h) + (state.sort === i ? (state.dir > 0 ? ' ▲' : ' ▼') : '') + '</button></th>'; }).join('') + (cfg.actions ? '<th scope="col">Action</th>' : '') + '</tr></thead><tbody>';
        view.forEach(function (r) { html += '<tr data-id="' + esc(r.id) + '">' + cfg.cols.map(function (c) { return '<td>' + (c.raw ? c.get(r) : esc(c.get(r))) + '</td>'; }).join('') + (cfg.actions ? '<td class="cx-actions">' + cfg.actions(r) + '</td>' : '') + '</tr>'; });
        html += '</tbody></table></div>';
        if (pages > 1) html += '<div class="cx-pager"><button type="button" class="secondary small" data-p="-1" ' + (state.page ? '' : 'disabled') + '>‹ Prev</button><span>Page ' + (state.page + 1) + ' of ' + pages + '</span><button type="button" class="secondary small" data-p="1" ' + (state.page < pages - 1 ? '' : 'disabled') + '>Next ›</button></div>';
      }
      host.innerHTML = html;
      var s = UI.$('.cx-tsearch', host); s.oninput = function () { state.q = s.value; state.page = 0; draw(); var n = UI.$('.cx-tsearch', host); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
      UI.$$('.cx-chip', host).forEach(function (b) { b.onclick = function () { state.filter = b.dataset.f; state.page = 0; draw(); }; });
      UI.$$('.cx-sort', host).forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (state.sort === i) state.dir *= -1; else { state.sort = i; state.dir = 1; } draw(); }; });
      UI.$$('[data-p]', host).forEach(function (b) { b.onclick = function () { state.page += +b.dataset.p; draw(); }; });
      UI.$('.cx-csv', host).onclick = function () { var r = rows(); var csv = [cfg.cols.map(function (c) { return '"' + c.h + '"'; }).join(',')].concat(r.map(function (x) { return cfg.cols.map(function (c) { return '"' + strip(c.get(x)).replace(/"/g, '""') + '"'; }).join(','); })).join('\r\n'); var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = (cfg.title || 'export').replace(/\W+/g, '-').toLowerCase() + '.csv'; document.body.appendChild(a); a.click(); a.remove(); UI.toast('Exported ' + r.length + ' rows'); };
      if (cfg.onAction) UI.$$('[data-act]', host).forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); var id = b.closest('tr').dataset.id; try { cfg.onAction(b.dataset.act, id, b); } catch (err) { UI.toast(err.message, 'err'); } }; });
    }
    draw(); return { redraw: draw };
  };
  UI.btn = function (act, label, cls) { return '<button type="button" class="' + (cls || 'secondary') + ' small" data-act="' + act + '">' + esc(label) + '</button>'; };

  /* Modal with form fields + inline validation */
  UI.modal = function (title, bodyHtml, opts) {
    opts = opts || {};
    var back = document.createElement('div'); back.className = 'modalback open cx-modal'; back.setAttribute('role', 'dialog'); back.setAttribute('aria-modal', 'true'); back.setAttribute('aria-label', title);
    back.innerHTML = '<div class="modal' + (opts.wide ? ' cx-wide' : '') + '"><div class="modalhead"><h2>' + esc(title) + '</h2><button type="button" class="secondary small cx-close" aria-label="Close">✕</button></div><div class="cx-mbody">' + bodyHtml + '</div></div>';
    document.body.appendChild(back);
    var prev = document.activeElement;
    function close() { back.remove(); document.removeEventListener('keydown', key); if (prev && prev.focus) prev.focus(); }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    UI.$('.cx-close', back).onclick = close; back.addEventListener('click', function (e) { if (e.target === back) close(); });
    var f = UI.$('input,select,textarea,button:not(.cx-close)', back); if (f) setTimeout(function () { f.focus(); }, 30);
    return { el: back, close: close };
  };
  UI.fieldsHtml = function (fields) {
    return '<div class="fieldgrid">' + fields.map(function (f) {
      var id = 'f_' + f.name, req = f.required ? ' required aria-required="true"' : '', inner;
      if (f.type === 'select') inner = '<select id="' + id + '" name="' + f.name + '"' + req + '>' + (f.placeholder ? '<option value="">' + esc(f.placeholder) + '</option>' : '') + f.options.map(function (o) { var v = typeof o === 'object' ? o.value : o, l = typeof o === 'object' ? o.label : o; return '<option value="' + esc(v) + '"' + (String(f.value) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';
      else if (f.type === 'textarea') inner = '<textarea id="' + id + '" name="' + f.name + '"' + req + ' placeholder="' + esc(f.placeholder || '') + '">' + esc(f.value || '') + '</textarea>';
      else if (f.type === 'patient') inner = '<div class="cx-pp"><input id="' + id + '" autocomplete="off" placeholder="Search name, UHID or mobile…" value="' + esc(f.value ? H.pname(f.value) + ' · ' + f.value : '') + '" role="combobox" aria-expanded="false" aria-autocomplete="list"' + req + '><input type="hidden" name="' + f.name + '" value="' + esc(f.value || '') + '"><div class="cx-sugg" role="listbox"></div></div>';
      else inner = '<input id="' + id + '" name="' + f.name + '" type="' + (f.type || 'text') + '"' + req + (f.pattern ? ' pattern="' + f.pattern + '"' : '') + (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') + (f.step ? ' step="' + f.step + '"' : '') + ' placeholder="' + esc(f.placeholder || '') + '" value="' + esc(f.value == null ? '' : f.value) + '"' + (f.inputmode ? ' inputmode="' + f.inputmode + '"' : '') + (f.maxlength ? ' maxlength="' + f.maxlength + '"' : '') + '>';
      return '<div class="field' + (f.full ? ' full' : '') + '"><label for="' + id + '">' + esc(f.label) + (f.required ? ' <span aria-hidden="true" class="cx-req">*</span>' : '') + '</label>' + inner + '<small class="cx-err" aria-live="polite"></small>' + (f.hint ? '<small class="muted">' + esc(f.hint) + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  };
  UI.wirePatientPickers = function (root) {
    UI.$$('.cx-pp', root).forEach(function (w) {
      var inp = w.querySelector('input:not([type=hidden])'), hid = w.querySelector('input[type=hidden]'), box = w.querySelector('.cx-sugg');
      inp.addEventListener('input', function () { hid.value = ''; var r = H.searchPatients(inp.value); inp.setAttribute('aria-expanded', r.length ? 'true' : 'false'); box.innerHTML = r.map(function (p) { return '<button type="button" role="option" data-id="' + p.id + '"><b>' + esc(p.name) + '</b> <small>' + p.id + ' · ' + p.mobile + ' · ' + H.age(p.dob) + ' ' + (p.gender || '').charAt(0) + '</small></button>'; }).join('') || (inp.value.length > 1 ? '<div class="muted" style="padding:8px">No match. Register the patient at Front desk.</div>' : ''); });
      box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; hid.value = b.dataset.id; inp.value = H.pname(b.dataset.id) + ' · ' + b.dataset.id; box.innerHTML = ''; inp.setAttribute('aria-expanded', 'false'); hid.dispatchEvent(new Event('change', { bubbles: true })); });
    });
  };
  UI.form = function (title, fields, onSubmit, opts) {
    opts = opts || {};
    var m = UI.modal(title, '<form novalidate>' + (opts.intro || '') + UI.fieldsHtml(fields) + '<div class="formactions"><button type="button" class="secondary cx-cancel">Cancel</button><button type="submit">' + esc(opts.submit || 'Save') + '</button></div></form>', opts);
    var form = UI.$('form', m.el); UI.wirePatientPickers(form);
    UI.$('.cx-cancel', form).onclick = m.close;
    form.onsubmit = function (e) {
      e.preventDefault(); var ok = true;
      fields.forEach(function (f) { var el = form.elements[f.name], err = el && el.closest('.field').querySelector('.cx-err'); if (!el) return; var v = el.value.trim(), msg = ''; if (f.required && !v) msg = f.label + ' is required'; else if (v && f.pattern && !new RegExp('^' + f.pattern + '$').test(v)) msg = f.patternMsg || 'Invalid format'; else if (f.validate) msg = f.validate(v, form) || ''; if (err) err.textContent = msg; var vis = f.type === 'patient' ? el.parentNode.querySelector('input') : el; vis.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) ok = false; });
      if (!ok) { var bad = UI.$('[aria-invalid=true]', form); if (bad) bad.focus(); return; }
      var data = {}; fields.forEach(function (f) { var el = form.elements[f.name]; if (el) data[f.name] = el.value.trim(); });
      try { var r = onSubmit(data, form); if (r !== false) m.close(); } catch (err) { UI.toast(err.message, 'err'); }
    };
    return m;
  };
  UI.confirm = function (title, msg, onYes, yesLabel) { var m = UI.modal(title, '<p>' + esc(msg) + '</p><div class="formactions"><button type="button" class="secondary cx-no">Cancel</button><button type="button" class="cx-yes">' + esc(yesLabel || 'Confirm') + '</button></div>'); UI.$('.cx-no', m.el).onclick = m.close; UI.$('.cx-yes', m.el).onclick = function () { m.close(); try { onYes(); } catch (e) { UI.toast(e.message, 'err'); } }; };
  UI.kv = function (obj) { return '<dl class="cx-kv">' + Object.keys(obj).map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + (obj[k] == null || obj[k] === '' ? '-' : obj[k]) + '</dd>'; }).join('') + '</dl>'; };
  UI.invoiceHtml = function (inv) {
    var p = H.patient(inv.patientId) || {}, paid = H.invPaid(inv), tot = H.invTotal(inv);
    return '<div class="cx-invoice"><div class="cx-invhead"><div><b>' + esc(H.db().settings.hospitalName) + '</b><br><small>GSTIN ' + esc(H.db().settings.gstin) + '</small></div><div style="text-align:right"><b>' + esc(inv.id) + '</b><br><small>' + H.fmtDateTime(inv.at) + '</small></div></div><p><b>' + esc(p.name || '') + '</b> · ' + esc(inv.patientId) + ' · ' + esc(inv.type) + '</p><table class="cx-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>' + inv.lines.map(function (l) { return '<tr><td>' + esc(l.desc) + '</td><td>' + l.qty + '</td><td>' + H.money(l.rate) + '</td><td>' + H.money(l.qty * l.rate) + '</td></tr>'; }).join('') + '</tbody></table><div class="cx-invtot"><span>Discount</span><b>' + H.money(inv.discount) + '</b><span>Total</span><b>' + H.money(tot) + '</b><span>Paid</span><b>' + H.money(paid) + '</b><span>Balance</span><b>' + H.money(tot - paid) + '</b></div></div>';
  };
  W.UI = UI;
})(window);
