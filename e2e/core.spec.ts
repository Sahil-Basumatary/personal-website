import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('opens the Terminal from the desktop and closes it', async ({ page }) => {
  await page.getByRole('button', { name: 'Terminal', exact: true }).dblclick();

  const title = page.locator('.window-title', { hasText: 'Terminal' });
  await expect(title).toBeVisible();

  await page.getByRole('button', { name: 'Close window' }).click();
  await expect(title).toHaveCount(0);
});

test('runs a terminal command and prints its output', async ({ page }) => {
  await page.getByRole('button', { name: 'Terminal', exact: true }).dblclick();

  const input = page.locator('.terminal-input');
  await input.click();
  await input.fill('whoami');
  await input.press('Enter');

  await expect(page.locator('.terminal-output')).toContainText(
    'Sahil Basumatary'
  );
});

test('keeps two windows stacked and closes the active one', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Terminal', exact: true }).dblclick();
  await page.getByRole('button', { name: 'Contact', exact: true }).dblclick();

  await expect(page.locator('.window')).toHaveCount(2);

  await page.getByRole('button', { name: 'Close window' }).last().click();
  await expect(page.locator('.window')).toHaveCount(1);
});
