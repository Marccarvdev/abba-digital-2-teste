const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'load' });

    const shelf0 = await page.$('[data-shelf-idx="0"]');
    const shelf1 = await page.$('[data-shelf-idx="1"]');
    const row = await page.$('#row-scroll-0');

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

    // Drag shelf0 into row
    await page.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2);
    await page.mouse.down();
    await page.mouse.move(br.x + br.width / 2, br.y + br.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Drag shelf1 into row
    await page.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2);
    await page.mouse.down();
    await page.mouse.move(br.x + br.width / 2 + 20, br.y + br.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(600);

    const items = await page.$$('[id^="row-scroll-"] [data-slot-idx]');
    if (!items || items.length === 0) {
      console.error('Nenhum item presente na linha após drops');
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
