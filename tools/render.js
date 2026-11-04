#!/usr/bin/env node
// Renders a carousel spec (JSON) into 1080x1350 PNG slides.
// Usage: node tools/render.js output/2026-11-04/c1/spec.json
//
// Spec format:
// {
//   "handle": "@videogamers",            (optional)
//   "slides": [
//     { "layout": "tweet",   "text": "line above the image", "image": "assets/x.jpg", "image_note": "what the image should be" },
//     { "layout": "bigtext", "text": "huge statement", "sub": "smaller line under it" },
//     { "layout": "meme",    "top": "TOP TEXT", "bottom": "BOTTOM TEXT", "image": "...", "image_note": "..." },
//     { "layout": "split",   "left":  { "label": "14 y/o me", "text": "...", "image": "...", "image_note": "..." },
//                            "right": { "label": "25 y/o me", "text": "...", "image": "...", "image_note": "..." } },
//     { "layout": "list",    "title": "workday timeline", "items": ["9:00am — ...", "4:59pm — ..."] },
//     { "layout": "countdown", "number": "15", "label": "days until GTA 6", "text": "things I have to survive first:" }
//   ]
// }
// Image paths are relative to the project root. Missing images render as a
// labeled placeholder showing image_note, so the slide is still reviewable.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const specPath = path.resolve(process.argv[2] || '');
if (!fs.existsSync(specPath)) { console.error('spec not found: ' + specPath); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const outDir = path.dirname(specPath);
const handle = spec.handle || '@videogamers';

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');

function img(src, note, cls = 'img') {
  if (src) {
    const p = path.resolve(ROOT, src);
    if (fs.existsSync(p)) {
      const ext = path.extname(p).slice(1).toLowerCase().replace('jpg','jpeg');
      const b64 = fs.readFileSync(p).toString('base64');
      return `<div class="${cls}" style="background-image:url(data:image/${ext};base64,${b64})"></div>`;
    }
  }
  return `<div class="${cls} ph"><div><b>IMAGE</b><br>${esc(note || src || 'add image')}</div></div>`;
}

// Shrink font until text fits its box.
const fitScript = `
for (const el of document.querySelectorAll('[data-fit]')) {
  let size = parseFloat(getComputedStyle(el).fontSize);
  const min = parseFloat(el.dataset.fit);
  while ((el.scrollHeight > el.clientHeight + 6 || el.scrollWidth > el.clientWidth + 2) && size > min) {
    size -= 2; el.style.fontSize = size + 'px';
  }
}`;

function slideHTML(s) {
  switch (s.layout) {
    case 'tweet':
      return `<div class="tweet"><div class="t" data-fit="34">${esc(s.text)}</div>${img(s.image, s.image_note)}</div>`;
    case 'bigtext':
      return `<div class="big"><div class="bt" data-fit="48">${esc(s.text)}</div>${s.sub ? `<div class="bs">${esc(s.sub)}</div>` : ''}</div>`;
    case 'meme':
      return `<div class="meme">${img(s.image, s.image_note, 'img full')}<div class="mt" data-fit="40">${esc(s.top)}</div><div class="mb" data-fit="40">${esc(s.bottom)}</div></div>`;
    case 'split':
      const side = x => `<div class="side"><div class="lab">${esc(x.label)}</div>${img(x.image, x.image_note)}<div class="st" data-fit="26">${esc(x.text)}</div></div>`;
      return `<div class="split">${side(s.left || {})}${side(s.right || {})}</div>`;
    case 'list':
      return `<div class="list"><div class="lt">${esc(s.title)}</div><div class="items" data-fit="28">${(s.items||[]).map(i => `<div class="li">${esc(i)}</div>`).join('')}</div></div>`;
    case 'countdown':
      return `<div class="cd"><div class="num">${esc(s.number)}</div><div class="cl">${esc(s.label)}</div>${s.text ? `<div class="ct" data-fit="30">${esc(s.text)}</div>` : ''}</div>`;
    case 'calendar': {
      // { title, month, first_weekday (0=Sun), days, checked_through, special_day, special_text, quote }
      const cells = [];
      for (let i = 0; i < (s.first_weekday || 0); i++) cells.push('<div class="cc empty"></div>');
      for (let d = 1; d <= (s.days || 30); d++) {
        let cls = 'cc', mark = '';
        if (d <= (s.checked_through || 0)) { cls += ' done'; mark = '<span class="ck">✓</span>'; }
        else if (d === s.special_day) { cls += ' sp'; mark = `<span class="spt">${esc(s.special_text)}</span>`; }
        else if (s.special_day && d > s.special_day) cls += ' after';
        cells.push(`<div class="${cls}"><span class="dn">${d}</span>${mark}</div>`);
      }
      return `<div class="cal"><div class="calt" data-fit="40">${esc(s.title)}</div><div class="calm">${esc(s.month)}</div><div class="wk">${['S','M','T','W','T','F','S'].map(x=>`<div>${x}</div>`).join('')}</div><div class="grid">${cells.join('')}</div>${s.quote ? `<div class="calq">${esc(s.quote)}</div>` : ''}</div>`;
    }
    case 'wasted':
      return `<div class="was"><div class="wt">${esc(s.text || 'wasted')}</div>${s.sub ? `<div class="ws">${esc(s.sub)}</div>` : ''}</div>`;
    default:
      return `<div class="big"><div class="bt">unknown layout: ${esc(s.layout)}</div></div>`;
  }
}

const css = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;background:#fff;font-family:Inter,'DejaVu Sans',sans-serif;color:#0f0f0f}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;background:#fff}
.h{position:absolute;bottom:26px;right:36px;font-size:26px;font-weight:600;opacity:.55;letter-spacing:.2px}
.dark .h{color:#fff}
.img{background-size:cover;background-position:center;background-color:#eee}
.ph{display:flex;align-items:center;justify-content:center;text-align:center;background:repeating-linear-gradient(45deg,#ececec,#ececec 24px,#e2e2e2 24px,#e2e2e2 48px);color:#666;font-size:30px;padding:40px;line-height:1.35;border:3px dashed #bbb}
.ph b{letter-spacing:4px;font-size:22px;color:#999}
.tweet{display:flex;flex-direction:column;height:100%;padding:70px 60px 90px}
.tweet .t{font-size:54px;font-weight:600;line-height:1.22;max-height:430px;overflow:hidden;margin-bottom:40px;letter-spacing:-.5px}
.tweet .img{flex:1;border-radius:18px}
.big{height:100%;display:flex;flex-direction:column;justify-content:center;padding:100px 80px;background:#0f0f0f;color:#fff}
.big .bt{font-size:130px;font-weight:800;line-height:1.05;letter-spacing:-2px;max-height:900px;overflow:hidden}
.big .bs{margin-top:44px;font-size:40px;font-weight:500;opacity:.7;line-height:1.3}
.meme{height:100%;position:relative;background:#000}
.meme .full{position:absolute;inset:0}
.meme .mt,.meme .mb{position:absolute;left:40px;right:40px;text-align:center;font-family:Impact,'Anton','Inter',sans-serif;font-weight:900;font-size:80px;line-height:1.05;color:#fff;text-transform:uppercase;-webkit-text-stroke:3px #000;paint-order:stroke fill;max-height:360px;overflow:hidden}
.meme .mt{top:50px}.meme .mb{bottom:80px}
.split{display:flex;height:100%;padding:60px 40px 90px;gap:30px}
.side{flex:1;display:flex;flex-direction:column}
.lab{font-size:40px;font-weight:800;text-align:center;margin-bottom:24px;letter-spacing:-.5px}
.side .img{height:620px;border-radius:16px}
.st{margin-top:28px;font-size:40px;font-weight:600;line-height:1.25;flex:1;overflow:hidden;text-align:center}
.list{height:100%;padding:90px 70px 100px;display:flex;flex-direction:column}
.lt{font-size:64px;font-weight:800;letter-spacing:-1px;margin-bottom:50px}
.items{flex:1;overflow:hidden;font-size:56px;line-height:1.3}
.li{padding:22px 0;border-bottom:2px solid #e6e6e6;font-weight:500}
.cd{height:100%;background:#0f0f0f;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;text-align:center}
.num{font-size:420px;font-weight:900;line-height:.9;letter-spacing:-16px;background:linear-gradient(135deg,#ff5fa2,#ffb347,#4fd1ff);-webkit-background-clip:text;color:transparent}
.cl{font-size:56px;font-weight:800;margin-top:20px;letter-spacing:-1px}
.ct{margin-top:50px;font-size:42px;opacity:.75;max-height:320px;overflow:hidden;line-height:1.3}

.cal [data-fit],.big [data-fit],.tweet [data-fit]{flex-shrink:0}
.cal{height:100%;padding:70px 56px 90px;display:flex;flex-direction:column}
.calt{font-size:66px;font-weight:800;letter-spacing:-1.5px;line-height:1.1;max-height:160px;overflow:hidden}
.calm{font-size:30px;font-weight:700;letter-spacing:6px;color:#888;margin:26px 0 18px}
.wk{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;font-size:24px;font-weight:700;color:#aaa;text-align:center;margin-bottom:10px}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
.cc{position:relative;height:150px;border:2px solid #e3e3e3;border-radius:14px;display:flex;align-items:center;justify-content:center}
.cc.empty{border:none}
.dn{position:absolute;top:8px;left:12px;font-size:22px;font-weight:700;color:#999}
.ck{font-size:64px;font-weight:900;color:#1fa84f}
.cc.done{background:#effaf2;border-color:#bfe8cb}
.cc.after{background:#f4f4f4;border-color:#f4f4f4}
.cc.after .dn{color:#d0d0d0}
.cc.sp{background:linear-gradient(135deg,#ff4f9a,#ff9a3c);border:none;box-shadow:0 0 0 6px #ffd1e4}
.cc.sp .dn{color:#fff}
.spt{white-space:nowrap;color:#fff;font-weight:900;font-size:34px;letter-spacing:-1px;margin-top:14px}
.calq{margin-top:auto;font-size:54px;font-weight:700;text-align:center;line-height:1.25;letter-spacing:-.5px}
.was{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,#3a3a3a,#0b0b0b 75%);text-align:center;padding:80px}
.wt{font-size:210px;font-weight:900;color:#d4202a;letter-spacing:-4px;text-transform:lowercase;font-style:italic;text-shadow:0 6px 0 #000,0 0 40px rgba(212,32,42,.35)}
.ws{margin-top:40px;font-size:44px;color:#ddd;font-weight:600;line-height:1.35}
`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const files = [];
  for (let i = 0; i < spec.slides.length; i++) {
    const s = spec.slides[i];
    const dark = ['bigtext', 'countdown', 'meme', 'wasted'].includes(s.layout) ? 'dark' : '';
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="slide ${dark}">${slideHTML(s)}<div class="h">${esc(handle)}</div></div><script>${fitScript}</script></body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    const out = path.join(outDir, `slide-${i + 1}.png`);
    await page.screenshot({ path: out });
    files.push(out);
  }
  await browser.close();
  console.log(files.join('\n'));
})();
