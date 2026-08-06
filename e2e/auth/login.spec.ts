/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {expect, test} from '@playwright/test';
import {
  credentialsRequiredMessage,
  hasCredentials,
  password,
  username,
} from '../credentials';

test.describe('local login smoke', () => {
  test.skip(
    !hasCredentials,
    credentialsRequiredMessage,
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
