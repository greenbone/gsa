/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {act, rendererWith, waitFor} from 'web/testing';
import {
  changeSession,
  createGmp,
  exportData,
  exportPayload,
  ownedExportData,
} from 'web/report-export/__fixtures__/report-export-mocks';
import {
  createReportExportJob,
  getReportExportActions,
  retainReportExportJobs,
} from 'web/report-export/report-export-job-model';
import useReportExport, {
  REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL,
} from 'web/report-export/useReportExports';

const onError = testing.fn();

describe('useReportExport', () => {
  beforeEach(() => testing.clearAllMocks());

  const startParams = {
    kind: 'scan' as const,
    payload: exportPayload,
    filename: 'report.xml',
    reportTitle: 'Test report',
  };

  const renderReportExport = (
    gmp: ReturnType<typeof createGmp>,
    callbacks?: {onDownload?: typeof onError; onError?: typeof onError},
  ) =>
    rendererWith({gmp}).renderHook(() =>
      useReportExport({onError, onDownload: testing.fn(), ...callbacks}),
    );

  test('tracks a started export via status polling until it auto-downloads', async () => {
    const gmp = createGmp([ownedExportData('running')]);
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );
    expect(gmp.reportexport.get).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });

    gmp.inventory.exports[0] = ownedExportData('done', 'completed');
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1), {
      timeout: 7000,
    });
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
  });

  test('stops polling the status once the export is done', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    const callsAfterDone = gmp.reportexport.get.mock.calls.length;
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(gmp.reportexport.get.mock.calls.length).toBe(callsAfterDone);
    expect(result.current.jobs[0].view.kind).toBe('complete');
  });

  test('never requests the report export list', async () => {
    const gmp = createGmp();
    const {result} = renderReportExport(gmp);
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(gmp.reportexport.get).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  test('retries a failed browser handoff by re-downloading from gvmd', async () => {
    // gvmd retains the generated file, so a retry downloads it again
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    const onDownload = testing.fn().mockImplementationOnce(() => {
      throw new Error('Browser handoff failed');
    });
    const {result} = renderReportExport(gmp, {onDownload});
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'download',
        error: new Error('Browser handoff failed'),
      }),
    );
    await act(async () => {
      await result.current.retry(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(2);
    expect(onDownload).toHaveBeenCalledTimes(2);
    expect(result.current.jobs[0].view.kind).toBe('complete');
  });

  test('does not auto-retry a permanently rejected download', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    gmp.reportexport.downloadReportExport.mockRejectedValue(
      Object.assign(new Error('Access denied'), {status: 403}),
    );
    const {result} = renderReportExport(gmp);
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'unavailable',
      }),
    );
    expect(getReportExportActions(result.current.jobs[0])).toMatchObject({
      retry: true,
      dismiss: true,
    });
    // a permanent rejection is not followed by the automatic retry
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('merges identical create responses into one tracked export', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid-1'},
    });
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});
    await act(async () => {
      await Promise.all([
        result.current.start(startParams),
        result.current.start(startParams),
      ]);
    });
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('bounds completed activity while retaining unfinished jobs', () => {
    const completedJobs = Array.from({length: 60}, (_, index) =>
      createReportExportJob({
        key: `receipt-${index}`,
        exportId: `export-${index}`,
        filename: 'report.xml',
        reportTitle: 'Report',
        downloaded: true,
      }),
    );
    const unfinishedJob = createReportExportJob(
      {
        key: 'unfinished',
        exportId: 'unfinished-export',
        filename: 'report.xml',
        reportTitle: 'Unfinished',
      },
      exportData('running', 'generating', 'unfinished-export') as never,
    );

    const retainedJobs = retainReportExportJobs([
      ...completedJobs,
      unfinishedJob,
    ]);

    expect(retainedJobs).toHaveLength(51);
    expect(retainedJobs).toContain(unfinishedJob);
    expect(retainedJobs).not.toContain(completedJobs[0]);
  });

  test('retries a not-ready download later than the status poll interval', () => {
    expect(REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL).toBe(3000);
  });

  test('fails when the export cannot be found by the status query', async () => {
    const gmp = createGmp();
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});

    await act(async () => {
      await result.current.start(startParams);
    });

    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'unavailable',
      }),
    );
    expect(onDownload).not.toHaveBeenCalled();
    expect(gmp.reportexport.downloadReportExport).not.toHaveBeenCalled();
  });

  test('retains export creation errors and invokes the error callback', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.exportScanReport.mockRejectedValue(
      new Error('Export creation failed'),
    );
    const {result} = renderReportExport(gmp);

    await act(async () => {
      expect(await result.current.start(startParams)).toBe(false);
    });

    expect(result.current.jobs[0].view).toMatchObject({
      kind: 'failed',
      error: new Error('Export creation failed'),
    });
    expect(onError).toHaveBeenCalledWith(new Error('Export creation failed'));
  });

  test('retries the download once when the export file is not ready yet', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    gmp.reportexport.downloadReportExport
      .mockRejectedValueOnce(new Error('Report export is not ready'))
      .mockResolvedValue({data: new ArrayBuffer(8)});
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(
      () =>
        expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(2),
      {timeout: 7000},
    );

    expect(onDownload).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
    expect(result.current.jobs).toHaveLength(1);
  }, 10000);

  test('surfaces the manual retry action after a second failed download attempt', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    gmp.reportexport.downloadReportExport
      .mockRejectedValueOnce(new Error('Report export is not ready'))
      .mockRejectedValue(new Error('Report export is not ready'));
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(
      () =>
        expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(2),
      {timeout: 7000},
    );
    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'download',
      }),
    );
    expect(getReportExportActions(result.current.jobs[0])).toMatchObject({
      retry: true,
      dismiss: true,
    });
    expect(onError).toHaveBeenCalledWith(
      new Error('Report export is not ready'),
    );

    gmp.reportexport.downloadReportExport.mockResolvedValue({
      data: new ArrayBuffer(8),
    });
    await act(async () => {
      await result.current.retry(result.current.jobs[0].key);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
  }, 10000);

  test('retains the export after handing the file to the browser', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    let resolveDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDownload = resolve;
        }),
    );
    const {result} = renderReportExport(gmp);

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.jobs[0].view.kind).toBe('downloading');
    expect(result.current.isActive).toBe(true);

    act(() => result.current.dismiss(result.current.jobs[0].key));
    expect(result.current.jobs).toHaveLength(1);

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.isActive).toBe(false);

    act(() => result.current.dismiss(result.current.jobs[0].key));
    await waitFor(() => expect(result.current.jobs).toHaveLength(0));
  });

  test('cancels an export while its status is still being checked', async () => {
    const gmp = createGmp();
    // the first status response is deferred
    let resolveStatus: ((response: {data: unknown}) => void) | undefined;
    gmp.reportexport.get.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveStatus = resolve;
        }),
    );
    const {result} = renderReportExport(gmp);

    await act(async () => {
      await result.current.start(startParams);
    });
    // bound but the status has not arrived yet
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('checking'),
    );
    expect(getReportExportActions(result.current.jobs[0])).toMatchObject({
      cancel: true,
      dismiss: true,
    });

    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });

    // the status arrives after the cancellation request
    resolveStatus?.({data: ownedExportData('cancel_requested')});
    await waitFor(
      () => expect(result.current.jobs[0].view.kind).toBe('canceling'),
      {timeout: 7000},
    );
  }, 15000);

  test('sends a queued cancellation after export creation returns its id', async () => {
    const gmp = createGmp([ownedExportData('running')]);
    let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
    const {result} = renderReportExport(gmp);
    let startPromise: Promise<boolean>;

    act(() => {
      startPromise = result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('creating'),
    );
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).not.toHaveBeenCalled();
    expect(result.current.jobs[0].view.kind).toBe('canceling');

    await act(async () => {
      resolveCreate?.({data: {id: 'export-uuid-1'}});
      await startPromise;
    });

    await waitFor(() =>
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledWith({
        reportExportId: 'export-uuid-1',
      }),
    );
  });

  test('drops a queued cancellation when export creation fails', async () => {
    const gmp = createGmp([]);
    let rejectCreate: ((error: Error) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectCreate = reject;
        }),
    );
    const {result} = renderReportExport(gmp);
    let startPromise: Promise<boolean>;

    act(() => {
      startPromise = result.current.start(startParams);
    });
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(result.current.jobs[0].view.kind).toBe('canceling');

    await act(async () => {
      rejectCreate?.(new Error('Export creation failed'));
      await startPromise;
    });

    expect(result.current.jobs[0].view).toMatchObject({
      kind: 'failed',
      reason: 'export',
    });
    expect(gmp.reportexport.cancelReportExport).not.toHaveBeenCalled();
  });

  test('does not send generation cancellation during a completed-file transfer', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    let resolveDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDownload = resolve;
        }),
    );
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('downloading'),
    );
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).not.toHaveBeenCalled();

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(result.current.jobs[0].view.kind).toBe('complete');
  });

  test('cancels an active export', async () => {
    const gmp = createGmp([ownedExportData('running')]);
    gmp.reportexport.cancelReportExport.mockImplementationOnce(async () => {
      gmp.inventory.exports[0] = ownedExportData('cancel_requested');
      return {};
    });
    const {result} = renderReportExport(gmp);

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('canceling'),
    );

    gmp.inventory.exports[0] = ownedExportData('canceled');
    await waitFor(
      () => expect(result.current.jobs[0].view.kind).toBe('canceled'),
      {timeout: 7000},
    );
    expect(getReportExportActions(result.current.jobs[0])).toMatchObject({
      dismiss: true,
      cancel: false,
    });
  });

  test('keeps the export active when cancellation is rejected', async () => {
    const gmp = createGmp([ownedExportData('running')]);
    gmp.reportexport.cancelReportExport.mockRejectedValue(
      new Error('Unknown command'),
    );
    const onCancelError = testing.fn();
    const {result} = renderReportExport(gmp, {onError: onCancelError});

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );

    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });

    expect(result.current.jobs[0].view.kind).toBe('generating');
    expect(result.current.isActive).toBe(true);
    expect(result.current.jobs[0].cancelError?.message).toBe('Unknown command');
    expect(onCancelError).toHaveBeenCalledWith(new Error('Unknown command'));
  });

  test('re-exports a canceled report with a fresh export id', async () => {
    // gvmd only reuses pending/running exports; a canceled export always
    // gets a new row
    const gmp = createGmp();
    let status1 = 'running';
    let status2 = 'running';
    let createCount = 0;
    gmp.reportexport.exportScanReport.mockImplementation(async () => {
      createCount += 1;
      return {data: {id: `export-uuid-${createCount}`}};
    });
    gmp.reportexport.get.mockImplementation(
      async ({reportExportId}: {reportExportId: string}) => ({
        data: ownedExportData(
          reportExportId === 'export-uuid-1' ? status1 : status2,
          'generating',
          reportExportId,
        ),
      }),
    );
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});
    const params = {...startParams, reportUrl: '/report/report-uuid'};

    await act(async () => {
      await result.current.start(params);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );
    const canceledJobKey = result.current.jobs[0].key;
    status1 = 'canceled';

    await act(async () => {
      await result.current.cancel(canceledJobKey);
    });
    await waitFor(
      () => expect(result.current.jobs[0].view.kind).toBe('canceled'),
      {timeout: 7000},
    );

    await act(async () => {
      await result.current.start(params);
    });

    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(2);
    expect(canceledJobKey).toContain('report-export-');
    status2 = 'done';
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1), {
      timeout: 7000,
    });
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(
      new ArrayBuffer(8),
      'report.xml',
      undefined,
    );
    const completedJob = result.current.jobs.find(
      job => job.exportId === 'export-uuid-2',
    );
    expect(completedJob?.view.kind).toBe('complete');
  }, 20000);

  test('tracks multiple exports independently', async () => {
    const gmp = createGmp([
      exportData('running', 'generating', 'export-uuid-1'),
      exportData('running', 'generating', 'export-uuid-2'),
      exportData('running', 'generating', 'export-uuid-3'),
      exportData('pending', 'queued', 'export-uuid-4'),
    ]);
    const {result} = renderReportExport(gmp);

    await act(async () => {
      await Promise.all([
        result.current.start(startParams),
        result.current.start(startParams),
        result.current.start(startParams),
        result.current.start(startParams),
      ]);
    });

    await waitFor(() => expect(result.current.jobs).toHaveLength(4));
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(4);
    expect(result.current.jobs.map(job => job.view.kind)).toEqual([
      'generating',
      'generating',
      'generating',
      'queued',
    ]);
  });

  test('keeps checking and recovers after transient status failures', async () => {
    const gmp = createGmp([ownedExportData('running')]);
    gmp.reportexport.get
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary network error'));
    const {result} = renderReportExport(gmp);

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('checking'),
    );
    expect(result.current.isActive).toBe(true);

    await waitFor(
      () => expect(result.current.jobs[0].view.kind).toBe('generating'),
      {timeout: 10000},
    );
    expect(gmp.reportexport.get.mock.calls.length).toBeGreaterThan(3);
  }, 15000);

  test('does not retry or notify when a transfer fails after logout', async () => {
    const gmp = createGmp([ownedExportData('done', 'completed')]);
    let rejectDownload: ((error: Error) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectDownload = reject;
        }),
    );
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1),
    );
    act(() => changeSession(gmp));
    await act(async () => {
      rejectDownload?.(new Error('Session ended'));
    });
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(onDownload).not.toHaveBeenCalled();
    expect(await result.current.start(startParams)).toBe(false);
  });

  test('ignores cancellation that completes after logout', async () => {
    const gmp = createGmp([ownedExportData('running')]);
    let resolveCancellation: ((value: unknown) => void) | undefined;
    gmp.reportexport.cancelReportExport.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCancellation = resolve;
        }),
    );
    const {result} = renderReportExport(gmp);
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('generating'),
    );

    let cancellation: Promise<void> | undefined;
    act(() => {
      cancellation = result.current.cancel(result.current.jobs[0].key);
    });
    await waitFor(() =>
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1),
    );
    act(() => changeSession(gmp));
    expect(result.current.jobs).toHaveLength(0);
    await act(async () => {
      resolveCancellation?.({});
      await cancellation;
    });

    // the cancellation completes after logout and must not affect anything
    expect(result.current.jobs).toHaveLength(0);
    expect(result.current.isActive).toBe(false);
    expect(onError).not.toHaveBeenCalled();
    act(() => changeSession(gmp, 'refreshed-token', 'test-user'));
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1);
  });

  test('ignores export creation that completes after logout', async () => {
    const gmp = createGmp();
    let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
    const onDownload = testing.fn();
    const {result} = renderReportExport(gmp, {onDownload});
    let creation: Promise<boolean> | undefined;
    act(() => {
      creation = result.current.start(startParams);
    });
    await waitFor(() =>
      expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(1),
    );
    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'other-token', 'other-user'));
    await act(async () => {
      resolveCreate?.({data: {id: 'old-export'}});
      expect(await creation).toBe(false);
    });
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.downloadReportExport).not.toHaveBeenCalled();
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('uses async commands for non-PDF formats across report types', async () => {
    const gmp = createGmp();
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'scan-export'},
    });
    gmp.reportexport.exportAuditReport.mockResolvedValue({
      data: {id: 'audit-export'},
    });
    gmp.reportexport.exportDeltaScanReport.mockResolvedValue({
      data: {id: 'delta-scan-export'},
    });
    gmp.reportexport.exportDeltaAuditReport.mockResolvedValue({
      data: {id: 'delta-audit-export'},
    });
    const {result} = renderReportExport(gmp);
    const csvParams = {
      ...startParams,
      payload: {...exportPayload, reportFormatId: 'csv-format-id'},
    };

    await act(async () => {
      await Promise.all([
        result.current.start({...csvParams, kind: 'scan'}),
        result.current.start({...csvParams, kind: 'audit'}),
        result.current.start({...csvParams, kind: 'delta_scan'}),
        result.current.start({...csvParams, kind: 'delta_audit'}),
      ]);
    });

    for (const command of [
      gmp.reportexport.exportScanReport,
      gmp.reportexport.exportAuditReport,
      gmp.reportexport.exportDeltaScanReport,
      gmp.reportexport.exportDeltaAuditReport,
    ]) {
      expect(command).toHaveBeenCalledWith(
        expect.objectContaining({reportFormatId: 'csv-format-id'}),
      );
    }
  });
});
