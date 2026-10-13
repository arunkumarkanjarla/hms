// Crawl every desktop + mobile page in headless Chrome: console errors, dead links, inert buttons.
// Usage: node crawl.js [desktop|mobile|all] [maxButtonsPerPage]
const fs = require('fs'), path = require('path'); const { launch, sleep, fileUrl } = require('./cdp.js');
const BASE = path.resolve(__dirname, '..', 'static appliction');
const which = process.argv[2] || 'all', MAXB = +(process.argv[3] || 25);
function walk(d, out = []) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p, out); else if (f.name.endsWith('.html')) out.push(p); } return out; }
let pages = [];
if (which !== 'mobile') pages = pages.concat(walk(path.join(BASE, 'HMS_Static_Application')));
if (which !== 'desktop') pages = pages.concat(walk(path.join(BASE, 'HMS Static Mobile App')));
const PROBE = `(function(){ if(window.__cx)return; window.__cx={m:0}; window.print=function(){window.__cx.m++}; new MutationObserver(function(l){window.__cx.m+=l.length}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true}); })()`;
const LIST = `(function(){ var root=document.querySelector('main.content')||document.querySelector('main')||document.body; var bs=[].slice.call(document.querySelectorAll('button, [role=button], a[href^="#"], a[href=""], a:not([href])')).filter(function(b){ var r=b.getBoundingClientRect(); return r.width>0&&r.height>0&&!b.disabled&&!b.closest('.mx-back,.cx-modal-back,.cx-modal')&&!/sign out|log ?out|reset|delete|disable|suspend/i.test(b.textContent); }); bs.forEach(function(b,i){b.setAttribute('data-cxi',i)}); return bs.length; })()`;
const CLOSE = `(function(){ document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); [].slice.call(document.querySelectorAll('.mx-back,.cx-modal-back,.cx-backdrop')).forEach(function(x){x.remove()}); })()`;
(async () => {
  const b = await launch(9333 + (which === 'mobile' ? 1 : 0));
  await b.send('Page.setInterceptFileChooserDialog', { enabled: true }).catch(() => { });
  b.send('Page.enable'); const dialogs = [];
  const res = { pages: 0, errors: [], deadLinks: [], inert: [], buttons: 0, ok: 0 };
  // seed + admin session
  await b.goto(fileUrl(path.join(BASE, 'HMS_Static_Application', 'login.html')));
  await b.eval(`HMS.reset(); HMS.login('admin@careaxis.demo','demo123').ok`);
  for (const p of pages) {
    const url = fileUrl(p); const rel = path.relative(BASE, p);
    const isMob = rel.startsWith('HMS Static Mobile App');
    await b.viewport(isMob ? 412 : 1280, isMob ? 860 : 900, isMob);
    b.errors.length = 0; await b.goto(url, 600); res.pages++;
    if (/login\.html$|index\.html$/.test(rel)) await b.eval(`HMS.session()||HMS.login('admin@careaxis.demo','demo123')`).catch(() => { });
    // dead links
    const links = await b.eval(`[].slice.call(document.querySelectorAll('a[href]')).map(function(a){return a.href})`).catch(() => []);
    for (const h of links) { if (!h.startsWith('file:')) continue; const fp = decodeURIComponent(h.replace(/^file:\/\/\/?/, '').replace(/[?#].*$/, '')).replace(/\//g, path.sep); if (!fs.existsSync(fp)) res.deadLinks.push(rel + ' -> ' + h); }
    // buttons
    let n = await b.eval(LIST).catch(() => 0); n = Math.min(n, MAXB); const here = await b.eval('location.href');
    for (let i = 0; i < n; i++) {
      await b.eval(PROBE);
      const info = await b.eval(`(function(){var e=document.querySelector('[data-cxi="${i}"]'); if(!e)return null; window.__cx.m=0; var h=location.href; e.click(); return {t:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,40), h:h};})()`).catch(() => null);
      if (!info) continue; res.buttons++;
      await sleep(160);
      let st; try { st = await b.eval(`({m: window.__cx ? window.__cx.m : -1, h: location.href})`); } catch (e) { st = { m: 1, h: 'nav' }; }
      if (st.m === 0 && st.h === info.h) res.inert.push(rel + ' :: ' + info.t);
      if (st.h !== here || st.m === -1) { await b.goto(here, 500); await b.eval(LIST).catch(() => 0); } else await b.eval(CLOSE).catch(() => { });
    }
    if (b.errors.length) res.errors.push(rel + '\n   ' + [...new Set(b.errors)].join('\n   ')); else res.ok++;
    process.stdout.write('.');
  }
  await b.close();
  const out = path.join(__dirname, 'crawl-' + which + '-results.json'); fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log('\nPages', res.pages, '| clean', res.ok, '| with errors', res.errors.length, '| buttons clicked', res.buttons, '| inert', res.inert.length, '| dead links', res.deadLinks.length);
  res.errors.slice(0, 40).forEach(e => console.log('ERR', e)); res.deadLinks.slice(0, 30).forEach(e => console.log('DEAD', e)); res.inert.slice(0, 60).forEach(e => console.log('INERT', e));
  process.exit(res.errors.length || res.deadLinks.length || res.inert.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
