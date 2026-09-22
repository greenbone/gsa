/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';

const compatibilityRoutes = [
  {legacy: '/auditreports', canonical: '/audit-reports'},
  {legacy: '/operatingsystems', canonical: '/operating-systems'},
  {legacy: '/scanconfigs', canonical: '/scan-configs'},
];

const canonicalRoutes = compatibilityRoutes.map(({canonical}) => canonical);

test.describe('canonical routes', () => {
  test.beforeEach(async ({page}) => {
    await login(page);
  });

  for (const route of canonicalRoutes) {
    test(`${route} stays on its canonical URL`, async ({page}) => {
      await page.goto(route);

      await expect(page).toHaveURL(new RegExp(`${route}$`));
      await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
    });
  }
});

test.describe('legacy route redirects', () => {
  test.beforeEach(async ({page}) => {
    await login(page);
  });

  for (const {legacy, canonical} of compatibilityRoutes) {
    test(`${legacy} redirects to ${canonical}`, async ({page}) => {
      await page.goto(legacy);

      await expect(page).toHaveURL(new RegExp(`${canonical}$`));
      await expect(page).not.toHaveURL(/\/login(?:$|\?)/);
    });
  }
});
