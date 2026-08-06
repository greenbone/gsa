/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, type Page} from '@playwright/test';

export const username = process.env.E2E_USERNAME;
export const password = process.env.E2E_PASSWORD;
export const hasCredentials = Boolean(username && password);
export const credentialsRequiredMessage =
  'Set E2E_USERNAME and E2E_PASSWORD in .env.e2e.local or shell environment.';

export const login = async (page: Page) => {
  await page.goto('/login');

  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.getByTestId('login-button');

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

  let loggedIn = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await usernameInput.fill(username as string);
    await passwordInput.fill(password as string);
    await loginButton.click();

    try {
      await expect(page).not.toHaveURL(/\/login(?:$|\?)/, {timeout: 7000});
      loggedIn = true;
      break;
    } catch {
      if (attempt === 1) {
        throw new Error('Login failed after retry');
      }
    }
  }

  expect(loggedIn).toBe(true);
  await expect(page.getByTestId('error')).toHaveCount(0);
};
