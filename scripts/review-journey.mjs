// Percorre a página inteira (ida e volta) registrando o estado da cena e capturas em review/journey-*.png.
// Uso: CHROME_PATH=... node scripts/review-journey.mjs [d|m]
import puppeteer from 'puppeteer-core';
const PAGE = process.env.PAGE_URL ?? 'http://127.0.0.1:4173/';
const OUT = new globalThis.URL('../review/', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv[2];
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH, args: ['--no-sandbox']});
const VPS = {d: {width: 1440, height: 900}, m: {width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true}};
for (const name of only ? [only] : ['d', 'm']) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_FAILED') && errs.push(m.text()));
  await page.setRequestInterception(true);
  page.on('request', (r) => (r.url().includes('facebook') ? r.abort() : r.continue()));
  await page.setViewport(VPS[name]);
  await page.goto(PAGE, {waitUntil: 'load'});
  await sleep(500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const vh = VPS[name].height;
  const state = () => page.evaluate(() => {
    const w = document.querySelector('[data-world]').style;
    const secs = ['topo', 'demonstracao', 'kit', 'como-funciona', 'oferta', 'duvidas'].map((id) => [id, Math.round(document.getElementById(id).getBoundingClientRect().top)]);
    const at = secs.filter(([, t]) => t <= innerHeight / 2).pop()?.[0];
    return {y: Math.round(scrollY), sec: at, s: w.getPropertyValue('--s'), dim: w.getPropertyValue('--dim'), lb: w.getPropertyValue('--lb'), ox: document.documentElement.scrollWidth - innerWidth,
      canvas: document.querySelector('[data-intro-canvas]').classList.contains('is-ready')};
  });
  const step = Math.round(vh * 0.9);
  const ys = []; for (let y = 0; y <= total; y += step) ys.push(y); ys.push(total);
  let n = 0;
  console.log(name, 'total', total, 'vh', vh, 'passos', ys.length);
  for (const dir of ['ida', 'volta']) {
    for (const y of dir === 'ida' ? ys : [...ys].reverse()) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await sleep(550);
      const st = await state();
      if (dir === 'ida') console.log(' ', dir, JSON.stringify(st));
      await page.screenshot({path: `${OUT}journey-${name}-${dir}-${String(n++).padStart(2, '0')}.png`});
    }
  }
  console.log(name, 'erros', JSON.stringify(errs));
  await page.close();
}
await browser.close();
