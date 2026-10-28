// Revisão em navegador real: capturas em review/, erros de console, overflow, rede e animação.
// Uso (com `npm run preview` rodando): CHROME_PATH=/caminho/chrome node scripts/review.mjs
import puppeteer from 'puppeteer-core';
import {mkdirSync} from 'node:fs';

const PAGE = process.env.PAGE_URL ?? 'http://127.0.0.1:4173/';
const OUT = new URL('../review/', import.meta.url).pathname;
mkdirSync(OUT, {recursive: true});
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH, args: ['--no-sandbox']});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(name, {w, h, dpr = 1, mobile = false, reduce = false, js = true, throttle = null, block = null}) {
  const page = await browser.newPage();
  const errors = [];
  const reqs = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  page.on('requestfailed', (r) => !r.url().includes('facebook') && errors.push('failed ' + r.url()));
  page.on('response', async (r) => reqs.push([r.url(), Number(r.headers()['content-length'] ?? 0)]));
  await page.setViewport({width: w, height: h, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile});
  await page.setJavaScriptEnabled(js);
  if (reduce) await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (r.url().includes('facebook')) return r.abort();
    if (block && r.url().includes(block)) return r.abort();
    r.continue();
  });
  if (throttle) {
    const c = await page.createCDPSession();
    await c.send('Network.emulateNetworkConditions', throttle);
  }
  await page.goto(PAGE, {waitUntil: 'load'});
  await sleep(600);
  const run = await page.evaluate(() => { const r = document.querySelector('[data-intro]'); return r.offsetHeight - innerHeight; });
  const initial = reqs.filter(([u]) => /hero|img|assets/.test(u)).map(([u, n]) => u.split('/').slice(-2).join('/') + ' ' + n);
  const shots = [];
  for (const f of [0, 0.2, 0.45, 0.7, 1]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(run * f));
    await sleep(900);
    const s = `${name}-intro-${Math.round(f * 100)}.png`;
    await page.screenshot({path: OUT + s});
    shots.push(s);
  }
  const info = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    canvasReady: document.querySelector('[data-intro-canvas]')?.classList.contains('is-ready'),
    static: document.querySelector('[data-intro]').classList.contains('is-static'),
    introH: Math.round(document.querySelector('[data-intro]').offsetHeight / innerHeight * 100) + 'vh',
  }));
  const frames = reqs.filter(([u]) => /hero\/[dm]-/.test(u)).length;
  // volta ao topo: a animação deve retroceder
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(700);
  await page.screenshot({path: OUT + `${name}-back-0.png`});
  console.log(name, JSON.stringify({...info, frames, errors, run, firstLoad: initial}));
  await page.close();
}

await run('desktop', {w: 1440, h: 900});
await run('desktop1080', {w: 1920, h: 1080});
await run('mobile390', {w: 390, h: 844, dpr: 3, mobile: true});
await run('mobile360', {w: 360, h: 640, dpr: 2, mobile: true});
await run('reduced', {w: 1440, h: 900, reduce: true});
await run('nojs', {w: 1440, h: 900, js: false});
await run('framesfail', {w: 390, h: 844, dpr: 2, mobile: true, block: '/hero/m-0'});
await run('slow', {w: 390, h: 844, dpr: 2, mobile: true, throttle: {offline: false, downloadThroughput: 200 * 1024, uploadThroughput: 50 * 1024, latency: 400}});
await browser.close();
