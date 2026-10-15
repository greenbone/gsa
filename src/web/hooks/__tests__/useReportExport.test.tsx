/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {act, rendererWith, waitFor} from 'web/testing';
import {focusManager, useQuery} from '@tanstack/react-query';
import {vi} from 'vitest';
import CollectionCounts from 'gmp/collection/collection-counts';
import {filterString} from 'gmp/models/filter/utils';
import {createSession} from 'gmp/testing';
import {
  discoverReportExports,
  REPORT_EXPORT_POLL_INTERVAL,
  reportExportQueryOptions,
} from 'web/hooks/use-query/report-export-queries';
import useReportExport, {
  REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL,
} from 'web/hooks/useReportExports';
import {createReportExportAttemptStore} from 'web/report-export/report-export-attempt-store';
import {
  type ReportExportAttempt,
  createReportExportJob,
  getReportExportActions,
  retainReportExportJobs,
} from 'web/report-export/report-export-job-model';

const onError = testing.fn();

const payload = {
  reportId: 'report-uuid',
  reportFormatId: 'format-uuid',
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
    session: createSession({token: 'test-token', username: 'test-user'}),
    settings: {},
    report: {
      download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
    },
    auditreport: {
      download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
    },
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
      get: testing
        .fn()
        .mockImplementation(
          async ({reportExportId}: {reportExportId: string}) => ({
            data: exports.find(exportItem => exportItem.id === reportExportId),
          }),
        ),
      downloadReportExport: testing
        .fn()
        .mockResolvedValue({data: new ArrayBuffer(8)}),
      cancelReportExport: testing.fn().mockResolvedValue({}),
    },
    reportexports: {
      get: testing.fn().mockResolvedValue({
        data: [],
        meta: {counts: new CollectionCounts({first: 1})},
      }),
    },
  };
};

const changeSession = (
  gmp: ReturnType<typeof createGmp>,
  token?: string,
  username?: string,
) => {
  gmp.session.token = token;
  gmp.session.username = username;
  gmp.session.listener.forEach(listener => listener());
};

