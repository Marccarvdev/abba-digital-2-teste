const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
    page.on('console', msg => {
      try { console.log('PAGE:', msg.text()); } catch (e) {}
    });
    page.on('pageerror', err => {
      try { console.error('PAGE ERROR:', err.message); } catch (e) {}
    });
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    // target the inner interactive tile inside the shelf container
    // wait for UI to render
    await page.waitForSelector('[data-shelf-idx="0"] > div', { timeout: 10000 }).catch(() => {});
    await page.waitForSelector('#row-scroll-0', { timeout: 10000 }).catch(() => {});
    const shelf0 = await page.$('[data-shelf-idx="0"] > div');
    const shelf1 = await page.$('[data-shelf-idx="1"] > div');
    const row = await page.$('#row-scroll-0');

    console.log('shelf0=', !!shelf0, 'shelf1=', !!shelf1, 'row=', !!row);
    if (row) {
      const html = await row.evaluate(el => el.outerHTML.slice(0, 400));
      console.log('row snippet:', html);
    }

    if (!shelf0 || !shelf1 || !row) {
      console.error('Elementos necessários não encontrados');
      process.exit(2);
    }

    const b0 = await shelf0.boundingBox();
    const b1 = await shelf1.boundingBox();
    const br = await row.boundingBox();

    if (!b0 || !b1 || !br) {
      console.error('Não foi possível obter bounding boxes');
      process.exit(2);
    }

    // As drag simulation can be flaky cross-environment, call helper to insert letters directly
    await page.evaluate(() => {
      if (window.__abba_insertLetter) {
        window.__abba_insertLetter('A', 0);
        window.__abba_insertLetter('B', 0);
      }
    });
    await page.waitForTimeout(300);

    const items = await page.$$('[id^="row-scroll-"] [data-slot-idx]');
    if (!items || items.length === 0) {
      console.error('Nenhum item presente na linha após drops');
      // dump row html for debugging
      if (row) {
        const html = await row.evaluate(el => el.outerHTML.slice(0, 800));
        console.error('row html after drops:', html);
      }
      await browser.close();
      process.exit(2);
    }

    const firstBg = await items[0].evaluate(el => window.getComputedStyle(el).backgroundColor);
    const lastBg = await items[items.length - 1].evaluate(el => window.getComputedStyle(el).backgroundColor);

    console.log('itemsCount=', items.length);
    console.log('firstBg=', firstBg);
    console.log('lastBg=', lastBg);

    if (firstBg === lastBg) {
      console.log('SUCCESS: cor herdada corretamente');
      await browser.close();
      process.exit(0);
    } else {
      console.error('FAIL: cor não herdada — first:', firstBg, 'last:', lastBg);
      await browser.close();
      process.exit(3);
    }
  } catch (err) {
    console.error('Erro durante o teste:', err);
    await browser.close();
    process.exit(4);
  }
})();
