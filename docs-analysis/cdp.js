// Minimal Chrome DevTools Protocol driver using Node 24 built-ins only (fetch + WebSocket). No installs.
const { spawn } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
const CHROME = [process.env.CHROME, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].filter(Boolean).find(p => fs.existsSync(p));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function launch(port = 9333) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cx-cdp-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + dir, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
  let ver; for (let i = 0; i < 60; i++) { try { ver = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json(); break; } catch (e) { await sleep(250); } }
  if (!ver) throw new Error('Chrome did not start');
  const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  const pg = list.find(t => t.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map(); const handlers = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else if (m.method) handlers.forEach(h => h(m)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const errors = [];
  handlers.push(m => {
    if (m.method === 'Runtime.exceptionThrown') errors.push('EXC ' + (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text).split('\n')[0] + ' @' + (m.params.exceptionDetails.url || ''));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('CONSOLE ' + m.params.args.map(a => a.value || a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) errors.push('LOG ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  });
  handlers.push(m => { if (m.method === 'Page.javascriptDialogOpening') { api.dialogs.push(m.params.message); send('Page.handleJavaScriptDialog', { accept: true }).catch(() => { }); } });
  await send('Page.enable'); await send('Browser.setDownloadBehavior', { behavior: 'deny' }).catch(() => { }); await send('Runtime.enable'); await send('Log.enable');
  const api = {
    send, errors, dialogs: [],
    async eval(expr) { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; },
    async goto(url, wait = 700) { try { const cur = await api.eval('location.href'); if (url.indexOf('#') > -1 && decodeURI(cur.split('#')[0]) === decodeURI(url.split('#')[0])) { await send('Page.navigate', { url: 'about:blank' }); await sleep(200); } } catch (e) { } const done = new Promise(res => { const h = m => { if (m.method === 'Page.loadEventFired') { handlers.splice(handlers.indexOf(h), 1); res(); } }; handlers.push(h); }); await send('Page.navigate', { url }); await Promise.race([done, sleep(8000)]); const base = url.split('#')[0]; await api.waitFor("document.readyState==='complete' && decodeURI(location.href.split('#')[0])===decodeURI(" + JSON.stringify(base) + ")", 6000); await sleep(wait); },
    async waitFor(expr, ms = 5000) { const t = Date.now(); while (Date.now() - t < ms) { try { if (await api.eval(expr)) return true; } catch (e) { } await sleep(120); } return false; },
    async viewport(w, h, mobile) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile }); },
    async screenshot(file) { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(file, Buffer.from(r.data, 'base64')); },
    async close() { try { await send('Browser.close'); } catch (e) { } try { proc.kill(); } catch (e) { } await sleep(300); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { } }
  };
  return api;
}
const fileUrl = p => { const k = p.indexOf('#'); const h = k > -1 ? p.slice(k) : ''; if (k > -1) p = p.slice(0, k); return 'file:///' + p.replace(/\\/g, '/').split('/').map((x, i) => i === 0 ? x : encodeURIComponent(x)).join('/') + h; };
module.exports = { launch, sleep, fileUrl };
