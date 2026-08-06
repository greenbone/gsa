/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, type Page} from '@playwright/test';
import {randomInt} from 'node:crypto';

export const createUniqueTicketNote = () =>
  `e2e-ticket-${Date.now()}-${randomInt(10000)}`;

export const openAvailableResult = async (page: Page) => {
  await page.goto('/results');

  const resultRows = page.getByTestId('result-table-row');
  await expect(resultRows.first()).toBeVisible();

  await resultRows.first().getByTestId('row-details-toggle').click();

  const resultDetailsLink = page
    .locator('a')
    .filter({has: page.getByTitle('Open all details')})
    .first();
  await expect(resultDetailsLink).toBeVisible();

  const href = await resultDetailsLink.getAttribute('href');
  expect(href).toMatch(/^\/result\/[^/?#]+$/);
  await resultDetailsLink.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));

  return new URL(page.url()).pathname.split('/').pop() as string;
};
