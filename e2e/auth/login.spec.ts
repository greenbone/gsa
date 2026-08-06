/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {expect, test} from '@playwright/test';

const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;

test.describe('local login smoke', () => {
  test.skip(
    !username || !password,
    'Set E2E_USERNAME and E2E_PASSWORD in .env.e2e.local or shell environment.',
  );

  test('logs in and leaves the login page', async ({page}) => {
    await page.goto('/login');

    await page.locator('input[name="username"]').fill(username as string);
    await page.locator('input[name="password"]').fill(password as string);
    await page.getByTestId('login-button').click();

    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
    await expect(page.getByTestId('error')).toHaveCount(0);
  });
});
