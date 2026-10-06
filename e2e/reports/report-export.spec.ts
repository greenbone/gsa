/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';
import {openCompletedReport} from 'e2e/reports/report-details-helpers';

test.describe('report export', () => {
  test('downloads a completed report', async ({page}, testInfo) => {
    await login(page);
    const reportId = await openCompletedReport(page);

    testInfo.skip(
      !reportId,
      'No standard completed report is available in the local E2E environment.',
    );

    await page.getByTitle('Download filtered Report').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const reportFormat = dialog.getByRole('textbox').first();
    await expect(reportFormat).toBeVisible();
    await reportFormat.click();
    await page.getByRole('option').first().click();

    const reportConfig = dialog.getByRole('textbox').nth(1);
    if (await reportConfig.count()) {
      await reportConfig.click();
      await page.getByRole('option').first().click();
    }

    const downloadPromise = page.waitForEvent('download');
    await dialog.getByTestId('dialog-save-button').click();
    const download = await downloadPromise;

    const downloadPath = await download.path();
    expect(download.suggestedFilename()).toBeTruthy();
    expect(downloadPath).toBeTruthy();

    const activityButton = page.getByTestId('report-export-activity-button');
    await expect(activityButton).toBeVisible();
    await expect(activityButton).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByTestId('report-export-activity-popover'),
    ).toContainText('Download started');

    await page.getByRole('link', {name: 'Dashboards'}).click();
    await expect(page).toHaveURL(/\/dashboards/);
    await expect(activityButton).toBeVisible();
    if ((await activityButton.getAttribute('aria-expanded')) !== 'true') {
      await activityButton.click();
    }
    await expect(activityButton).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByTestId('report-export-activity-popover'),
    ).toBeVisible();
    await expect(
      page.getByTestId('report-export-activity-popover'),
    ).toContainText('Download started');

    const activityPopover = page.getByTestId('report-export-activity-popover');
    const popoverBounds = await activityPopover.boundingBox();
    const dismissButtonBounds = await activityPopover
      .getByRole('button', {name: 'Dismiss'})
      .boundingBox();
    if (!popoverBounds || !dismissButtonBounds) {
      throw new Error('Report export activity controls have no visible bounds');
    }

    expect(dismissButtonBounds.x).toBeGreaterThanOrEqual(popoverBounds.x);
    expect(
      dismissButtonBounds.x + dismissButtonBounds.width,
    ).toBeLessThanOrEqual(popoverBounds.x + popoverBounds.width);
  });
});
