/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test, type Page} from 'e2e/fixtures';
import {openCompletedReport} from 'e2e/reports/report-details-helpers';

interface ReportTabTest {
  name: string;
  tabName: string;
  emptyMessage?: RegExp;
  supportsEmptyReport?: boolean;
  errorMessage?: RegExp;
}

const reportTabTests: ReportTabTest[] = [
  {
    name: 'Information',
    tabName: 'Information',
  },
  {
    name: 'Results',
    tabName: 'Results',
    emptyMessage: /^The report is empty\./,
    supportsEmptyReport: true,
  },
  {name: 'Hosts', tabName: 'Hosts', emptyMessage: /^No Hosts available$/},
  {name: 'Ports', tabName: 'Ports', emptyMessage: /^No Ports available$/},
  {
    name: 'Applications',
    tabName: 'Applications',
    emptyMessage: /^No Applications available$/,
  },
  {
    name: 'Operating Systems',
    tabName: 'Operating Systems',
    emptyMessage: /^No Operating Systems available$/,
    errorMessage: /^Error while loading Operating Systems for Report/,
  },
  {name: 'CVEs', tabName: 'CVEs', emptyMessage: /^No CVEs available$/},
  {
    name: 'Closed CVEs',
    tabName: 'Closed CVEs',
    emptyMessage: /^No Closed CVEs available$/,
  },
  {
    name: 'TLS Certificates',
    tabName: 'TLS Certificates',
    emptyMessage: /^No TLS Certificates available$/,
  },
  {
    name: 'Error Messages',
    tabName: 'Error Messages',
    emptyMessage: /^No Errors available$/,
  },
  {
    name: 'User Tags',
    tabName: 'User Tags',
  },
];

const assertTabHasLoaded = async (page: Page, tab: ReportTabTest) => {
  const errorMessage = page.getByTestId('error-message');
  let terminalContent =
    tab.tabName === 'Information'
      ? page.getByRole('row', {name: /^Task Name/})
      : tab.tabName === 'User Tags'
        ? page
            .locator('table')
            .filter({
              has: page.locator('th').filter({hasText: /^Name$/}),
            })
            .or(page.getByText('No user tags available'))
        : page.getByTestId('entities-table').or(errorMessage);

  if (tab.emptyMessage) {
    terminalContent = terminalContent.or(page.getByText(tab.emptyMessage));
  }

  if (tab.supportsEmptyReport) {
    terminalContent = terminalContent.or(page.getByTestId('empty-report'));
  }

  if (tab.errorMessage) {
    terminalContent = terminalContent.or(page.getByText(tab.errorMessage));
  }

  await expect(terminalContent).toBeVisible();
  await expect(errorMessage).toHaveCount(0);

  if (tab.errorMessage) {
    await expect(page.getByText(tab.errorMessage)).toHaveCount(0);
  }

  const loading = page.getByTestId('loading');
  await expect(loading).toHaveCount(0);

  await expect(
    page.getByRole('tab', {
      name: new RegExp(`^${tab.tabName}`),
      selected: true,
    }),
  ).toBeVisible();
};

test.describe('report details tabs', () => {
  test('clicks through every tab and checks its data', async ({
    page,
  }, testInfo) => {
    await login(page);
    const reportId = await openCompletedReport(page);

    // The local E2E environment is intentionally not seeded with reports.
    // eslint-disable-next-line vitest/no-disabled-tests
    testInfo.skip(
      !reportId,
      'No standard completed report is available in the local E2E environment.',
    );

    for (const reportTab of reportTabTests) {
      const tab = page.getByRole('tab', {
        name: new RegExp(`^${reportTab.tabName}`),
      });
      await tab.click();
      await assertTabHasLoaded(page, reportTab);
    }
  });
});
