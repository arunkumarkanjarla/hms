// Rewire every desktop + mobile HTML page to the shared data engine. Idempotent.
const fs = require('fs'), path = require('path');
const base = process.argv[2];
const D = path.join(base, 'HMS_Static_Application'), Mo = path.join(base, 'HMS Static Mobile App');
function walk(d, out = []) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p, out); else if (f.name.endsWith('.html')) out.push(p); } return out; }
let n = 0, skipped = [];
function patch(file, root, kind) {
  let s = fs.readFileSync(file, 'utf8'); const o = s;
  const rel = path.relative(path.dirname(file), path.join(root, 'assets')).replace(/\\/g, '/') + '/';
  const re = /<script src="([^"]*?)assets\/app\.js"><\/script>/;
  if (!re.test(s) && s.indexOf('hms-core.js') < 0) { skipped.push(file); return; }
  const scripts = kind === 'desktop' ? ['hms-core.js', 'hms-ui.js', 'hms-app.js'] : ['hms-core.js', 'mobile-app.js'];
  const css = kind === 'desktop' ? 'hms-app.css' : 'mobile-app.css';
  s = s.replace(re, scripts.map(x => '<script src="' + rel + x + '"></script>').join(''));
  if (s.indexOf(css) < 0) s = s.replace(/(<link rel="stylesheet" href="[^"]*assets\/app\.css">)/, '$1<link rel="stylesheet" href="' + rel + css + '">');
  if (s !== o) { fs.writeFileSync(file, s); n++; }
}
walk(D).forEach(f => patch(f, D, 'desktop'));
walk(Mo).forEach(f => patch(f, Mo, 'mobile'));
console.log('patched', n, 'skipped', skipped.length); skipped.forEach(f => console.log(' skip', f));
