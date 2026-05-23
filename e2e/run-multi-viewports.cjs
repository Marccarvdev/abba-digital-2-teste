const { chromium } = require('playwright');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
];

(async () => {
  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      page.on('console', msg => { try { console.log(`[PAGE ${vp.name}]`, msg.text()); } catch (e) {} });
      page.on('pageerror', err => { try { console.error(`[PAGE ${vp.name} ERROR]`, err.message); } catch (e) {} });

      console.log('Loading app at viewport', vp.name);
      await page.goto('http://localhost:3000', { waitUntil: 'load' });

      // wait for helper
      await page.waitForTimeout(300);

      // Clear row by clicking clear button if exists
      try {
        await page.evaluate(() => { if (window.__abba_clearAll) { window.__abba_clearAll(); } });
      } catch (e) {}

      // Wait for helper to be available and use it to insert two letters into row 0
      try {
        await page.waitForFunction(() => !!window.__abba_insertLetter, { timeout: 5000 });
        await page.evaluate(() => {
          window.__abba_insertLetter('X', 0);
          window.__abba_insertLetter('Y', 0);
        });
      } catch (e) {
        console.error(`[WARN ${vp.name}] helper __abba_insertLetter not available`);
      }

      await page.waitForTimeout(300);

      const items = await page.$$('[id^="row-scroll-"] [data-slot-idx]');
      console.log(`[RESULT ${vp.name}] itemsCount=`, items.length);

      if (!items || items.length < 2) {
        console.error(`[FAIL ${vp.name}] itens insuficientes na linha`);
        await context.close();
        await browser.close();
        process.exit(2);
      }

      const firstBg = await items[0].evaluate(el => window.getComputedStyle(el).backgroundColor);
      const lastBg = await items[items.length - 1].evaluate(el => window.getComputedStyle(el).backgroundColor);
      console.log(`[CHECK ${vp.name}] firstBg=`, firstBg, 'lastBg=', lastBg);

      if (firstBg !== lastBg) {
        console.error(`[FAIL ${vp.name}] cor não herdada`);
        await context.close();
        await browser.close();
        process.exit(3);
      }

      await context.close();
      console.log(`[PASS ${vp.name}]`);
    }

    console.log('All viewports passed');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Erro during multi-viewport run:', err);
    await browser.close();
    process.exit(4);
  }
})();
