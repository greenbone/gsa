/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, type Page} from '@playwright/test';
import {randomInt} from 'node:crypto';

const openAvailableResult = async (page: Page) => {
  await page.goto('/results');
  await expect(page).not.toHaveURL(/\/login(?:$|\?)/);

  const resultRowToggle = page.getByTestId('row-details-toggle').first();
  await expect(resultRowToggle).toBeVisible({timeout: 15000});
  await resultRowToggle.click();

  const detailsLink = page.locator('a[href^="/result/"]').first();
  await expect(detailsLink).toBeVisible({timeout: 15000});

  const href = await detailsLink.getAttribute('href');
  if (!href) {
    throw new Error('The first result row does not expose a details URL.');
  }

  const resultUrl = new URL(href, 'http://127.0.0.1:8080');
  const resultId = resultUrl.pathname.split('/').pop();
  if (!resultId) {
    throw new Error('The first result details URL does not expose an ID.');
  }

  await detailsLink.click();
  await expect(page).toHaveURL(new RegExp(`/result/${resultId}$`));
  return resultId;
};

const createUniqueTicketNote = () =>
  `Playwright result ticket ${Date.now()}-${randomInt(10000)}`;

const assertCorrespondingTicketsLink = async (page: Page, resultId: string) => {
  const ticketsLink = page.getByTitle('Corresponding Tickets');
  await expect(ticketsLink).toBeVisible();

  const href = await ticketsLink.getAttribute('href');
  expect(href).toBeTruthy();

  const url = new URL(href as string, 'http://127.0.0.1:8080');
  expect(url.pathname).toBe('/tickets');
  expect(url.searchParams.get('filter')).toBe(`result_id=${resultId}`);

  await ticketsLink.click();
  await expect(page).toHaveURL(/\/tickets\?filter=/);
  const currentUrl = new URL(page.url());
  expect(currentUrl.pathname).toBe('/tickets');
  expect(currentUrl.searchParams.get('filter')).toBe(`result_id=${resultId}`);
};

export {
  assertCorrespondingTicketsLink,
  createUniqueTicketNote,
  openAvailableResult,
};
