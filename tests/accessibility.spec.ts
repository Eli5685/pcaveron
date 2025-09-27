import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Доступность каталога', () => {
  test('основные страницы соответствуют WCAG', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('main')
      .analyze();

    expect(accessibilityScanResults.violations, 'Найдены нарушения доступности на главной странице')
      .toEqual([]);

    await page.goto('/about');
    const aboutResults = await new AxeBuilder({ page })
      .include('body')
      .analyze();

    expect(aboutResults.violations, 'Найдены нарушения доступности на странице "О компании"')
      .toEqual([]);
  });
});
