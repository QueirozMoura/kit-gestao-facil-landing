// Capturas para revisão visual: node scripts/shots.mjs [url]  → review/s-*.png
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:4173/';
// Caminho do Chrome/Chromium: defina CHROME_PATH (ex.: /usr/bin/chromium).
const chrome = process.env.CHROME_PATH;
if (!chrome) throw new Error('Defina CHROME_PATH com o executável do Chrome/Chromium.');
const out = path.resolve('review');
fs.mkdirSync(out, {recursive: true});
const browser = await puppeteer.launch({executablePath: chrome, args: ['--no-sandbox']});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [name, vp, reduced] of [
  ['d', {width: 1366, height: 860, deviceScaleFactor: 1}, false],
  ['m', {width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true}, false],
  ['r', {width: 1366, height: 860, deviceScaleFactor: 1}, true],
]) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  if (reduced) await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, {waitUntil: 'networkidle0'});
  await sleep(1400);
  await page.screenshot({path: `${out}/s-${name}-0.png`});
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 1;
  for (let y = vp.height * 0.85; y < h; y += vp.height * 0.85, i++) {
    await page.evaluate((y) => window.scrollTo({top: y, behavior: 'instant'}), y);
    await sleep(1300);
    await page.screenshot({path: `${out}/s-${name}-${i}.png`});
  }
  const info = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: innerWidth,
    wide: [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && r.width > 0; }).slice(0, 6).map((e) => e.tagName + '.' + e.className),
  }));
  console.log(name, 'h=', h, 'shots=', i, JSON.stringify(info), errors);
  await page.close();
}
await browser.close();
