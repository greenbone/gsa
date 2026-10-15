/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type QueryClient} from '@tanstack/react-query';
import {v4 as uuid} from 'uuid';
import type Gmp from 'gmp/gmp';
import type ReportExport from 'gmp/models/report-export';
import {reportExportQueryOptions} from 'web/hooks/use-query/report-export-queries';
import {type DirectDownload} from 'web/report-export/direct-download';
import {
  createReportExportAttemptStore,
  type ReportExportAttemptEvent,
} from 'web/report-export/report-export-attempt-store';
import {
  type ReportExportAttempt,
  type StartReportExportParams,
  getReportExportActions,
  isAttemptInStage,
  isPermanentReportExportError,
  retainReportExportJobs,
  selectReportExportInventory,
  createReportExportJob,
} from 'web/report-export/report-export-job-model';
import {type ReportExportMutations} from 'web/report-export/useReportExportMutations';
import {
  createRecoveredReportExportAttempt,
  isValidGmpIdentifier,
} from 'web/report-export/utils/report-export-orchestrator-utils';

export const REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL = 3000;
const MAX_DOWNLOAD_RETRIES = 10;

type ReportExportJobAction = 'cancel' | 'dismiss' | 'download' | 'retry';

type ReportExportGmp = Pick<Gmp, 'session' | 'reportexport'>;

export interface ReportExportCallbacks {
  onDownload: (
    data: ArrayBuffer | string,
    filename: string,
    mimetype?: string,
  ) => void;
  onError?: (error: Error) => void;
}

interface ReportExportOperationsOptions {
  gmp: ReportExportGmp;
  queryClient: QueryClient;
  token?: string;
  username?: string;
  sessionScope: string;
  callbacks: ReportExportCallbacks;
  mutations: ReportExportMutations;
}

interface AttemptRuntime {
  key: string;
  retries: number;
  timer?: ReturnType<typeof setTimeout>;
  buffer?: ArrayBuffer | string;
  mimetype?: string;
}

const toError = (error: unknown) => {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error('Unexpected report export error');
};

const release = (runtime: AttemptRuntime) => {
  if (runtime.timer) clearTimeout(runtime.timer);
  runtime.timer = undefined;
  runtime.buffer = undefined;
  runtime.retries = 0;
};

