/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {password, username} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';

test.describe('local login smoke', () => {
  test('logs in and leaves the login page', async ({page}) => {
    await page.goto('/login');

    await page.locator('input[name="username"]').fill(username as string);
    await page.locator('input[name="password"]').fill(password as string);
    await page.getByTestId('login-button').click();

    await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
    await expect(page.getByTestId('error')).toHaveCount(0);
  });
});
