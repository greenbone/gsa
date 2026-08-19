/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {expect, type Page} from '@playwright/test';

const standardReportTabs = [
  'Results',
  'Hosts',
  'Ports',
  'Applications',
  'Operating Systems',
  'CVEs',
  'Closed CVEs',
  'TLS Certificates',
  'Error Messages',
];

const completedReportsFilter = encodeURIComponent(
  'status=Done sort-reverse=date first=1',
);

export const openCompletedReport = async (page: Page) => {
  await page.goto(`/reports?filter=${completedReportsFilter}`);

  const reportTable = page.getByTestId('entities-table');
  const noReportsMessage = page.getByText('No reports available');

  await expect(reportTable.or(noReportsMessage)).toBeVisible();

  if (await noReportsMessage.isVisible()) {
    return undefined;
  }

  const reportRow = reportTable
    .locator('tr')
    .filter({
      has: page.getByTestId('statusbar-text').filter({hasText: /^Done$/}),
    })
    .filter({has: page.locator('a[href^="/report/"]')})
    .first();
  const reportLink = reportRow.locator('a[href^="/report/"]').first();
  const href = await reportLink.getAttribute('href');

  if (!href) {
    return undefined;
  }

  expect(href).toMatch(/^\/report\/[^/?#]+$/);
  await page.goto(href);
  await expect(page).toHaveURL(new RegExp(`${href}$`));

  const hasStandardTabs = await Promise.all(
    standardReportTabs.map(async tabName => {
      try {
        await expect(
          page.getByRole('tab', {name: new RegExp(`^${tabName}`)}),
        ).toBeVisible({timeout: 5000});
        return true;
      } catch {
        return false;
      }
    }),
  );

  if (hasStandardTabs.every(Boolean)) {
    const reportId = href.split('/').pop();
    if (reportId) {
      return reportId;
    }
  }

  return undefined;
};
