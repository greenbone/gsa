/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type QueryClient} from '@tanstack/react-query';
import {v4 as uuid} from 'uuid';
import type Gmp from 'gmp/gmp';
import {type ReportExport} from 'gmp/models/report-export';
import {reportExportQueryOptions} from 'web/hooks/use-query/report-exports';
import {
  type DirectDownload,
  type DirectDownloadPhase,
  fetchDirectDownload,
} from 'web/report-export/direct-download';
import {
  type ExportAttempt,
  type StartReportExportParams,
  getReportExportActions,
  inStage,
  isPermanentExportError,
  retainReportExportJobs,
  selectReportExportInventory,
  toReportExportJob,
} from 'web/report-export/job';
import {readExportIntents, writeExportIntents} from 'web/report-export/storage';
import {
  createExportAttemptStore,
  type ExportAttemptEvent,
} from 'web/report-export/store';
import {ROUTES} from 'web/route-paths';

export const REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL = 3000;
const MAX_DOWNLOAD_RETRIES = 10;

type ControllerGmp = Pick<
  Gmp,
  'session' | 'reportexport' | 'report' | 'auditreport'
>;

export interface ReportExportCallbacks {
  onDownload: (
    data: ArrayBuffer | string,
    filename: string,
    mimetype?: string,
  ) => void;
  onError?: (error: Error) => void;
}

interface ControllerOptions {
  gmp: ControllerGmp;
  queryClient: QueryClient;
  token?: string;
  username?: string;
  callbacks: ReportExportCallbacks;
}

interface AttemptRuntime {
  key: string;
  retries: number;
  timer?: ReturnType<typeof setTimeout>;
  buffer?: ArrayBuffer | string;
  mimetype?: string;
}

const EXPORT_METHODS = {
  scan: 'exportScanReport',
  audit: 'exportAuditReport',
  delta_scan: 'exportDeltaScanReport',
  delta_audit: 'exportDeltaAuditReport',
} as const;

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));

const validId = (id?: string) => Boolean(id && /^[a-zA-Z0-9-]+$/.test(id));

const release = (runtime: AttemptRuntime) => {
  if (runtime.timer) clearTimeout(runtime.timer);
  runtime.timer = undefined;
  runtime.buffer = undefined;
  runtime.retries = 0;
};

const loadAttempts = (username?: string): ExportAttempt[] =>
  readExportIntents(username).map(intent => {
    let stage: 'tracking' | 'handed-off' | 'abandoned' = 'tracking';
    if (intent.disposition === 'handed-off') stage = 'handed-off';
    if (intent.disposition === 'abandoned') stage = 'abandoned';
    return {...intent, phase: {stage}};
  });

const getRecoveredReportUrl = ({
  type,
  reportId,
  deltaReportId,
}: ReportExport) => {
  if (!reportId || !validId(reportId)) return undefined;
  const delta =
    deltaReportId && validId(deltaReportId) ? deltaReportId : undefined;
  switch (type) {
    case 'scan':
      return ROUTES.report.url(reportId);
    case 'audit':
      return ROUTES.auditReport.url(reportId);
    case 'delta_scan':
      return delta && ROUTES.reportDelta.url(reportId, delta);
    case 'delta_audit':
      return delta && ROUTES.auditReportDelta.url(reportId, delta);
  }
  return undefined;
};

const recoveredAttempt = (item: ReportExport): ExportAttempt => {
  const extension = item.extension?.replace(/^\./, '');
  return {
    key: `recovered-${item.id}`,
    origin: 'discovered',
    exportId: item.id,
    filename: `report-${item.id}.${extension && /^[a-zA-Z0-9]{1,16}$/.test(extension) ? extension : 'bin'}`,
    reportTitle: item.name || item.reportId || item.id,
    reportUrl: getRecoveredReportUrl(item),
    autoDownload: false,
    disposition: 'awaiting',
    phase: {stage: 'tracking'},
  };
};

