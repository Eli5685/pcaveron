import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'mobile-360', width: 360, height: 780 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 720 },
  { name: 'desktop-1600', width: 1600, height: 900 },
];

test.describe('Responsive каталог', () => {
  for (const viewport of breakpoints) {
    test(`каталог адаптируется под ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.locator('.products-grid')).toBeVisible();

      const screenshotPath = `screenshots/catalog-${viewport.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
    });
  }
});