// Owns one login session's report-export operations.
export const createReportExportOperations = ({
  gmp,
  queryClient,
  token,
  username,
  sessionScope,
  callbacks: initialCallbacks,
  mutations: initialMutations,
}: ReportExportOperationsOptions) => {
  const store = createReportExportAttemptStore();
  const runtimes = new Map<string, AttemptRuntime>();
  const dismissed = new Set<string>();
  const directListeners = new Set<() => void>();
  let directDownloads: DirectDownload[] = [];
  let callbacks = initialCallbacks;
  let mutations = initialMutations;
  let active = false;

  const inventoryKey = () => ['get_report_exports', username, sessionScope];
  const statusKey = (exportId: string | undefined) => [
    'get_report_export',
    username,
    sessionScope,
    exportId,
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

  const statusOf = (attempt: ReportExportAttempt) => {
    const queryKey = statusKey(attempt.exportId);
    return {
      data: queryClient.getQueryData<ReportExport>(queryKey),
      error: queryClient.getQueryState<ReportExport, Error>(queryKey)?.error,
    };
  };

  const toJob = (attempt: ReportExportAttempt) => {
    const {data, error} = statusOf(attempt);
    return createReportExportJob(attempt, data, error);
  };

  const getJobs = () => store.getSnapshot().map(toJob);

  const getActionableAttempt = (key: string, action: ReportExportJobAction) => {
    const attempt = store.getAttempt(key);
    if (!attempt || !isLive()) return undefined;
    const job = toJob(attempt);
    return getReportExportActions(job)[action] ? {attempt, job} : undefined;
  };

  const setDirectDownloads = (downloads: DirectDownload[]) => {
    directDownloads = downloads;
    directListeners.forEach(listener => listener());
  };

  const runtimeFor = (attempt: ReportExportAttempt) => {
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

  const send = (runtime: AttemptRuntime, event: ReportExportAttemptEvent) =>
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
    }
  };

  const handoff = (runtime: AttemptRuntime) => {
    const attempt = store.getAttempt(runtime.key);
    if (
      !attempt ||
      !isCurrent(runtime) ||
      runtime.buffer === undefined ||
      !isAttemptInStage(attempt.phase, 'transferring', 'handoff-failed')
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
        ...reportExportQueryOptions(
          gmp,
          token,
          username,
          sessionScope,
          reportExportId,
        ),
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
      const response = await mutations.download(reportExportId);
      if (!isCurrent(runtime)) return;
      runtime.buffer = response.data;
      handoff(runtime);
    } catch (error) {
      if (!isCurrent(runtime)) return;
      if (
        isPermanentReportExportError(error) ||
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
        !attempt.autoDownload ||
        data?.status !== 'done' ||
        isPermanentReportExportError(error) ||
        !isAttemptInStage(attempt.phase, 'tracking', 'cancel-requested')
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
      await mutations.cancel(reportExportId);
      send(runtime, {type: 'cancel-accepted', key: runtime.key});
    } catch (error) {
      if (!isCurrent(runtime)) return;
      const failure = toError(error);
      send(runtime, {type: 'cancel-failed', key: runtime.key, error: failure});
      notify(failure);
    } finally {
      if (isCurrent(runtime))
        void queryClient.invalidateQueries({
          queryKey: statusKey(reportExportId),
        });
    }
  };

  const dismiss = (key: string) => {
    if (
      directDownloads.some(
        item => item.key === key && item.view.kind !== 'downloading',
      )
    ) {
      setDirectDownloads(directDownloads.filter(item => item.key !== key));
      return;
    }
    const actionable = getActionableAttempt(key, 'dismiss');
    if (!actionable) return;
    if (actionable.attempt.exportId) dismissed.add(actionable.attempt.exportId);
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
    const attempt: ReportExportAttempt = {
      key: `report-export-${uuid()}`,
      origin: 'local',
      filename: params.filename,
      reportTitle: params.reportTitle,
      reportUrl: params.reportUrl,
      autoDownload: true,
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
      const response = await mutations.create({
        kind: params.kind,
        payload: params.payload,
      });
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
            candidate.phase.stage !== 'handed-off',
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
      {key, filename, reportTitle, reportUrl, view: {kind: 'downloading'}},
    ]);
    const setView = (view: DirectDownload['view']) =>
      setDirectDownloads(
        directDownloads.map(item =>
          item.key === key ? {...item, view} : item,
        ),
      );
    const run = async () => {
      try {
        const data = await mutations.direct(params);
        if (!isLive()) return;
        callbacks.onDownload(data, filename);
        setView({kind: 'complete'});
      } catch (error) {
        if (!isLive()) return;
        const failure = toError(error);
        setView({kind: 'failed', reason: 'export', error: failure});
        notify(failure);
      }
    };
    void run();
    return true;
  };

  const cancel = async (key: string) => {
    const actionable = getActionableAttempt(key, 'cancel');
    if (!actionable) return;
    const {attempt} = actionable;
    const runtime = runtimeFor(attempt);
    if (!attempt.exportId) {
      send(runtime, {type: 'queue-cancel', key});
      return;
    }
    await requestCancellation(runtime);
  };

  const retry = async (key: string) => {
    const actionable = getActionableAttempt(key, 'retry');
    if (!actionable) return;
    const {attempt} = actionable;
    const runtime = runtimeFor(attempt);
    if (runtime.buffer !== undefined) {
      handoff(runtime);
      return;
    }
    runtime.retries = 0;
    if (!send(runtime, {type: 'resume', key})) return;
    await queryClient.resetQueries({
      queryKey: statusKey(attempt.exportId),
    });
  };

  const download = async (key: string) => {
    const actionable = getActionableAttempt(key, 'download');
    if (!actionable) return;
    const {attempt, job} = actionable;
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
    setMutations: (next: ReportExportMutations) => {
      mutations = next;
    },
    activate: () => {
      active = true;
      dismissed.clear();
    },
    dispose: () => {
      active = false;
      runtimes.forEach(release);
      runtimes.clear();
      const reportExportQueryKey = [
        'get_report_export',
        username,
        sessionScope,
      ];
      void queryClient.cancelQueries({queryKey: reportExportQueryKey});
      queryClient.removeQueries({queryKey: reportExportQueryKey});
      void queryClient.cancelQueries({queryKey: inventoryKey()});
      queryClient.removeQueries({queryKey: inventoryKey()});
    },
    mergeInventory: (exports: ReportExport[]) => {
      if (!isLive()) return;
      const known = new Set(store.getSnapshot().map(item => item.exportId));
      for (const item of selectReportExportInventory(exports)) {
        if (!isValidGmpIdentifier(item.id)) continue;
        queryClient.setQueryData(statusKey(item.id), item);
        if (known.has(item.id) || dismissed.has(item.id)) continue;
        store.dispatch({
          type: 'add',
          attempt: createRecoveredReportExportAttempt(item),
        });
        known.add(item.id);
      }
    },
    // Reconciles runtimes, retention, and automatic downloads with the current state.
    sync: () => {
      if (!isLive()) return;
      releaseRemovedRuntimes();
      store.dispatch({
        type: 'retain',
        keys: new Set(retainReportExportJobs(getJobs()).map(job => job.key)),
      });
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

export type ReportExportOperations = ReturnType<
  typeof createReportExportOperations
>;
