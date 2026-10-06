/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {act, rendererWith, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import useReportExport from 'web/hooks/useReportExport';

const payload = {
  report_id: 'report-uuid',
  format_id: 'format-uuid',
};

const exportData = (
  status: string,
  progress = 'generating',
  id = 'export-uuid-1',
) => ({
  id,
  status,
  progress,
});

const createGmp = (exports: ReturnType<typeof exportData>[]) => {
  let createCount = 0;
  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    reportexport: {
      exportScanReport: testing
        .fn()
        .mockImplementation(() =>
          Promise.resolve({data: {id: `export-uuid-${++createCount}`}}),
        ),
      exportAuditReport: testing
        .fn()
        .mockResolvedValue({data: {id: 'export-uuid-1'}}),
      exportDeltaScanReport: testing
        .fn()
        .mockResolvedValue({data: {id: 'export-uuid-1'}}),
      exportDeltaAuditReport: testing
        .fn()
        .mockResolvedValue({data: {id: 'export-uuid-1'}}),
      getReportExports: testing
        .fn()
        .mockImplementation(
          async ({reportExportId}: {reportExportId: string}) => ({
            data: [
              exports.find(exportItem => exportItem.id === reportExportId),
            ],
          }),
        ),
      downloadReportExport: testing
        .fn()
        .mockResolvedValue({data: new ArrayBuffer(8)}),
      cancelReportExport: testing.fn().mockResolvedValue({}),
    },
  };
};

describe('useReportExport', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  const startParams = {
    kind: 'scan' as const,
    payload,
    filename: 'report.xml',
    reportTitle: 'Test report',
  };

  test('downloads exactly once when the export is done', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('done'),
    );
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(new ArrayBuffer(8), 'report.xml');
  });

  test('marks download started only after the file is handed to the browser', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    let resolveDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDownload = resolve;
        }),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn()}),
    );

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('done'),
    );
    expect(result.current.jobs[0].downloadStarted).toBe(false);

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    await waitFor(() =>
      expect(result.current.jobs[0].downloadStarted).toBe(true),
    );
  });

  test('cancels an active export', async () => {
    const gmp = createGmp([exportData('running')]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn()}),
    );

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('running'),
    );
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('cancel_requested'),
    );
  });

  test('keeps the export active when cancellation is rejected', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexport.cancelReportExport.mockRejectedValue(
      new Error('Unknown command'),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn()}),
    );

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('running'),
    );

    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });

    expect(result.current.jobs[0].state.status).toBe('running');
    expect(result.current.isActive).toBe(true);
    expect(result.current.jobs[0].cancelError?.message).toBe('Unknown command');
  });

  test('tracks multiple exports independently', async () => {
    const gmp = createGmp([
      exportData('running', 'generating', 'export-uuid-1'),
      exportData('running', 'generating', 'export-uuid-2'),
      exportData('running', 'generating', 'export-uuid-3'),
      exportData('pending', 'queued', 'export-uuid-4'),
    ]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn()}),
    );

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
    expect(result.current.jobs.map(job => job.state.status)).toEqual([
      'running',
      'running',
      'running',
      'pending',
    ]);
  });

  test('keeps checking and recovers after transient status failures', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexport.getReportExports
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary network error'));
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn()}),
    );

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('checking'),
    );
    expect(result.current.isActive).toBe(true);

    await waitFor(
      () => expect(result.current.jobs[0].state.status).toBe('running'),
      {timeout: 10000},
    );
    expect(gmp.reportexport.getReportExports.mock.calls.length).toBeGreaterThan(
      1,
    );
    expect(result.current.jobs[0].statusError).toBeUndefined();
  });

  test('rehydrates an export after the hook is remounted', async () => {
    const gmp = createGmp([exportData('running')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const firstMount = renderHook(() => useReportExport({onDownload}));

    await act(async () => {
      await firstMount.result.current.start(startParams);
    });
    await waitFor(() =>
      expect(window.sessionStorage.getItem('gsa-report-export-jobs')).toContain(
        'export-uuid-1',
      ),
    );
    firstMount.unmount();

    const secondMount = renderHook(() => useReportExport({onDownload}));
    await waitFor(() =>
      expect(secondMount.result.current.jobs[0].state.status).toBe('running'),
    );
    expect(gmp.reportexport.getReportExports).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(secondMount.result.current.jobs[0].filename).toBe('report.xml');
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('uses async commands for non-PDF formats across report types', async () => {
    const gmp = createGmp([]);
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
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn()}),
    );
    const csvParams = {
      ...startParams,
      payload: {...payload, format_id: 'csv-format-id'},
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
        expect.objectContaining({format_id: 'csv-format-id'}),
      );
    }
  });
});
