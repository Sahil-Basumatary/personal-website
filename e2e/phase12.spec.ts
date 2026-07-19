import { test, expect } from '@playwright/test';

test('opens Help coach from the desktop icon', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Help', exact: true }).dblclick();

  const help = page.getByRole('dialog', { name: 'Help' });
  await expect(help).toBeVisible();
  await expect(help.getByRole('heading')).toBeVisible();
  await expect(help.getByRole('button', { name: 'Next' })).toBeVisible();
});

test('opens a project story in SimpleText', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects', exact: true }).dblclick();

  const finder = page.locator('.finder');
  await expect(finder).toBeVisible();

  await finder.locator('.finder-list-row', { hasText: 'pioni' }).dblclick();
  await finder
    .locator('.finder-list-row', { hasText: 'About this project' })
    .dblclick();

  await expect(
    page.locator('.window-title', { hasText: 'About this project' })
  ).toBeVisible();
  await expect(page.locator('.simpletext')).toBeVisible();
  await expect(page.locator('.simpletext-badge')).toContainText('Read-Only');
  await expect(page.locator('.simpletext-prose')).toContainText('Pioni');
});

test('shows contact validation summary when fields are empty', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Contact', exact: true }).dblclick();

  await page.getByRole('button', { name: 'Send' }).click();

  await expect(
    page.getByText(
      /The message could not be sent because of the following problems/
    )
  ).toBeVisible();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
});

test('shows the offline banner when the browser goes offline', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Terminal', exact: true })
  ).toBeVisible();

  await context.setOffline(true);
  await expect(
    page.getByText("You're offline. Showing the last saved portfolio.")
  ).toBeVisible();
});

test('shows Finder-style not found recovery', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');

  await expect(
    page.getByText('The requested item could not be found.')
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to Desktop' })).toBeVisible();
});
