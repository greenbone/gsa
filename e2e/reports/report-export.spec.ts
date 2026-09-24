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
  });
});
