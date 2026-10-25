import puppeteer from 'puppeteer-core';
import path from 'node:path';
const url = 'http://127.0.0.1:4173/';
// Caminho do Chrome/Chromium: defina CHROME_PATH (ex.: /usr/bin/chromium).
const chrome = process.env.CHROME_PATH;
if (!chrome) throw new Error('Defina CHROME_PATH com o executável do Chrome/Chromium.');
const out = path.resolve('review');
const b = await puppeteer.launch({executablePath: chrome, args: ['--no-sandbox', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4']});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1) Quadros da entrada (desktop)
let p = await b.newPage();
await p.setViewport({width: 1366, height: 860});
const mp4 = [];
p.on('request', (r) => r.url().endsWith('.mp4') && mp4.push(r.url()));
await p.goto(url, {waitUntil: 'domcontentloaded'});
for (const t of [120, 350, 700]) { await sleep(t === 120 ? 120 : t === 350 ? 230 : 350); await p.screenshot({path: `${out}/anim-${t}.png`}); }
await sleep(800);
// 2) Tilt com o mouse
await p.mouse.move(200, 200); await sleep(100); await p.mouse.move(1250, 700, {steps: 5}); await sleep(600);
const tilt = await p.evaluate(() => getComputedStyle(document.querySelector('.scene')).transform);
await p.screenshot({path: `${out}/tilt.png`});
await p.mouse.move(683, 430, {steps: 3}); await sleep(600);
const tilt0 = await p.evaluate(() => getComputedStyle(document.querySelector('.scene')).transform);
// 3) Hover e foco do botão
const btn = await p.$('.hero-buy .btn');
const before = await p.evaluate((e) => { const c = getComputedStyle(e); return [c.backgroundColor, c.transform, c.boxShadow.slice(0,40)]; }, btn);
await btn.hover(); await sleep(400);
const hov = await p.evaluate((e) => { const c = getComputedStyle(e); return [c.backgroundColor, c.transform, getComputedStyle(e.querySelector('.btn-arrow')).transform]; }, btn);
await p.keyboard.press('Tab'); 
await p.focus('.hero-buy .btn'); await p.keyboard.press('Tab'); await p.keyboard.down('Shift'); await p.keyboard.press('Tab'); await p.keyboard.up('Shift'); await sleep(200);
const focus = await p.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return [e.className, c.outlineStyle, c.outlineWidth, c.outlineColor]; });
await p.screenshot({path: `${out}/hover.png`, clip: {x: 80, y: 700, width: 560, height: 140}});
console.log({tilt, tilt0, before, hov, focus, mp4: mp4.length});
// 4) glow pausa fora da tela
await p.evaluate(() => window.scrollTo({top: 3000, behavior: 'instant'})); await sleep(400);
console.log('live fora da tela:', await p.evaluate(() => document.querySelector('.hero').dataset.live), await p.evaluate(() => getComputedStyle(document.querySelector('.hero-glow')).animationPlayState));
await p.close();

// 5) Sem JS
p = await b.newPage(); await p.setViewport({width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1});
await p.setJavaScriptEnabled(false); await p.goto(url, {waitUntil: 'load'}); await sleep(800);
console.log('sem JS: root vazio?', await p.evaluate(() => document.getElementById('root').innerHTML.length));
await p.close();
// 6) JS ligado mas sem IntersectionObserver
p = await b.newPage(); await p.setViewport({width: 1366, height: 860});
await p.evaluateOnNewDocument(() => { delete window.IntersectionObserver; });
await p.goto(url, {waitUntil: 'networkidle0'}); await sleep(500);
console.log('sem IO: elementos ocultos =', await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => !e.classList.contains('in')).length));
await p.close();
// 7) Toque no celular: transform do hero não depende de mouse
p = await b.newPage(); await p.setViewport({width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1});
await p.goto(url, {waitUntil: 'networkidle0'}); await sleep(600);
console.log('mobile scene transform:', await p.evaluate(() => getComputedStyle(document.querySelector('.scene')).transform));
await p.close();
// 8) Movimento reduzido
p = await b.newPage(); await p.setViewport({width: 1366, height: 860});
await p.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
await p.goto(url, {waitUntil: 'domcontentloaded'}); await sleep(60);
await p.screenshot({path: `${out}/reduced-60ms.png`});
await p.mouse.move(1300, 800, {steps: 4}); await sleep(300);
console.log('reduzido: scene', await p.evaluate(() => getComputedStyle(document.querySelector('.scene')).transform), 'anim', await p.evaluate(() => getComputedStyle(document.querySelector('.hv-in')).animationName), await p.evaluate(() => getComputedStyle(document.querySelector('.hero-glow')).animationName));
await b.close();
