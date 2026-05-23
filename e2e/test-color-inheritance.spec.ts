import { test, expect } from '@playwright/test';

test('novo bloco herda cor da linha', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Aguarda shelf e a primeira linha estarem disponíveis
  const shelf0 = page.locator('[data-shelf-idx="0"]');
  const shelf1 = page.locator('[data-shelf-idx="1"]');
  const rowScroll = page.locator('#row-scroll-0');

  await expect(shelf0).toBeVisible();
  await expect(shelf1).toBeVisible();
  await expect(rowScroll).toBeVisible();

  // Se a linha não tiver nenhum bloco, previamente insira um bloco (arraste shelf0)
  // Faz drag do primeiro cubo para a linha
  await shelf0.dragTo(rowScroll);
  await page.waitForTimeout(300);

  // Em seguida arrasta o segundo cubo para a mesma linha
  await shelf1.dragTo(rowScroll);
  await page.waitForTimeout(500);

  const items = page.locator('#row-scroll-0 [data-slot-idx]');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);

  const firstBg = await items.nth(0).evaluate(el => window.getComputedStyle(el).backgroundColor);
  const lastBg = await items.nth(count - 1).evaluate(el => window.getComputedStyle(el).backgroundColor);

  // O último bloco adicionado deve ter a mesma cor (background) do primeiro da linha
  expect(lastBg).toBe(firstBg);
});
