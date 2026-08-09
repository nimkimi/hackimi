// Generates src/app/apple-icon.png (180x180) and public/og.png (1200x630)
// from the NH monogram. Rerun after any monogram/palette change:
//   ulimit -n 10240 && node scripts/generate-brand-assets.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const iconSvg = readFileSync(new URL('../src/app/icon.svg', import.meta.url), 'utf8');

const MONOGRAM = `
  <g fill="none" stroke="#C6FF3D" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 100 L20 20 L54 100 L54 20"/>
    <path d="M66 20 L66 100 M66 60 L100 60 M100 20 L100 100"/>
  </g>`;

const ogHtml = `<!doctype html><html><body style="margin:0">
  <div style="width:1200px;height:630px;background:#0E0E10;display:grid;place-items:center">
    <svg viewBox="0 0 120 120" width="380" height="380">${MONOGRAM}</svg>
  </div></body></html>`;

const appleHtml = `<!doctype html><html><body style="margin:0">
  <div style="width:180px;height:180px;display:grid;place-items:center;background:#0E0E10">
    ${iconSvg.replace('<svg ', '<svg width="180" height="180" ')}
  </div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(ogHtml);
await page.locator('div').first().screenshot({ path: 'public/og.png' });

await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(appleHtml);
await page.locator('div').first().screenshot({ path: 'src/app/apple-icon.png' });

await browser.close();
console.log('wrote public/og.png and src/app/apple-icon.png');
