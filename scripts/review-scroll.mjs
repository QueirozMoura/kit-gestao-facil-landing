// Percurso da animação: progresso, quadro e texto a cada passo de rolagem, nos dois sentidos.
import puppeteer from 'puppeteer-core';
const PAGE = process.env.PAGE_URL ?? 'http://127.0.0.1:4173/';
const OUT = new globalThis.URL('../review/', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH, args: ['--no-sandbox']});
for (const [name, vp] of [['d', {width: 1440, height: 900}], ['m', {width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true}]]) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (r) => (r.url().includes('facebook') ? r.abort() : r.continue()));
  await page.setViewport(vp);
  await page.goto(PAGE, {waitUntil: 'load'});
  const m = await page.evaluate(() => {
    const i = document.querySelector('[data-intro]'), s = i.querySelector('.intro-stage');
    return {section: i.offsetHeight, stage: s.offsetHeight, vh: innerHeight, run: i.offsetHeight - s.offsetHeight};
  });
  console.log(name, JSON.stringify({...m, sectionVh: (m.section / m.vh * 100).toFixed(0), runVh: (m.run / m.vh * 100).toFixed(0)}));
  const stops = [0, 0.05, 0.1, 0.3, 0.5, 0.7, 0.9, 1, 1.03];
  const seq = [...stops, ...[...stops].reverse().slice(1)];
  for (const f of seq) {
    await page.evaluate((y) => scrollTo(0, y), Math.round(m.run * f));
    await sleep(700);
    const st = await page.evaluate(() => {
      const i = document.querySelector('[data-intro]');
      return {a: i.style.getPropertyValue('--a'), b: i.style.getPropertyValue('--b'), top: Math.round(i.querySelector('.intro-stage').getBoundingClientRect().top), buyVisible: (() => { const r = i.querySelector('.buy .btn').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })(), eyebrowTop: Math.round(i.querySelector('.eyebrow').getBoundingClientRect().top), headerBottom: Math.round(document.querySelector('.site-header').getBoundingClientRect().bottom)};
    });
    console.log(' ', f, JSON.stringify(st));
    if ([0, 0.5, 1, 1.03].includes(f)) await page.screenshot({path: `${OUT}${name}-scroll-${Math.round(f * 100)}.png`});
  }
  await page.close();
}
await browser.close();
