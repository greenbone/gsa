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
} from 'web/hooks/use-query/report-exports';
import useReportExport, {
  REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL,
} from 'web/hooks/useReportExport';
import {type ExportAttempt} from 'web/report-export/job';
import {readExportIntents, writeExportIntents} from 'web/report-export/storage';
import {createExportAttemptStore} from 'web/report-export/store';

const onError = testing.fn();

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
    session: createSession({token: 'test-token', username: 'test-user'}),
    settings: {},
    report: {
      download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
    },
    auditreport: {
      download: testing.fn().mockResolvedValue({data: new ArrayBuffer(8)}),
    },
    reportexport: {
      getReportExports: testing.fn().mockResolvedValue({
        data: [],
        meta: {counts: new CollectionCounts({first: 1})},
      }),
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
      getReportExport: testing
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

const changeSession = (
  gmp: ReturnType<typeof createGmp>,
  token?: string,
  username?: string,
) => {
  gmp.session.token = token;
  gmp.session.username = username;
  gmp.session.listener.forEach(listener => listener());
};

describe('export attempt store', () => {
  const attempt = (
    phase: ExportAttempt['phase'] = {stage: 'tracking'},
  ): ExportAttempt => ({
    key: 'attempt-1',
    origin: 'local',
    exportId: 'export-1',
    filename: 'report.pdf',
    reportTitle: 'Report',
    autoDownload: true,
    disposition: 'awaiting',
    phase,
  });

  test('keeps snapshots stable for rejected and missing transitions', () => {
    const initial = attempt();
    const store = createExportAttemptStore([initial]);
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
    const store = createExportAttemptStore([initial]);
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
    const store = createExportAttemptStore([initial]);
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
    const store = createExportAttemptStore([initial]);
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

describe('export intent storage', () => {
  beforeEach(() => window.sessionStorage.clear());

  test('migrates legacy origin once at the storage boundary and preserves explicit origin', () => {
    const intent = {
      exportId: 'export-1',
      filename: 'report.pdf',
      reportTitle: 'Report',
      autoDownload: true,
      disposition: 'awaiting',
    };
    window.sessionStorage.setItem(
      'gsa-report-export-jobs:test-user',
      JSON.stringify([
        {...intent, key: 'legacy-local'},
        {...intent, key: 'recovered-export-2', exportId: 'export-2'},
        {
          ...intent,
          key: 'recovered-export-3',
          exportId: 'export-3',
          origin: 'local',
        },
        {...intent, key: 'invalid', exportId: 'export-4', origin: 'invalid'},
      ]),
    );
    const intents = readExportIntents('test-user');
    expect(intents.map(item => item.origin)).toEqual([
      'local',
      'discovered',
      'local',
    ]);
    writeExportIntents('test-user', intents);
    expect(readExportIntents('test-user')).toEqual(intents);
    expect(
      JSON.parse(
        window.sessionStorage.getItem('gsa-report-export-jobs:test-user') ??
          '[]',
      ),
    ).toHaveLength(3);
  });
});

describe('useReportExport', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    window.sessionStorage.clear();
  });

  const startParams = {
    kind: 'scan' as const,
    payload,
    filename: 'report.xml',
    reportTitle: 'Test report',
  };

  test('discovers owned active exports without storage and requires explicit download when ready', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexport.getReportExports.mockResolvedValue({
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
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('done'),
    );
    expect(result.current.jobs[0].autoDownload).toBe(false);
    expect(result.current.jobs[0].origin).toBe('discovered');
    expect(onDownload).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.download(result.current.jobs[0].key);
    });
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(result.current.jobs[0].downloadStarted).toBe(true);
  });

  test('restores one unfinished export after login without adding old ready exports', async () => {
    const activeExport = exportData('running');
    const gmp = createGmp([activeExport]);
    gmp.reportexport.getReportExports.mockResolvedValue({
      data: Array.from({length: 5}, (_, index) => ({
        ...exportData('done', 'completed', `old-export-${index}`),
        reportId: payload.report_id,
        owner: {name: 'test-user'},
      })),
      meta: {
        counts: new CollectionCounts({
          first: 1,
          filtered: 5,
          length: 5,
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
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('running'),
    );
    act(() => changeSession(gmp));
    await waitFor(() => expect(result.current.jobs).toHaveLength(0));
    activeExport.status = 'done';
    act(() => changeSession(gmp, 'new-token', 'test-user'));
    await waitFor(() =>
      expect(gmp.reportexport.getReportExports).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].exportId).toBe(activeExport.id);
    expect(result.current.jobs[0].downloadStarted).toBe(true);
  });

  test('claims explicit downloads before a second click can send another request', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexport.getReportExports.mockResolvedValue({
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
      expect(result.current.jobs[0]?.state.status).toBe('done'),
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
      expect(result.current.jobs[0]?.state.status).toBe('running'),
    );
    const key = result.current.jobs[0].key;
    await act(async () => {
      const first = result.current.cancel(key);
      await result.current.cancel(key);
      expect(gmp.reportexport.cancelReportExport).toHaveBeenCalledTimes(1);
      finishCancellation?.();
      await first;
    });
    expect(result.current.jobs[0].state.status).toBe('cancel_requested');
  });

  test('refreshes discovery on explicit refresh and focus but not on an interval', async () => {
    const gmp = createGmp([]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await waitFor(() =>
      expect(gmp.reportexport.getReportExports).toHaveBeenCalledTimes(1),
    );
    vi.useFakeTimers();
    try {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });
      expect(gmp.reportexport.getReportExports).toHaveBeenCalledTimes(1);
      await act(async () => {
        result.current.refreshDiscovery();
      });
      expect(gmp.reportexport.getReportExports).toHaveBeenCalledTimes(2);
      act(() => focusManager.setFocused(false));
      await act(async () => {
        focusManager.setFocused(true);
      });
      expect(gmp.reportexport.getReportExports).toHaveBeenCalledTimes(3);
    } finally {
      focusManager.setFocused(undefined);
      vi.useRealTimers();
    }
  });

  test('uses returned row caps and detects pagination reset', async () => {
    const command = {getReportExports: testing.fn()};
    const owned = (id: string) => ({
      id,
      status: 'running',
      owner: {name: 'test-user'},
    });
    command.getReportExports
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
    expect(
      filterString(command.getReportExports.mock.calls[1][0].filter),
    ).toContain('first=3');
    expect(
      filterString(command.getReportExports.mock.calls[0][0].filter),
    ).toContain('owner=test-user');
    command.getReportExports.mockReset().mockResolvedValue({
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
    expect(command.getReportExports).toHaveBeenCalledTimes(2);
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
      expect(result.current.jobs[0].downloadError?.message).toBe(
        'Browser handoff failed',
      ),
    );
    await act(async () => {
      await result.current.retry(result.current.jobs[0].key);
    });
    expect(onDownload).toHaveBeenCalledTimes(2);
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(result.current.jobs[0].downloadStarted).toBe(true);
  });

  test('stops automatic lookup on denied access and allows local removal', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.getReportExport.mockRejectedValue(
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
      expect(result.current.jobs[0].state.status).toBe('unavailable'),
    );
    expect(result.current.isActive).toBe(false);
    expect(gmp.reportexport.getReportExport).toHaveBeenCalledTimes(1);
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

  test('bounds receipts without dropping unfinished intents or persisting live state', async () => {
    const receipts = Array.from({length: 60}, (_, index) => ({
      key: `receipt-${index}`,
      exportId: `export-${index}`,
      filename: 'report.xml',
      reportTitle: 'Report',
      downloadStarted: true,
    }));
    window.sessionStorage.setItem(
      'gsa-report-export-jobs:test-user',
      JSON.stringify([
        ...receipts,
        {
          key: 'unfinished',
          exportId: 'unfinished-export',
          filename: 'custom.xml',
          reportTitle: 'Unfinished',
        },
      ]),
    );
    const gmp = createGmp([
      exportData('running', 'generating', 'unfinished-export'),
    ]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    await waitFor(() => expect(result.current.jobs).toHaveLength(51));
    expect(
      result.current.jobs.find(job => job.key === 'unfinished')?.filename,
    ).toBe('custom.xml');
    const ledger = JSON.parse(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user') ?? '[]',
    );
    expect(ledger).toHaveLength(51);
    expect(
      ledger.every(
        (intent: Record<string, unknown>) =>
          !('phase' in intent) &&
          !('state' in intent) &&
          !('cancelPending' in intent),
      ),
    ).toBe(true);
  });

  test('checks export status more often than it retries a not-ready download', () => {
    expect(REPORT_EXPORT_POLL_INTERVAL).toBe(500);
    expect(REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL).toBe(3000);
  });

  test('downloads exactly once when the export is done', async () => {
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
      expect(result.current.jobs[0].downloadStarted).toBe(true),
    );
    expect(result.current.jobs[0].downloadPending).toBe(false);
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
    ).toContain('export-uuid-1');

    const remount = renderHook(() => useReportExport({onError, onDownload}));
    await waitFor(() => expect(remount.result.current.jobs).toHaveLength(1));
    expect(remount.result.current.jobs[0].downloadStarted).toBe(true);
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
  });

  test('downloads the requested export when a canceled export is listed first', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [
        exportData('canceled', 'generating', 'old-export-uuid'),
        exportData('done', 'completed'),
      ],
    });
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });

    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(result.current.jobs[0].state.status).toBe('done');
  });

  test('stops tracking a missing export and permits explicit retry', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.getReportExport
      .mockResolvedValueOnce({
        data: [exportData('canceled', 'generating', 'old-export-uuid')],
      })
      .mockResolvedValue({data: [exportData('running')]});
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });

    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('unavailable'),
    );
    expect(gmp.reportexport.getReportExport).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.retry(result.current.jobs[0].key);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('running'),
    );
    expect(gmp.reportexport.getReportExport.mock.calls.length).toBeGreaterThan(
      1,
    );
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('the export status query selects the requested ID instead of another entry', async () => {
    const gmp = createGmp([]);
    gmp.reportexport.getReportExport.mockResolvedValue({
      data: [
        exportData('canceled', 'generating', 'old-export-uuid'),
        exportData('running'),
      ],
    });
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useQuery(
        // @ts-expect-error partial gmp mock
        reportExportQueryOptions(gmp, 'test-token', 'export-uuid-1'),
      ),
    );

    await waitFor(() => expect(result.current.data?.id).toBe('export-uuid-1'));
    expect(result.current.data?.status).toBe('running');
  });

  test('keeps export creation errors inline while activity is open', async () => {
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

    expect(result.current.jobs[0].state.error?.message).toBe(
      'Export creation failed',
    );
    expect(onError).toHaveBeenCalledWith(new Error('Export creation failed'));
  });

  test('notifies about export creation errors while activity is closed', async () => {
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

    expect(onError).toHaveBeenCalledWith(new Error('Export creation failed'));
  });

  test('keeps direct download errors inline while activity is open', async () => {
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
      expect(result.current.jobs[0].state.error?.message).toBe(
        'Direct download failed',
      ),
    );
    expect(onError).toHaveBeenCalledWith(new Error('Direct download failed'));
  });

  test('dispatches direct downloads to synchronous GMP commands without polling', async () => {
    const gmp = createGmp([]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    const directPayload = {
      report_id: 'report-uuid',
      format_id: 'format-uuid',
      config_id: 'config-uuid',
      delta_report_id: 'delta-uuid',
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
      expect(result.current.jobs.every(job => job.downloadStarted)).toBe(true),
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
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();

    const remount = renderHook(() => useReportExport({onError, onDownload}));
    await waitFor(() =>
      expect(remount.result.current.jobs).toHaveLength(kinds.length),
    );
    expect(
      remount.result.current.jobs.every(
        job => job.state.status === 'downloaded',
      ),
    ).toBe(true);
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
      expect(result.current.jobs[0].downloadStarted).toBe(true),
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
    expect(result.current.jobs[0].downloadStarted).toBe(false);
    expect(result.current.jobs[0].downloadPending).toBe(true);
    expect(result.current.isActive).toBe(true);

    act(() => result.current.dismiss(result.current.jobs[0].key));
    expect(result.current.jobs).toHaveLength(1);

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    await waitFor(() =>
      expect(result.current.jobs[0].downloadStarted).toBe(true),
    );
    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.isActive).toBe(false);
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
    ).toContain('export-uuid-1');

    act(() => result.current.dismiss(result.current.jobs[0].key));
    await waitFor(() => expect(result.current.jobs).toHaveLength(0));
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
    ).toBeNull();
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
      expect(result.current.jobs[0].state.status).toBe('creating'),
    );
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).not.toHaveBeenCalled();
    expect(result.current.jobs[0].cancelPending).toBe(true);

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
      expect(result.current.jobs[0].downloadPending).toBe(true),
    );
    await act(async () => {
      await result.current.cancel(result.current.jobs[0].key);
    });
    expect(gmp.reportexport.cancelReportExport).not.toHaveBeenCalled();

    await act(async () => {
      resolveDownload?.({data: new ArrayBuffer(8)});
    });

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(result.current.jobs[0].state.status).toBe('done');
    expect(result.current.jobs[0].downloadPending).toBe(false);
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
    const onCancelError = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onDownload: testing.fn(), onError: onCancelError}),
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
    expect(onCancelError).toHaveBeenCalledWith(new Error('Unknown command'));
  });

  test('shows cancellation failures inline while activity is open', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexport.cancelReportExport.mockRejectedValue(
      new Error('Unknown command'),
    );
    const onCancelError = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({
        onDownload: testing.fn(),
        onError: onCancelError,
      }),
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

    expect(result.current.jobs[0].cancelError?.message).toBe('Unknown command');
    expect(onCancelError).toHaveBeenCalledWith(new Error('Unknown command'));
  });

  test('downloads a same-report retry when GMP reuses the export id', async () => {
    const gmp = createGmp([exportData('running')]);
    let status = 'running';
    gmp.reportexport.exportScanReport.mockResolvedValue({
      data: {id: 'export-uuid-1'},
    });
    gmp.reportexport.getReportExport.mockImplementation(
      async ({reportExportId}: {reportExportId: string}) => ({
        data: [{id: reportExportId, status, progress: 'generating'}],
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
      expect(result.current.jobs[0].state.status).toBe('running'),
    );
    const canceledJobKey = result.current.jobs[0].key;
    status = 'canceled';

    await act(async () => {
      await result.current.cancel(canceledJobKey);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('canceled'),
    );

    status = 'done';
    await act(async () => {
      await result.current.start(params);
    });

    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(
      gmp.reportexport.getReportExport.mock.calls.length,
    ).toBeGreaterThanOrEqual(3);
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(new ArrayBuffer(8), 'report.xml');
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.jobs[0].downloadStarted).toBe(true);
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
    expect(result.current.jobs.map(job => job.state.status)).toEqual([
      'running',
      'running',
      'running',
      'pending',
    ]);
  });

  test('keeps checking and recovers after transient status failures', async () => {
    const gmp = createGmp([exportData('running')]);
    gmp.reportexport.getReportExport
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
      expect(result.current.jobs[0].state.status).toBe('checking'),
    );
    expect(result.current.isActive).toBe(true);

    await waitFor(
      () => expect(result.current.jobs[0].state.status).toBe('running'),
      {timeout: 10000},
    );
    expect(gmp.reportexport.getReportExport.mock.calls.length).toBeGreaterThan(
      1,
    );
    expect(result.current.jobs[0].statusError).toBeUndefined();
  }, 15000);

  test('rehydrates an export after the hook is remounted', async () => {
    const gmp = createGmp([exportData('running')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const firstMount = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await firstMount.result.current.start(startParams);
    });
    await waitFor(() =>
      expect(
        window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
      ).toContain('export-uuid-1'),
    );
    firstMount.unmount();

    const secondMount = renderHook(() =>
      useReportExport({onError, onDownload}),
    );
    await waitFor(() =>
      expect(secondMount.result.current.jobs[0].state.status).toBe('running'),
    );
    expect(gmp.reportexport.getReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(secondMount.result.current.jobs[0].filename).toBe('report.xml');
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('retains handed-off records without downloading again', async () => {
    window.sessionStorage.setItem(
      'gsa-report-export-jobs:test-user',
      JSON.stringify([
        {
          key: 'report-export-legacy',
          exportId: 'export-uuid-1',
          filename: 'report.xml',
          reportTitle: 'Test report',
          downloadStarted: true,
        },
      ]),
    );
    const gmp = createGmp([exportData('done', 'completed')]);
    gmp.reportexport.getReportExport.mockRejectedValue(
      new Error('Failure to receive response from manager daemon'),
    );
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    expect(result.current.jobs[0].downloadStarted).toBe(true);
    expect(result.current.jobs[0].state.status).toBe('done');
    expect(result.current.jobs[0].statusError).toBeUndefined();
    expect(result.current.isActive).toBe(false);
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
    ).toContain('export-uuid-1');
    expect(gmp.reportexport.downloadReportExport).not.toHaveBeenCalled();
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();
    expect(onDownload).not.toHaveBeenCalled();
  });

  test('restores completed history after login without contacting the backend', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].downloadStarted).toBe(true),
    );
    gmp.reportexport.getReportExport
      .mockClear()
      .mockRejectedValue(
        new Error('Failure to receive response from manager daemon'),
      );

    act(() => changeSession(gmp));
    expect(result.current.jobs).toHaveLength(0);
    expect(result.current.isActive).toBe(false);
    act(() => changeSession(gmp, 'new-token', 'test-user'));

    await waitFor(() =>
      expect(result.current.jobs[0]?.state.status).toBe('done'),
    );
    expect(result.current.jobs[0].statusError).toBeUndefined();
    expect(result.current.jobs[0].filename).toBe('report.xml');
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(1);
    act(() => result.current.dismiss(result.current.jobs[0].key));
    expect(result.current.jobs).toHaveLength(0);
  });

  test('continues the same unfinished export after login without creating another', async () => {
    const exports = [exportData('running')];
    const gmp = createGmp(exports);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].state.status).toBe('running'),
    );
    act(() => changeSession(gmp));
    gmp.reportexport.getReportExport.mockClear();
    expect(result.current.jobs).toHaveLength(0);
    exports[0] = exportData('done', 'completed');
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();

    act(() => changeSession(gmp, 'new-token', 'test-user'));
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(1);
    expect(gmp.reportexport.getReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledWith({
      reportExportId: 'export-uuid-1',
    });
    expect(result.current.jobs[0].downloadStarted).toBe(true);
  });

  test('restarts an interrupted transfer and ignores its old-session response', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    let resolveOld: ((response: {data: ArrayBuffer}) => void) | undefined;
    let resolveNew: ((response: {data: ArrayBuffer}) => void) | undefined;
    gmp.reportexport.downloadReportExport
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveOld = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveNew = resolve;
          }),
      );
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));

    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(1),
    );
    act(() => changeSession(gmp));
    expect(result.current.jobs).toHaveLength(0);
    act(() => changeSession(gmp, 'new-token', 'test-user'));
    await waitFor(() =>
      expect(gmp.reportexport.downloadReportExport).toHaveBeenCalledTimes(2),
    );

    await act(async () => {
      resolveOld?.({data: new ArrayBuffer(4)});
    });
    expect(onDownload).not.toHaveBeenCalled();
    expect(result.current.jobs[0].downloadStarted).toBe(false);
    await act(async () => {
      resolveNew?.({data: new ArrayBuffer(8)});
    });
    await waitFor(() => expect(onDownload).toHaveBeenCalledTimes(1));
    expect(onDownload).toHaveBeenCalledWith(new ArrayBuffer(8), 'report.xml');
    expect(gmp.reportexport.exportScanReport).toHaveBeenCalledTimes(1);
    expect(
      gmp.reportexport.downloadReportExport.mock.calls.map(
        ([params]) => params,
      ),
    ).toEqual([
      {reportExportId: 'export-uuid-1'},
      {reportExportId: 'export-uuid-1'},
    ]);
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

  test('keeps activity isolated when a different user logs in', async () => {
    const gmp = createGmp([exportData('done', 'completed')]);
    const onDownload = testing.fn();
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() => useReportExport({onError, onDownload}));
    await act(async () => {
      await result.current.start(startParams);
    });
    await waitFor(() =>
      expect(result.current.jobs[0].downloadStarted).toBe(true),
    );
    gmp.reportexport.getReportExport.mockClear();

    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'other-token', 'other-user'));
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();
    expect(
      window.sessionStorage.getItem('gsa-report-export-jobs:test-user'),
    ).toContain('export-uuid-1');
    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'third-token', 'test-user'));
    await waitFor(() =>
      expect(result.current.jobs[0]?.downloadStarted).toBe(true),
    );
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  test('does not adopt unscoped legacy activity for the current user', () => {
    window.sessionStorage.setItem(
      'gsa-report-export-jobs',
      JSON.stringify([
        {
          key: 'legacy',
          exportId: 'other-export',
          filename: 'report.pdf',
          reportTitle: 'Other user report',
          downloadStarted: true,
        },
      ]),
    );
    const gmp = createGmp([]);
    const {renderHook} = rendererWith({gmp});
    const {result} = renderHook(() =>
      useReportExport({onError, onDownload: testing.fn()}),
    );
    expect(result.current.jobs).toHaveLength(0);
    expect(window.sessionStorage.getItem('gsa-report-export-jobs')).toBeNull();
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();
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
    act(() => changeSession(gmp));
    act(() => changeSession(gmp, 'other-token', 'other-user'));
    await act(async () => {
      resolveCreate?.({data: {id: 'old-export'}});
      expect(await creation).toBe(false);
    });
    expect(result.current.jobs).toHaveLength(0);
    expect(gmp.reportexport.getReportExport).not.toHaveBeenCalled();
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
