// Páginas inteiras, ampliação das capturas, FAQ e barra de compra. Uso: CHROME_PATH=... node scripts/review-page.mjs
import puppeteer from 'puppeteer-core';
const PAGE = process.env.PAGE_URL ?? 'http://127.0.0.1:4173/';
const OUT = new globalThis.URL('../review/', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH, args: ['--no-sandbox']});
for (const [name, vp] of [['d', {width: 1440, height: 900}], ['m', {width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true}]]) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_FAILED') && errs.push(m.text()));
  await page.setRequestInterception(true);
  page.on('request', (r) => (r.url().includes('facebook') ? r.abort() : r.continue()));
  await page.setViewport(vp);
  await page.goto(PAGE, {waitUntil: 'load'});
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await sleep(120); }
  await page.evaluate(() => scrollTo(0, 0)); await sleep(300);
  await page.screenshot({path: OUT + `${name}-full.png`, fullPage: true});
  // FAQ
  await page.evaluate(() => document.querySelector('.faq-list details').scrollIntoView({block: 'center'}));
  await page.click('.faq-list summary'); await sleep(200);
  const faqOpen = await page.evaluate(() => document.querySelector('.faq-list details').open);
  // barra de compra (celular) logo após a abertura
  await page.evaluate(() => document.getElementById('demonstracao').scrollIntoView()); await sleep(500);
  const bar = await page.evaluate(() => getComputedStyle(document.querySelector('[data-buy-bar]')).visibility);
  await page.screenshot({path: OUT + `${name}-demo.png`});
  // lightbox
  await page.evaluate(() => document.querySelector('a[data-zoom]').scrollIntoView({block: 'center'}));
  await page.click('a[data-zoom]'); await sleep(400);
  const lb1 = await page.evaluate(() => ({open: document.querySelector('dialog').open, n: document.querySelector('[data-lb-count]').textContent}));
  await page.keyboard.press('ArrowRight'); await sleep(200);
  const lb2 = await page.evaluate(() => document.querySelector('[data-lb-count]').textContent);
  await page.screenshot({path: OUT + `${name}-lightbox.png`});
  await page.keyboard.press('Escape'); await sleep(200);
  const closed = await page.evaluate(() => !document.querySelector('dialog').open && document.activeElement?.matches('a[data-zoom]'));
  const links = await page.evaluate(() => [...document.querySelectorAll('a[data-checkout]')].map((a) => a.href));
  console.log(name, JSON.stringify({errs, faqOpen, bar, lb1, lb2, closedAndFocus: closed, links: [...new Set(links)]}));
  await page.close();
}
await browser.close();
