import { test, expect } from '@playwright/test';

test('navigates folders in the file explorer', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Macintosh HD', exact: true })
    .dblclick();

  const finder = page.locator('.finder');
  await expect(finder).toBeVisible();
  await expect(
    finder.locator('.finder-list-row', { hasText: 'Applications' })
  ).toBeVisible();

  await finder.locator('.finder-list-row', { hasText: 'Desktop' }).dblclick();
  await expect(
    finder.locator('.finder-list-row', { hasText: 'Projects' })
  ).toBeVisible();
});

test('submits the contact form against a mocked API', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Contact', exact: true }).dblclick();

  await page.getByLabel('Name').fill('Sahil');
  await page.getByLabel('Email').fill('sahil@example.com');
  await page.getByLabel('Subject').fill('Hello from Playwright');
  await page.getByLabel('Message').fill('This is an end-to-end test message.');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Message sent')).toBeVisible();
});

test('opens an app on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Terminal', exact: true }).dblclick();
  await expect(
    page.locator('.window-title', { hasText: 'Terminal' })
  ).toBeVisible();
});
