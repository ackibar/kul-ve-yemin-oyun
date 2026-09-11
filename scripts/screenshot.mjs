import { chromium } from 'playwright-core';
const OUT = '/tmp/claude-501/-Users-can/51650aa6-4bf1-4ab1-86e3-39d5ee0a1589/scratchpad';
const b = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errs = [];
p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /Yolcu/ }).first().click();
await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/oyun_simdi.png` });
console.log('oyun ici cekildi');
if (errs.length) console.log('KONSOL HATALARI:', errs.slice(0, 5));
await b.close();