describe('report export attempt store', () => {
  const attempt = (
    phase: ReportExportAttempt['phase'] = {stage: 'tracking'},
  ): ReportExportAttempt => ({
    key: 'attempt-1',
    origin: 'local',
    exportId: 'export-1',
    filename: 'report.pdf',
    reportTitle: 'Report',
    autoDownload: true,
    phase,
  });

  test('keeps snapshots stable for rejected and missing transitions', () => {
    const initial = attempt();
    const store = createReportExportAttemptStore([initial]);
    const listener = testing.fn();
    store.subscribe(listener);
    const snapshot = store.getSnapshot();
    expect(store.dispatch({type: 'resume', key: 'missing'})).toBe(false);
    expect(store.dispatch({type: 'handoff', key: initial.key})).toBe(false);
    expect(store.dispatch({type: 'add', attempt: initial})).toBe(false);
    expect(store.getSnapshot()).toBe(snapshot);
    expect(listener).not.toHaveBeenCalled();
  });

  test('claims a transfer synchronously and prevents repeating a completed handoff', () => {
    const initial = attempt();
    const store = createReportExportAttemptStore([initial]);
    expect(store.dispatch({type: 'transfer', key: initial.key})).toBe(true);
    expect(store.dispatch({type: 'transfer', key: initial.key})).toBe(false);
    expect(store.dispatch({type: 'cancel', key: initial.key})).toBe(false);
    expect(initial.phase.stage).toBe('tracking');
    expect(store.dispatch({type: 'handoff', key: initial.key})).toBe(true);
    expect(store.dispatch({type: 'transfer', key: initial.key})).toBe(false);
    expect(store.dispatch({type: 'resume', key: initial.key})).toBe(false);
  });

  test('keeps queued cancellation blocking pickup and retains failures until retry', () => {
    const initial = attempt({stage: 'creating'});
    const store = createReportExportAttemptStore([initial]);
    expect(store.dispatch({type: 'queue-cancel', key: initial.key})).toBe(true);
    expect(
      store.dispatch({type: 'created', key: initial.key, exportId: 'export-2'}),
    ).toBe(true);
    expect(store.dispatch({type: 'transfer', key: initial.key})).toBe(false);
    expect(store.dispatch({type: 'cancel', key: initial.key})).toBe(true);
    const error = new Error('Cancellation denied');
    store.dispatch({type: 'cancel-failed', key: initial.key, error});
    expect(store.getAttempt(initial.key)?.cancelError).toBe(error);
    store.dispatch({type: 'cancel', key: initial.key});
    expect(store.getAttempt(initial.key)?.cancelError).toBeUndefined();
  });

  test('publishes immutable snapshots and unsubscribes listeners', () => {
    const initial = attempt();
    const store = createReportExportAttemptStore([initial]);
    const listener = testing.fn();
    const unsubscribe = store.subscribe(listener);
    const snapshot = store.getSnapshot();
    store.dispatch({type: 'transfer', key: initial.key});
    expect(store.getSnapshot()).not.toBe(snapshot);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.dispatch({type: 'wait', key: initial.key});
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('useReportExport', () => {
  beforeEach(() => testing.clearAllMocks());

  const startParams = {
    kind: 'scan' as const,
    payload,
    filename: 'report.xml',
    reportTitle: 'Test report',
  };

  test('discovers owned active exports without storage and requires explicit download when ready', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exportData('running'),
          owner: {name: 'test-user'},
          extension: 'xml',
        },
        {
          ...exportData('done', 'completed', 'foreign'),
          owner: {name: 'other-user'},
        },
        exportData('done', 'completed', 'unknown-owner'),
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 3,
          length: 3,
          rows: 100,
        }),
      },
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    await waitFor(() => expect(result.current.jobs[0].view.kind).toBe('ready'));
    expect(result.current.jobs[0].autoDownload).toBe(false);
    expect(result.current.jobs[0].origin).toBe('discovered');
    expect(onDownload).not.toHaveBeenCalled();
    act(() => {
      void result.current.download(result.current.jobs[0].key);
    });
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(result.current.jobs[0].view.kind).toBe('complete');
  });

  test('uses refreshed inventory when a previously ready export is running', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const inventoryResponse = (status: string, progress: string) => ({
      data: [
        {
          ...exportData(status, progress),
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    gmp.reportexports.get
      .mockResolvedValueOnce(inventoryResponse('done', 'completed'))
      .mockResolvedValueOnce(inventoryResponse('running', 'generating'));
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('ready'),
    );
    gmp.reportexport.get.mockResolvedValue({
      data: exportData('running', 'generating'),
    });
    act(() => result.current.refreshDiscovery());

    await waitFor(() => expect(gmp.reportexports.get).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('generating'),
    );
  });

  test('discovers unfinished and ready exports after login', async () => {
    const activeExport = exportData('running');
    const gmp = createGmp([activeExport]);
    gmp.session.token = undefined;
    gmp.session.username = undefined;
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...activeExport,
          reportId: payload.reportId,
          owner: {name: 'test-user'},
          extension: 'xml',
        },
        ...Array.from({length: 5}, (_, index) => ({
          ...exportData('done', 'completed', `old-export-${index}`),
          reportId: payload.reportId,
          owner: {name: 'test-user'},
        })),
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 6,
          length: 6,
          rows: 100,
        }),
      },
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    expect(gmp.reportexports.get).not.toHaveBeenCalled();
    act(() => changeSession(gmp, 'new-token', 'test-user'));
    await waitFor(() => expect(result.current.jobs).toHaveLength(6));
    expect(gmp.reportexports.get).toHaveBeenCalledTimes(1);
    const discoveredActiveJob = result.current.jobs.find(
      job => job.exportId === activeExport.id,
    );
    expect(discoveredActiveJob).toMatchObject({
      origin: 'discovered',
      autoDownload: false,
      view: {kind: 'generating'},
    });
    expect(
      result.current.jobs.filter(job => job.view.kind === 'ready'),
    ).toHaveLength(5);
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('dismisses discovered exports for the current session only', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exportData('done', 'completed'),
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('ready'),
    );
    const key = result.current.jobs[0].key;
    act(() => result.current.dismiss(key));
    expect(result.current.jobs).toHaveLength(0);

    act(() => changeSession(gmp));
    expect(result.current.jobs).toHaveLength(0);
    act(() => changeSession(gmp, 'new-token', 'test-user'));
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.jobs[0].view.kind).toBe('ready');
  });

  test('claims explicit downloads before a second click can send another request', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexports.get.mockResolvedValue({
      data: [{...exportData('running'), owner: {name: 'test-user'}}],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    let finishDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finishDownload = resolve;
        }),
    );
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('ready'),
    );
    const key = result.current.jobs[0].key;
    await act(async () => {
      const first = result.current.download(key);
      await result.current.download(key);
      expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
      finishDownload?.({data: new ArrayBuffer(8)});
      await first;
    });
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  test('claims cancellation before a second click can send another request', async () => {
    const gmp = createGmp([exportData('running')]);
    let finishCancellation: (() => void) | undefined;
    gmp.reportexport.cancelReportExport.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          finishCancellation = resolve;
        }),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('generating'),
    );
    const key = result.current.jobs[0].key;
    await act(async () => {
      const first = result.current.cancel(key);
      await result.current.cancel(key);
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1);
      finishCancellation?.();
      await first;
    });
    expect(result.current.jobs[0].view.kind).toBe('cancel-requested');
  });

  test('refreshes discovery on explicit refresh and focus but not on an interval', async () => {
    const gmp = createGmp([]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await waitFor(() => expect(gmp.reportexports.get).toHaveBeenCalledTimes(1));
    vi.useFakeTimers();
    try {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });
      expect(gmp.reportexports.get).toHaveBeenCalledTimes(1);
      await act(async () => {
        result.current.refreshDiscovery();
      });
      expect(gmp.reportexports.get).toHaveBeenCalledTimes(2);
      act(() => focusManager.setFocused(false));
      await act(async () => {
        focusManager.setFocused(true);
      });
      expect(gmp.reportexports.get).toHaveBeenCalledTimes(3);
    } finally {
      focusManager.setFocused(undefined);
      vi.useRealTimers();
    }
  });

  test('uses returned row caps and detects pagination reset', async () => {
    const command = {get: testing.fn()};
    const owned = (id: string) => ({
      id,
      status: 'running',
      owner: {name: 'test-user'},
    });
    command.get
      .mockResolvedValueOnce({
        data: [owned('one'), owned('two')],
        meta: {
          counts: new CollectionCounts({
            first: 1,
            rows: 2,
            length: 2,
            filtered: 3,
          }),
        },
      })
      .mockResolvedValueOnce({
        data: [owned('three')],
        meta: {
          counts: new CollectionCounts({
            first: 3,
            rows: 2,
            length: 1,
            filtered: 3,
          }),
        },
      });
    expect(await discoverReportExports(command, 'test-user')).toMatchObject({
      exports: [owned('one'), owned('two'), owned('three')],
      incomplete: false,
    });
    expect(filterString(command.get.mock.calls[1][0].filter)).toContain(
      'first=3',
    );
    expect(filterString(command.get.mock.calls[0][0].filter)).toContain(
      'owner=test-user',
    );
    command.get.mockReset().mockResolvedValue({
      data: [owned('one'), owned('two')],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          rows: 2,
          length: 2,
          filtered: 3,
        }),
      },
    });
    expect(await discoverReportExports(command, 'test-user')).toMatchObject({
      incomplete: true,
    });
    expect(command.get).toHaveBeenCalledTimes(2);
  });

  test('retries a failed browser handoff using received bytes, not the consumptive endpoint', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn().mockImplementationOnce(() => {
      throw new Error('Browser handoff failed');
    });
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
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
    expect(onDownload).toHaveBeenCalledTimes(2);
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(result.current.jobs[0].view.kind).toBe('complete');
  });

  test('reports a consumed export file without offering a retry', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexport.downloadReportExport.mockRejectedValue(
      Object.assign(new Error('Report export not found'), {status: 404}),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'gone',
      }),
    );
    expect(getReportExportActions(result.current.jobs[0])).toMatchObject({
      retry: false,
      dismiss: true,
    });
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('stops automatic lookup on denied access and allows local removal', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.get.mockRejectedValue(
      Object.assign(new Error('Access denied'), {status: 403}),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'unavailable',
      }),
    );
    expect(result.current.isActive).toBe(false);
    expect(gmp.reportexport.get).toHaveBeenCalledTimes(1);
    act(() => result.current.dismiss(result.current.jobs[0].key));
    expect(result.current.jobs).toHaveLength(0);
  });

  test('merges owner-deduplicated create responses into one local attempt', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid-1'},
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
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
        origin: 'local',
        exportId: `export-${index}`,
        filename: 'report.xml',
        reportTitle: 'Report',
        autoDownload: true,
        phase: {stage: 'handed-off'},
      }),
    );
    const unfinishedJob = createReportExportJob(
      {
        key: 'unfinished',
        origin: 'discovered',
        exportId: 'unfinished-export',
        filename: 'report.xml',
        reportTitle: 'Unfinished',
        autoDownload: false,
        phase: {stage: 'tracking'},
      },
      {
        ...exportData('running', 'generating', 'unfinished-export'),
        progress: 'generating' as const,
        status: 'running' as const,
        type: 'scan',
      },
    );

    const retainedJobs = retainReportExportJobs([
      ...completedJobs,
      unfinishedJob,
    ]);

    expect(retainedJobs).toHaveLength(51);
    expect(retainedJobs).toContain(unfinishedJob);
    expect(retainedJobs).not.toContain(completedJobs[0]);
  });

  test('checks export status more often than it retries a not-ready download', () => {
    expect(REPORT_EXPORT_POLL_INTERVAL).toBe(1000);
    expect(REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL).toBe(3000);
  });

  test('downloads exactly once in the current session when the export is done', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(new ArrayBuffer(8), 'report.xml');
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('rejects a status response for a different export', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.get.mockResolvedValue({
      data: exportData('canceled', 'generating', 'old-export-uuid'),
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

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

  test('stops tracking a missing export and permits explicit retry', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.get
      .mockResolvedValueOnce({
        data: exportData('canceled', 'generating', 'old-export-uuid'),
      })
      .mockResolvedValue({data: exportData('running')});
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });

    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        reason: 'unavailable',
      }),
    );
    expect(gmp.reportexport.get).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.retry(result.current.jobs[0].key);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );
    expect(gmp.reportexport.get.mock.calls.length).toBeGreaterThan(1);
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('the export status query rejects a different ID', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.get.mockResolvedValue({
      data: exportData('running', 'generating', 'wrong-export-uuid'),
    });
    const {renderHook} = rendererWith({gmp});
    const queryOptions = reportExportQueryOptions(
      gmp,
      'test-token',
      'test-user',
      'test-session',
      'export-uuid-1',
    );
    expect(queryOptions.queryKey).toEqual([
      'get_report_export',
      'test-user',
      'test-session',
      'export-uuid-1',
    ]);
    expect(queryOptions.queryKey).not.toContain('test-token');
    const {result} = renderHook(() => useQuery(queryOptions));

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        'Report export is no longer available',
      ),
    );
    expect(result.current.data).toBeUndefined();
  });

  test('retains export creation errors and invokes the error callback', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.exportScanReport.mockRejectedValue(
      new Error('Export creation failed'),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

    await act(async () => {
      expect(await result.current.start(startParams)).toBe(false);
    });

    expect(result.current.jobs[0].view).toMatchObject({
      kind: 'failed',
      error: new Error('Export creation failed'),
    });
    expect(onError).toHaveBeenCalledWith(new Error('Export creation failed'));
  });

  test('retains direct download errors and invokes the error callback', async () => {
    const gmp = createGmp([]);
    gmp.report.download.mockRejectedValue(new Error('Direct download failed'));
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

    act(() => {
      result.current.startDirect({
        kind: 'scan',
        payload,
        filename: 'report.xml',
        reportTitle: 'Test report',
      });
    });

    await waitFor(() =>
      expect(result.current.jobs[0].view).toMatchObject({
        kind: 'failed',
        error: new Error('Direct download failed'),
      }),
    );
    expect(onError).toHaveBeenCalledWith(new Error('Direct download failed'));
  });

  test('dispatches direct downloads to synchronous GMP commands without polling', async () => {
    const gmp = createGmp([]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    const directPayload = {
      reportId: 'report-uuid',
      reportFormatId: 'format-uuid',
      reportConfigId: 'config-uuid',
      deltaReportId: 'delta-uuid',
    };
    const kinds = ['scan', 'delta_scan', 'audit', 'delta_audit'] as const;

    for (const [index, kind] of kinds.entries()) {
      act(() => {
        expect(
          result.current.startDirect({
            kind,
            payload: directPayload,
            filename: `report-${index}.xml`,
            reportTitle: 'Test report',
          }),
        ).toBe(true);
      });
      await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(index + 1));
    }

    await waitFor(() => expect(result.current.jobs).toHaveLength(kinds.length));
    await waitFor(() =>
      expect(
        result.current.jobs.every(job => job.view.kind === 'complete'),
      ).toBe(true),
    );
    expect(result.current.isActive).toBe(false);

    expect(gmp.report.download).toHaveBeenCalledTimes(2);
    expect(gmp.report.download).toHaveBeenCalledWith(
      {id: 'report-uuid'},
      {
        reportFormatId: 'format-uuid',
        reportConfigId: 'config-uuid',
        deltaReportId: 'delta-uuid',
        filter: undefined,
      },
    );
    expect(gmp.auditreport.download).toHaveBeenCalledTimes(2);
    expect(gmp.auditreport.download).toHaveBeenCalledWith(
      {id: 'report-uuid'},
      {
        reportFormatId: 'format-uuid',
        deltaReportId: 'delta-uuid',
        filter: undefined,
      },
    );
    expect(gmp.reportexport.get).not.toHaveBeenCalled();

    const remount = renderHook(() => useReportExport({onError, onDownload}));
    expect(remount.result.current.jobs).toHaveLength(0);
    expect(gmp.report.download).toHaveBeenCalledTimes(2);
    expect(gmp.auditreport.download).toHaveBeenCalledTimes(2);
  });

  test('retries the download when the export file is not ready yet', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexport.downloadReportExport
      .mockRejectedValueOnce(new Error('Report export is not ready'))
      .mockResolvedValue({data: new ArrayBuffer(8)});
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

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

  test('retains the export after handing the file to the browser', async () => {
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
      useReportExport({onError, onDownload: testing.fn()}),
    );

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

  test('sends a queued cancellation after export creation returns its id', async () => {
    const gmp = createGmp([exportData('running')]);
    let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
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
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
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

  test.each([
    ['delta_scan', '/report/delta/report-uuid/delta-uuid'],
    ['delta_audit', '/audit-report/delta/report-uuid/delta-uuid'],
  ])('links discovered %s exports to the delta report', async (type, url) => {
    const gmp = createGmp([]);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exportData('running'),
          type,
          reportId: 'report-uuid',
          deltaReportId: 'delta-uuid',
          owner: {name: 'test-user'},
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

    await waitFor(() => expect(result.current.jobs[0]?.reportUrl).toBe(url));
  });

  test('does not send generation cancellation during a completed-file transfer', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    let resolveDownload: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDownload = resolve;
        }),
    );
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

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
    const gmp = createGmp([exportData('running')]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

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
      expect(result.current.jobs[0].view.kind).toBe('cancel-requested'),
    );
  });

  test('keeps the export active when cancellation is rejected', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexport.cancelReportExport.mockRejectedValue(
      new Error('Unknown command'),
    );
    const onCancelError = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn(), onError: onCancelError}),
    );

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

  test('downloads a same-report retry when GMP reuses the export id', async () => {
    const gmp = createGmp([exportData('running')]);
    let status = 'running';
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid-1'},
    });
    gmp.reportexport.get.mockImplementation(
      async ({reportExportId}: {reportExportId: string}) => ({
        data: {id: reportExportId, status, progress: 'generating'},
      }),
    );
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    const params = {...startParams, reportUrl: '/report/report-uuid'};

    await act(async () => {
      await result.current.start(params);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );
    const canceledJobKey = result.current.jobs[0].key;
    status = 'canceled';

    await act(async () => {
      await result.current.cancel(canceledJobKey);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('canceled'),
    );

    status = 'done';
    await act(async () => {
      await result.current.start(params);
    });

    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(gmp.reportexport.get.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(new ArrayBuffer(8), 'report.xml');
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.jobs[0].view.kind).toBe('complete');
    expect(canceledJobKey).toContain('report-export-');
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
      useReportExport({onError, onDownload: testing.fn()}),
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
    expect(result.current.jobs.map(job => job.view.kind)).toEqual([
      'generating',
      'generating',
      'generating',
      'queued',
    ]);
  });

  test('keeps checking and recovers after transient status failures', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexport.get
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary network error'))
      .mockRejectedValueOnce(new Error('Temporary network error'));
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );

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
    expect(gmp.reportexport.get.mock.calls.length).toBeGreaterThan(1);
    expect(result.current.jobs[0].statusError).toBeUndefined();
  }, 15000);

  test('rediscovers an unfinished export after an unauthorized status response', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exportData('running'),
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    gmp.reportexport.get.mockRejectedValueOnce(
      Object.assign(new Error('Unauthorized'), {status: 401}),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0]?.view).toMatchObject({
        kind: 'failed',
        reason: 'unavailable',
      }),
    );
    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'refreshed-token', 'test-user'));
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('generating'),
    );
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(1);
    expect(result.current.jobs[0].exportId).toBe('export-uuid-1');
    expect(result.current.jobs[0].origin).toBe('discovered');
    expect(result.current.jobs[0].autoDownload).toBe(false);
  });

  test('rediscovers an unfinished export after the hook is remounted', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exportData('running'),
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const firstMount = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await firstMount.result.current.start(startParams);
    });
    await waitFor(() =>
      expect(firstMount.result.current.jobs[0]?.view.kind).toBe('generating'),
    );
    firstMount.unmount();

    const secondMount = renderHook(() =>
      useReportExport({onError, onDownload}),
    );
    await waitFor(() =>
      expect(secondMount.result.current.jobs[0].view.kind).toBe('generating'),
    );
    expect(gmp.reportexport.get).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(secondMount.result.current.jobs[0].filename).toBe(
      'report-export-uuid-1.xml',
    );
    expect(secondMount.result.current.jobs[0].origin).toBe('discovered');
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('does not restore completed activity after login', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
    gmp.reportexport.get
      .mockClear()
      .mockRejectedValue(
        new Error('Failure to receive response from manager daemon'),
      );

    act(() => changeSession(gmp));
    expect(result.current.jobs).toHaveLength(0);
    expect(result.current.isActive).toBe(false);
    act(() => changeSession(gmp, 'new-token', 'test-user'));

    await waitFor(() => expect(gmp.reportexports.get).toHaveBeenCalled());
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.get).not.toHaveBeenCalled();
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  test('rediscovers the same unfinished export after login without creating another', async () => {
    const exports = [exportData('running')];
    const gmp = createGmp(exports);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exports[0],
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('generating'),
    );
    act(() => changeSession(gmp));
    gmp.reportexport.get.mockClear();
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.get).not.toHaveBeenCalled();

    act(() => changeSession(gmp, 'new-token', 'test-user'));
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('generating'),
    );
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(1);
    expect(gmp.reportexport.get).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(result.current.jobs[0].origin).toBe('discovered');
    expect(result.current.jobs[0].autoDownload).toBe(false);
    expect(gmp.reportexport.downloadReportExport).not.toHaveBeenCalled();
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('does not retry or notify when a transfer fails after logout', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    let rejectDownload: ((error: Error) => void) | undefined;
    gmp.reportexport.downloadReportExport.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectDownload = reject;
        }),
    );
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
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
    expect(result.current.startDirect(startParams)).toBe(false);
  });

  test('ignores cancellation that completes after logout', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexports.get.mockResolvedValue({
      data: [
        {
          ...exportData('running'),
          owner: {name: 'test-user'},
          extension: 'xml',
        },
      ],
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 1,
          length: 1,
          rows: 100,
        }),
      },
    });
    let resolveCancellation: ((value: unknown) => void) | undefined;
    gmp.reportexport.cancelReportExport.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCancellation = resolve;
        }),
    );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
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
    act(() => changeSession(gmp, 'refreshed-token', 'test-user'));
    await waitFor(() =>
      expect(result.current.jobs[0]?.view.kind).toBe('generating'),
    );
    await act(async () => {
      resolveCancellation?.({});
      await cancellation;
    });

    expect(result.current.jobs[0].view.kind).toBe('generating');
    expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1);
  });

  test('does not restore another user or completed activity on login', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].view.kind).toBe('complete'),
    );
    gmp.reportexport.get.mockClear();

    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'other-token', 'other-user'));
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.get).not.toHaveBeenCalled();
    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'third-token', 'test-user'));
    await waitFor(() => expect(gmp.reportexports.get).toHaveBeenCalled());
    expect(result.current.jobs).toHaveLength(0);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  test('ignores export creation that completes after logout', async () => {
    const gmp = createGmp([]);
    let resolveCreate: ((response: {data: {id: string}}) => void) | undefined;
    gmp.reportexport.exportScanReport.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
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
    expect(gmp.reportexport.get).not.toHaveBeenCalled();
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
      useReportExport({onError, onDownload: testing.fn()}),
    );
    const csvParams = {
      ...startParams,
      payload: {...payload, reportFormatId: 'csv-format-id'},
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