// Side effects of one login session; session storage intents hand over to the next session.
export const createReportExportController = ({
  gmp,
  queryClient,
  token,
  username,
  callbacks: initialCallbacks,
}: ControllerOptions) => {
  const store = createExportAttemptStore(token ? loadAttempts(username) : []);
  const runtimes = new Map<string, AttemptRuntime>();
  const dismissed = new Set<string>();
  const directListeners = new Set<() => void>();
  let directDownloads: DirectDownload[] = [];
  let callbacks = initialCallbacks;
  let active = false;

  const inventoryKey = () => ['get_report_exports', token, username];
  const statusKey = (exportId: string | undefined, key: string) => [
    'get_report_export',
    token,
    exportId,
    key,
  ];

  const isLive = () =>
    active &&
    Boolean(token && username) &&
    gmp.session.token === token &&
    gmp.session.username === username;

  const notify = (error: Error) => callbacks.onError?.(error);

  const refreshInventory = () => {
    void queryClient.invalidateQueries({queryKey: inventoryKey()});
  };

  const statusOf = (attempt: ExportAttempt) => {
    const queryKey = statusKey(attempt.exportId, attempt.key);
    return {
      data: queryClient.getQueryData<ReportExport>(queryKey),
      error: queryClient.getQueryState<ReportExport, Error>(queryKey)?.error,
    };
  };

  const toJob = (attempt: ExportAttempt) => {
    const {data, error} = statusOf(attempt);
    return toReportExportJob(attempt, data, error);
  };

  const getJobs = () => store.getSnapshot().map(toJob);

  const jobFor = (key: string) => {
    const attempt = store.getAttempt(key);
    return attempt && isLive() ? toJob(attempt) : undefined;
  };

  const setDirectDownloads = (downloads: DirectDownload[]) => {
    directDownloads = downloads;
    directListeners.forEach(listener => listener());
  };

  const runtimeFor = (attempt: ExportAttempt) => {
    let runtime = runtimes.get(attempt.key);
    if (!runtime) {
      runtime = {key: attempt.key, retries: 0};
      runtimes.set(attempt.key, runtime);
    }
    return runtime;
  };

  const isCurrent = (runtime: AttemptRuntime) =>
    isLive() &&
    Boolean(store.getAttempt(runtime.key)) &&
    runtimes.get(runtime.key) === runtime;

  const send = (runtime: AttemptRuntime, event: ExportAttemptEvent) =>
    isCurrent(runtime) && store.dispatch(event);

  const removeAttempt = (key: string) => {
    const runtime = runtimes.get(key);
    if (runtime) release(runtime);
    runtimes.delete(key);
    store.dispatch({type: 'remove', key});
  };

  const releaseRemovedRuntimes = () => {
    const keys = new Set(store.getSnapshot().map(item => item.key));
    for (const [key, runtime] of runtimes) {
      if (keys.has(key)) continue;
      release(runtime);
      runtimes.delete(key);
      void queryClient.cancelQueries({
        queryKey: ['get_report_export', token],
        predicate: query => query.queryKey[3] === key,
      });
    }
  };

  const persist = () => {
    if (!username) return;
    writeExportIntents(
      username,
      store.getSnapshot().map(attempt => {
        const status = statusOf(attempt).data?.status;
        return status === 'canceled' ||
          status === 'error' ||
          status === 'expired'
          ? {...attempt, disposition: 'abandoned'}
          : attempt;
      }),
    );
  };

  const handoff = (runtime: AttemptRuntime) => {
    const attempt = store.getAttempt(runtime.key);
    if (
      !attempt ||
      !isCurrent(runtime) ||
      runtime.buffer === undefined ||
      !inStage(attempt.phase, 'transferring', 'handoff-failed')
    )
      return;
    try {
      const {onDownload} = callbacks;
      if (runtime.mimetype)
        onDownload(runtime.buffer, attempt.filename, runtime.mimetype);
      else onDownload(runtime.buffer, attempt.filename);
      send(runtime, {type: 'handoff', key: runtime.key});
      release(runtime);
      refreshInventory();
    } catch (error) {
      const failure = toError(error);
      if (
        send(runtime, {
          type: 'handoff-failed',
          key: runtime.key,
          error: failure,
        })
      )
        notify(failure);
    }
  };

  const retryTransfer = async (
    runtime: AttemptRuntime,
    reportExportId: string,
  ) => {
    runtime.timer = undefined;
    if (!isCurrent(runtime)) return;
    try {
      const data = await queryClient.query({
        ...reportExportQueryOptions(gmp, token, reportExportId, runtime.key),
        staleTime: 0,
      });
      if (!isCurrent(runtime)) return;
      if (data.status === 'done') {
        await transfer(runtime);
        return;
      }
      send(runtime, {type: 'resume', key: runtime.key});
    } catch (error) {
      if (!isCurrent(runtime)) return;
      send(runtime, {type: 'wait', key: runtime.key, error: toError(error)});
    }
  };

  const transfer = async (runtime: AttemptRuntime): Promise<void> => {
    const attempt = store.getAttempt(runtime.key);
    if (!attempt || !isCurrent(runtime)) return;
    if (runtime.buffer !== undefined) {
      handoff(runtime);
      return;
    }
    const reportExportId = attempt.exportId;
    if (!reportExportId) return;
    if (!send(runtime, {type: 'transfer', key: runtime.key})) return;
    try {
      const response = await gmp.reportexport.downloadReportExport({
        reportExportId,
      });
      if (!isCurrent(runtime)) return;
      runtime.buffer = response.data;
      handoff(runtime);
    } catch (error) {
      if (!isCurrent(runtime)) return;
      if (
        isPermanentExportError(error) ||
        runtime.retries++ >= MAX_DOWNLOAD_RETRIES
      ) {
        const failure = toError(error);
        send(runtime, {type: 'wait', key: runtime.key, error: failure});
        notify(failure);
        return;
      }
      send(runtime, {type: 'wait', key: runtime.key});
      runtime.timer = setTimeout(
        () => void retryTransfer(runtime, reportExportId),
        REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL,
      );
    }
  };

  const pickUpCompletedExports = () => {
    for (const attempt of store.getSnapshot()) {
      const {data, error} = statusOf(attempt);
      if (
        attempt.disposition !== 'awaiting' ||
        !attempt.autoDownload ||
        data?.status !== 'done' ||
        isPermanentExportError(error) ||
        !inStage(attempt.phase, 'tracking', 'cancel-requested')
      )
        continue;
      const runtime = runtimeFor(attempt);
      runtime.mimetype = data.contentType;
      void transfer(runtime);
    }
  };

  const requestCancellation = async (runtime: AttemptRuntime) => {
    const reportExportId = store.getAttempt(runtime.key)?.exportId;
    if (!reportExportId) return;
    if (!send(runtime, {type: 'cancel', key: runtime.key})) return;
    try {
      await gmp.reportexport.cancelReportExport({reportExportId});
      send(runtime, {type: 'cancel-accepted', key: runtime.key});
    } catch (error) {
      if (!isCurrent(runtime)) return;
      const failure = toError(error);
      send(runtime, {type: 'cancel-failed', key: runtime.key, error: failure});
      notify(failure);
    } finally {
      if (isCurrent(runtime))
        void queryClient.invalidateQueries({
          queryKey: statusKey(reportExportId, runtime.key),
        });
    }
  };

  const dismiss = (key: string) => {
    if (
      directDownloads.some(
        item => item.key === key && item.phase.stage !== 'downloading',
      )
    ) {
      setDirectDownloads(directDownloads.filter(item => item.key !== key));
      return;
    }
    const job = jobFor(key);
    if (!job || !getReportExportActions(job).dismiss) return;
    if (job.exportId) dismissed.add(job.exportId);
    void queryClient.cancelQueries({queryKey: statusKey(job.exportId, key)});
    removeAttempt(key);
  };

  const addAttempt = (params: StartReportExportParams) => {
    for (const job of getJobs()) {
      if (
        params.reportUrl &&
        job.reportUrl === params.reportUrl &&
        job.view.kind === 'canceled'
      )
        dismiss(job.key);
    }
    const attempt: ExportAttempt = {
      key: `report-export-${uuid()}`,
      origin: 'local',
      filename: params.filename,
      reportTitle: params.reportTitle,
      reportUrl: params.reportUrl,
      autoDownload: true,
      disposition: 'awaiting',
      phase: {stage: 'creating'},
    };
    const runtime = runtimeFor(attempt);
    store.dispatch({type: 'add', attempt});
    return runtime;
  };

  const start = async (params: StartReportExportParams) => {
    if (!isLive()) return false;
    const runtime = addAttempt(params);
    try {
      const response = await gmp.reportexport[EXPORT_METHODS[params.kind]](
        params.payload,
      );
      if (!isCurrent(runtime)) return false;
      const exportId = response.data.id;
      const attempt = store.getAttempt(runtime.key);
      const cancelRequested =
        attempt?.phase.stage === 'creating' && attempt.phase.cancelRequested;
      // gvmd reuses only pending/running exports, so a match is still generating
      const existing = store
        .getSnapshot()
        .find(
          candidate =>
            candidate.key !== runtime.key &&
            candidate.exportId === exportId &&
            candidate.disposition === 'awaiting',
        );
      let target = runtime;
      if (existing) {
        target = runtimeFor(existing);
        if (!existing.autoDownload)
          send(target, {
            type: 'adopt',
            key: existing.key,
            metadata: {
              filename: params.filename,
              reportTitle: params.reportTitle,
              reportUrl: params.reportUrl,
            },
          });
        removeAttempt(runtime.key);
      } else {
        dismissed.delete(exportId);
        send(runtime, {type: 'created', key: runtime.key, exportId});
      }
      refreshInventory();
      if (cancelRequested) await requestCancellation(target);
      return true;
    } catch (error) {
      if (!isCurrent(runtime)) return false;
      const failure = toError(error);
      send(runtime, {type: 'fail', key: runtime.key, error: failure});
      notify(failure);
      return false;
    }
  };

  const startDirect = (params: StartReportExportParams) => {
    if (!isLive()) return false;
    const key = `report-download-${uuid()}`;
    const {filename, reportTitle, reportUrl} = params;
    setDirectDownloads([
      ...directDownloads,
      {key, filename, reportTitle, reportUrl, phase: {stage: 'downloading'}},
    ]);
    const setPhase = (phase: DirectDownloadPhase) =>
      setDirectDownloads(
        directDownloads.map(item =>
          item.key === key ? {...item, phase} : item,
        ),
      );
    const run = async () => {
      try {
        const data = await fetchDirectDownload(gmp, params);
        if (!isLive()) return;
        callbacks.onDownload(data, filename);
        setPhase({stage: 'complete'});
      } catch (error) {
        if (!isLive()) return;
        const failure = toError(error);
        setPhase({stage: 'failed', error: failure});
        notify(failure);
      }
    };
    void run();
    return true;
  };

  const cancel = async (key: string) => {
    const attempt = store.getAttempt(key);
    const job = jobFor(key);
    if (!attempt || !job || !getReportExportActions(job).cancel) return;
    const runtime = runtimeFor(attempt);
    if (!attempt.exportId) {
      send(runtime, {type: 'queue-cancel', key});
      return;
    }
    await requestCancellation(runtime);
  };

  const retry = async (key: string) => {
    const attempt = store.getAttempt(key);
    const job = jobFor(key);
    if (!attempt || !job || !getReportExportActions(job).retry) return;
    const runtime = runtimeFor(attempt);
    if (runtime.buffer !== undefined) {
      handoff(runtime);
      return;
    }
    runtime.retries = 0;
    if (!send(runtime, {type: 'resume', key})) return;
    await queryClient.resetQueries({
      queryKey: statusKey(attempt.exportId, key),
    });
  };

  const download = async (key: string) => {
    const attempt = store.getAttempt(key);
    const job = jobFor(key);
    if (!attempt || !job || !getReportExportActions(job).download) return;
    const runtime = runtimeFor(attempt);
    runtime.mimetype = job.exportData?.contentType;
    send(runtime, {type: 'auto-download', key});
    await transfer(runtime);
  };

  return {
    store,
    subscribeDirect: (listener: () => void) => {
      directListeners.add(listener);
      return () => {
        directListeners.delete(listener);
      };
    },
    getDirectDownloads: () => directDownloads,
    setCallbacks: (next: ReportExportCallbacks) => {
      callbacks = next;
    },
    activate: () => {
      active = true;
      dismissed.clear();
    },
    dispose: () => {
      active = false;
      runtimes.forEach(release);
      runtimes.clear();
      void queryClient.cancelQueries({queryKey: ['get_report_export', token]});
      void queryClient.cancelQueries({queryKey: inventoryKey()});
    },
    mergeInventory: (exports: ReportExport[]) => {
      if (!isLive()) return;
      const known = new Set(store.getSnapshot().map(item => item.exportId));
      for (const item of selectReportExportInventory(exports)) {
        if (!validId(item.id)) continue;
        queryClient.setQueryData(
          statusKey(item.id, `recovered-${item.id}`),
          item,
        );
        if (known.has(item.id) || dismissed.has(item.id)) continue;
        store.dispatch({type: 'add', attempt: recoveredAttempt(item)});
        known.add(item.id);
      }
    },
    // Reconciles runtimes, retention, persistence and automatic downloads with the current state.
    sync: () => {
      if (!isLive()) return;
      releaseRemovedRuntimes();
      store.dispatch({
        type: 'retain',
        keys: new Set(retainReportExportJobs(getJobs()).map(job => job.key)),
      });
      persist();
      pickUpCompletedExports();
    },
    refreshInventory,
    start,
    startDirect,
    cancel,
    dismiss,
    retry,
    download,
  };
};

export type ReportExportController = ReturnType<
  typeof createReportExportController
>;
