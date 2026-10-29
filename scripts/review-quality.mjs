// Qualidade, rede e fluidez da cena. Uso: CHROME_PATH=... node scripts/review-quality.mjs <perfil>
// perfis: d1080, d1440, d1440x2, m390, m360
import puppeteer from 'puppeteer-core';
const PAGE = process.env.PAGE_URL ?? 'http://127.0.0.1:4173/';
const OUT = new globalThis.URL('../review/', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PROFILES = {
  d1080: {width: 1920, height: 1080},
  d1080x2: {width: 1920, height: 1080, deviceScaleFactor: 2},
  d1440: {width: 1440, height: 900},
  d1440x2: {width: 1440, height: 900, deviceScaleFactor: 2},
  m390: {width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true},
  m360: {width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true},
};
const name = process.argv[2] ?? 'd1440';
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-precise-memory-info']});
const page = await browser.newPage();
const errs = [];
const hero = new Map();
let bytes = 0;
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_FAILED') && errs.push(m.text()));
page.on('response', async (r) => {
  const u = r.url();
  if (/hero\/[dm]-\d+/.test(u)) { hero.set(u, (hero.get(u) ?? 0) + 1); }
});
page.on('requestfinished', async (r) => { try { const l = (await r.response())?.headers()['content-length']; if (/hero\//.test(r.url())) bytes += Number(l ?? 0); } catch {} });
await page.setRequestInterception(true);
page.on('request', (r) => (r.url().includes('facebook') ? r.abort() : r.continue()));
await page.setViewport(PROFILES[name]);
const t0 = Date.now();
await page.goto(PAGE, {waitUntil: 'load'});
const loadMs = Date.now() - t0;
const initial = {frames: hero.size, bytes};
await sleep(300);
const m = await page.evaluate(() => {
  const c = document.querySelector('[data-intro-canvas]');
  const i = document.querySelector('[data-intro]');
  return {canvasCss: [c.offsetWidth, c.offsetHeight], intro: i.offsetHeight - i.querySelector('.intro-stage').offsetHeight, total: document.documentElement.scrollHeight - innerHeight};
});
const metrics = async () => (await page.metrics()).JSHeapUsedSize;
const lum = (buf) => 0; // (luminância é medida na página, ver abaixo)
const probe = () => page.evaluate(() => {
  const c = document.querySelector('[data-intro-canvas]');
  // média de luminância de uma amostra 32×18 do próprio canvas (detecta quadro preto)
  const t = document.createElement('canvas'); t.width = 32; t.height = 18;
  const x = t.getContext('2d'); x.drawImage(c, 0, 0, 32, 18);
  const d = x.getImageData(0, 0, 32, 18).data; let s = 0;
  for (let k = 0; k < d.length; k += 4) s += (d[k] + d[k + 1] + d[k + 2]) / 3;
  return {ready: c.classList.contains('is-ready'), buf: [c.width, c.height], lum: Math.round(s / (d.length / 4)), ox: document.documentElement.scrollWidth - innerWidth};
});
// 1) lento, ida e volta, parando para olhar
const slow = [];
const step = Math.round(PROFILES[name].height * 0.45);
const ys = []; for (let y = 0; y <= m.total; y += step) ys.push(y);
let black = 0, notReady = 0, ox = 0, canvasBuf;
for (const dir of ['ida', 'volta']) {
  for (const y of dir === 'ida' ? ys : [...ys].reverse()) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await sleep(160);
    const p = await probe();
    canvasBuf = p.buf; ox = Math.max(ox, p.ox);
    if (!p.ready) notReady++;
    if (p.ready && p.lum < 6) black++;
    slow.push(p.lum);
  }
}
// 2) rápido: saltos grandes e rolagem contínua sem esperar
const heap0 = await metrics();
for (let r = 0; r < 3; r++) {
  for (let y = 0; y <= m.total; y += 160) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(8); }
  for (let y = m.total; y >= 0; y -= 160) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(8); }
}
await sleep(500);
const fast = await probe();
const heap1 = await metrics();
// 3) quadros duplicados na rede?
const dup = [...hero.values()].filter((n) => n > 1).length;
let total = 0; for (const [u] of hero) total++;
// capturas de nitidez (1:1 do que o visitante vê)
const shots = [[0, 'inicio'], [Math.round(m.intro * 0.72), 'placa'], [Math.round(m.intro * 1.0), 'notebook']];
for (const [y, n] of shots) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(700); await page.screenshot({path: `${OUT}q-${name}-${n}.png`}); }
console.log(JSON.stringify({name, loadMs, initial, canvasCss: m.canvasCss, buffer: canvasBuf, introRunPx: m.intro, heroFramesFetched: total, duplicates: dup, heroBytesKB: Math.round(bytes / 1024), heapMB: [Math.round(heap0 / 1e6), Math.round(heap1 / 1e6)], black, notReady, overflowX: ox, afterFast: fast, errs}));
await browser.close();
