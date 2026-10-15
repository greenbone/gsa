/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {login, username} from 'e2e/credentials';
import {expect, test, type Page} from 'e2e/fixtures';
import {openCompletedReport} from 'e2e/reports/report-details-helpers';

const getMultipartField = (body: string | null | undefined, field: string) =>
  body?.match(new RegExp(`name="${field}"\\r?\\n\\r?\\n([^\\r\\n]*)`))?.[1];

const isolateExportActivity = async (page: Page) => {
  await page.route(
    url => url.searchParams.get('cmd') === 'get_report_exports',
    route =>
      route.fulfill({
        contentType: 'application/xml',
        body: '<envelope><get_report_exports><get_report_exports_response status="200"><report_exports start="1" max="100"/><report_export_count><filtered>0</filtered><page>0</page>0</report_export_count></get_report_exports_response></get_report_exports></envelope>',
      }),
  );
};

test.describe('report export', () => {
  test('verifies the live owner-scoped collection contract', async ({page}) => {
    const responsePromise = page.waitForResponse(response => {
      const url = new URL(response.url());
      return (
        url.pathname.endsWith('/gmp') &&
        url.searchParams.get('cmd') === 'get_report_exports'
      );
    });
    await login(page);
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
    const requestFilter = new URL(response.url()).searchParams.get('filter');
    expect(requestFilter).toContain('owner=');
    expect(requestFilter).toContain('first=1');
    expect(requestFilter).toContain('rows=100');
    const contract = await page.evaluate(
      xml => {
        const document = new DOMParser().parseFromString(
          xml,
          'application/xml',
        );
        const collection = document.querySelector(
          'get_report_exports_response',
        );
        return {
          status: collection?.getAttribute('status'),
          first: collection
            ?.querySelector('report_exports')
            ?.getAttribute('start'),
          count: collection?.querySelector('report_export_count > filtered')
            ?.textContent,
          owners: [
            ...document.querySelectorAll('report_export > owner > name'),
          ].map(owner => owner.textContent),
        };
      },
      await response.text(),
    );
    expect(contract.status).toBe('200');
    expect(contract.first).toBe('1');
    expect(Number(contract.count)).toBeGreaterThanOrEqual(0);
    expect(contract.owners.every(owner => owner === username)).toBe(true);
  });

  test('downloads a completed report', async ({page}, testInfo) => {
    await isolateExportActivity(page);
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
    ).toContainText('Complete');

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
    await page.screenshot({path: testInfo.outputPath('activity-desktop.png')});
    await page.setViewportSize({width: 390, height: 844});
    await expect(activityPopover).toBeVisible();
    const mobileBounds = await activityPopover.boundingBox();
    expect(mobileBounds?.x).toBeGreaterThanOrEqual(0);
    expect(
      (mobileBounds?.x ?? 0) + (mobileBounds?.width ?? 0),
    ).toBeLessThanOrEqual(390);
    await page.screenshot({path: testInfo.outputPath('activity-mobile.png')});
    await activityPopover
      .getByRole('button', {name: 'Close export activity'})
      .click();
    await page.setViewportSize({width: 1280, height: 720});
    await page.getByRole('link', {name: 'Dashboards'}).click();
    await expect(page).toHaveURL(/\/dashboards/);
    if (await activityButton.isVisible()) {
      await activityButton.click();
      await expect(activityPopover).not.toContainText('Complete');
    }
  });

  for (const initialStatus of ['done', 'running']) {
    test(`restores a ${initialStatus} PDF export after logout and login`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60000);
      await isolateExportActivity(page);
      await login(page);
      const reportId = await openCompletedReport(page);
      testInfo.skip(!reportId, 'No standard completed report is available.');

      await page.getByTitle('Download filtered Report').click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('textbox').first().click();
      const pdfOption = page.getByRole('option', {name: /PDF/i}).first();
      testInfo.skip(
        (await pdfOption.count()) === 0,
        'No PDF report format is available.',
      );
      await pdfOption.click();
      const reportConfig = dialog.getByRole('textbox').nth(1);
      if (await reportConfig.count()) {
        await reportConfig.click();
        await page.getByRole('option').first().click();
      }

      const exportId = '44444444-4444-4444-8444-444444444444';
      const createdIds: string[] = [];
      const polledIds: string[] = [];
      const downloadedIds: string[] = [];
      let exportStatus = initialStatus;
      let backendUnavailable = false;
      const downloads: string[] = [];
      page.on('download', download =>
        downloads.push(download.suggestedFilename()),
      );
      await page.route('**/gmp**', async route => {
        const request = route.request();
        const url = new URL(request.url());
        const command =
          request.method() === 'GET'
            ? url.searchParams.get('cmd')
            : getMultipartField(request.postData(), 'cmd');
        const requestedId = url.searchParams.get('report_export_id');
        if (command === 'get_report_exports') {
          await route.fulfill({
            contentType: 'application/xml',
            body: '<envelope><get_report_exports><get_report_exports_response status="200"><report_exports start="1" max="100"/><report_export_count><filtered>0</filtered><page>0</page>0</report_export_count></get_report_exports_response></get_report_exports></envelope>',
          });
          return;
        }
        if (command === 'export_scan_report') {
          createdIds.push(exportId);
          await route.fulfill({
            contentType: 'application/xml',
            body: `<envelope><action_result><report_export_id>${exportId}</report_export_id></action_result></envelope>`,
          });
          return;
        }
        if (command === 'get_report_export') {
          polledIds.push(requestedId ?? 'missing');
          if (backendUnavailable) {
            await route.fulfill({
              status: 500,
              contentType: 'text/plain',
              body: 'Failure to receive response from manager daemon',
            });
          } else {
            await route.fulfill({
              contentType: 'application/xml',
              body: `<envelope><get_report_export><get_report_exports_response status="200"><report_export id="${exportId}"><status>${exportStatus}</status><progress>generating</progress><extension>pdf</extension></report_export></get_report_exports_response></get_report_export></envelope>`,
            });
          }
          return;
        }
        if (command === 'download_report_export') {
          downloadedIds.push(requestedId ?? 'missing');
          await route.fulfill({
            contentType: 'application/pdf',
            body: Buffer.from('%PDF-1.4\nRestored export\n%%EOF'),
          });
          return;
        }
        await route.fallback();
      });

      await dialog.getByTestId('dialog-save-button').click();
      const activity = page.getByTestId('report-export-activity-popover');
      await expect(activity).toContainText(
        initialStatus === 'done' ? 'Complete' : 'Generating',
      );
      await expect.poll(() => createdIds).toEqual([exportId]);
      await page
        .getByText(username as string, {exact: true})
        .first()
        .click();
      await page.getByText('Logout', {exact: true}).click();
      await expect(page).toHaveURL(/\/login/);
      await expect(
        page.getByTestId('report-export-activity-button'),
      ).toHaveCount(0);

      polledIds.length = 0;
      backendUnavailable = initialStatus === 'done';
      exportStatus = 'done';
      const resumedDownload =
        initialStatus === 'running' ? page.waitForEvent('download') : undefined;
      await login(page);
      if (resumedDownload)
        expect(await (await resumedDownload).path()).toBeTruthy();
      const activityButton = page.getByTestId('report-export-activity-button');
      if (initialStatus === 'done') {
        await expect(activityButton).toHaveCount(0);
      } else {
        await expect(activityButton).toBeVisible();
        if ((await activityButton.getAttribute('aria-expanded')) !== 'true')
          await activityButton.click();
        await expect(activity).toContainText('Complete');
        await expect(
          activity.getByText(/Report export:.*\(\.pdf\)$/),
        ).toBeVisible();
        await expect(
          activity.getByRole('link', {name: 'View report details'}),
        ).toHaveAttribute('href', `/report/${reportId}`);
        await expect(
          activity.getByRole('button', {name: 'Remove from activity'}),
        ).toBeVisible();
        await expect(activity).not.toContainText('Checking');
        await expect(activity).not.toContainText('Status check failed');
      }
      expect(createdIds).toEqual([exportId]);
      expect(downloadedIds).toEqual([exportId]);
      expect(downloads).toHaveLength(1);
      if (initialStatus === 'done') expect(polledIds).toHaveLength(0);
      else expect(polledIds).toEqual([exportId]);
    });
  }

  test('cancels a PDF export and downloads a retry with its own ID', async ({
    page,
  }, testInfo) => {
    await isolateExportActivity(page);
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

      await route.fallback();
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
    await expect(activityPopover).toContainText('Complete');
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
