/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login} from 'e2e/credentials';
import {expect, test} from 'e2e/fixtures';
import {openCompletedReport} from 'e2e/reports/report-details-helpers';

const getMultipartField = (body: string | null | undefined, field: string) =>
  body?.match(new RegExp(`name="${field}"\\r?\\n\\r?\\n([^\\r\\n]*)`))?.[1];

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
    ).toContainText('Export complete');

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
    ).toContainText('Export complete');

    const activityPopover = page.getByTestId('report-export-activity-popover');
    const popoverBounds = await activityPopover.boundingBox();
    const dismissButtonBounds = await activityPopover
      .getByRole('button', {name: 'Remove from activity'})
      .boundingBox();
    if (!popoverBounds || !dismissButtonBounds) {
      throw new Error('Report export activity controls have no visible bounds');
    }

    expect(dismissButtonBounds.x).toBeGreaterThanOrEqual(popoverBounds.x);
    expect(
      dismissButtonBounds.x + dismissButtonBounds.width,
    ).toBeLessThanOrEqual(popoverBounds.x + popoverBounds.width);
  });

  test('cancels a PDF export and downloads a retry with its own ID', async ({
    page,
  }, testInfo) => {
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
    await reportFormat.click();
    const pdfOption = page.getByRole('option', {name: /PDF/i}).first();
    testInfo.skip(
      (await pdfOption.count()) === 0,
      'No PDF report format is available in the local E2E environment.',
    );
    await pdfOption.click();

    const exportIds = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ];
    const createdExportIds: string[] = [];
    const polledExports: Array<{id: string; status: string}> = [];
    const canceledExportIds: string[] = [];
    const downloadedExportIds: string[] = [];
    const exportStatuses = new Map<string, string>();

    await page.route('**/gmp**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const command =
        request.method() === 'GET'
          ? url.searchParams.get('cmd')
          : getMultipartField(request.postData(), 'cmd');
      const reportExportId =
        request.method() === 'GET'
          ? url.searchParams.get('report_export_id')
          : getMultipartField(request.postData(), 'report_export_id');

      if (command === 'export_scan_report') {
        const exportId =
          exportIds[createdExportIds.length] ?? 'unexpected-export-id';
        createdExportIds.push(exportId);
        exportStatuses.set(exportId, 'running');
        await route.fulfill({
          contentType: 'application/xml',
          body: `<envelope><action_result><report_export_id>${exportId}</report_export_id></action_result></envelope>`,
        });
        return;
      }

      if (command === 'get_report_export' && reportExportId) {
        if (
          reportExportId === exportIds[1] &&
          polledExports.filter(item => item.id === reportExportId).length >= 2
        ) {
          exportStatuses.set(reportExportId, 'done');
        }
        const status = exportStatuses.get(reportExportId) ?? 'error';
        polledExports.push({id: reportExportId, status});
        const exportXml = Array.from(exportStatuses, ([id, exportStatus]) =>
          id === reportExportId
            ? `<report_export id="${id}"><type>scan</type><status>${exportStatus}</status><progress>generating</progress><report id="${reportId}"/><report_format id="pdf-format"/><file_size>0</file_size><content_type>application/pdf</content_type><extension>pdf</extension><error_message></error_message><attempt_count>1</attempt_count></report_export>`
            : '',
        ).join('');
        await route.fulfill({
          contentType: 'application/xml',
          body: `<envelope><get_report_export><get_report_exports_response status="200">${exportXml}</get_report_exports_response></get_report_export></envelope>`,
        });
        return;
      }

      if (command === 'cancel_report_export' && reportExportId) {
        canceledExportIds.push(reportExportId);
        exportStatuses.set(reportExportId, 'canceled');
        await route.fulfill({
          contentType: 'application/xml',
          body: '<envelope><cancel_report_export><cancel_report_export_response status="200" status_text="OK"/></cancel_report_export></envelope>',
        });
        return;
      }

      if (command === 'download_report_export' && reportExportId) {
        downloadedExportIds.push(reportExportId);
        await route.fulfill({
          contentType: 'application/pdf',
          body: Buffer.from('%PDF-1.4\nMock report export\n%%EOF'),
        });
        return;
      }

      await route.continue();
    });

    const reportConfig = dialog.getByRole('textbox').nth(1);
    if (await reportConfig.count()) {
      await reportConfig.click();
      await page.getByRole('option').first().click();
    }
    await dialog.getByTestId('dialog-save-button').click();

    const activityPopover = page.getByTestId('report-export-activity-popover');
    await expect(activityPopover).toContainText('Generating');
    await expect(
      activityPopover.getByText(/Report export:.*\(\.pdf\)$/),
    ).toBeVisible();
    await expect.poll(() => createdExportIds).toEqual([exportIds[0]]);
    await expect
      .poll(() => polledExports.some(item => item.id === exportIds[0]))
      .toBe(true);

    await activityPopover
      .getByRole('button', {name: 'Cancel report export'})
      .click();
    await expect(activityPopover).toContainText('Canceled');
    await expect.poll(() => canceledExportIds).toEqual([exportIds[0]]);
    await expect
      .poll(() =>
        polledExports.some(
          item => item.id === exportIds[0] && item.status === 'canceled',
        ),
      )
      .toBe(true);

    await page.getByTitle('Download filtered Report').click();
    const retryDialog = page.getByRole('dialog');
    await expect(retryDialog).toBeVisible();
    const retryFormat = retryDialog.getByRole('textbox').first();
    await retryFormat.click();
    await page.getByRole('option', {name: /PDF/i}).first().click();
    const downloadPromise = page.waitForEvent('download');
    await retryDialog.getByTestId('dialog-save-button').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBeTruthy();
    await expect(activityPopover).toContainText('Export complete');
    await expect(
      activityPopover.getByText(/Report export:.*\(\.pdf\)$/),
    ).toBeVisible();
    await expect.poll(() => createdExportIds).toEqual(exportIds);
    await expect
      .poll(() => polledExports.some(item => item.id === exportIds[1]))
      .toBe(true);
    expect(
      polledExports.filter(
        item => item.id === exportIds[1] && item.status === 'running',
      ),
    ).toHaveLength(2);
    expect(canceledExportIds).toEqual([exportIds[0]]);
    expect(downloadedExportIds).toEqual([exportIds[1]]);
  });
});
