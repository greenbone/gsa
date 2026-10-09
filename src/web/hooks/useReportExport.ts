/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {v4 as uuid} from 'uuid';
import {type ReportExport} from 'gmp/models/report-export';
import {
  reportExportQueryOptions,
  useReportExportInventory,
} from 'web/hooks/use-query/report-exports';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';
import {
  type DirectDownload,
  type DirectDownloadPhase,
  fetchDirectDownload,
  toDirectDownloadJob,
} from 'web/report-export/direct-download';
import {
  type ExportAttempt,
  type StartReportExportParams,
  getReportExportActions,
  inStage,
  isPermanentExportError,
  toReportExportJob,
  retainReportExportJobs,
  selectReportExportInventory,
} from 'web/report-export/job';
import {readExportIntents, writeExportIntents} from 'web/report-export/storage';
import {
  createExportAttemptStore,
  type ExportAttemptEvent,
} from 'web/report-export/store';
import {ROUTES} from 'web/route-paths';

export type {
  ReportExportJob,
  ReportExportKind,
  JobView,
  StartReportExportParams,
} from 'web/report-export/job';
export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';
export const REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL = 3000;
const MAX_DOWNLOAD_RETRIES = 10;
const EMPTY_ATTEMPTS: ExportAttempt[] = [];
const EMPTY_DIRECT: DirectDownload[] = [];

interface UseReportExportParams {
  onDownload: (
    data: ArrayBuffer | string,
    filename: string,
    mimetype?: string,
  ) => void;
  onError?: (error: Error) => void;
}

interface AttemptRuntime {
  key: string;
  retries: number;
  timer?: ReturnType<typeof setTimeout>;
  buffer?: ArrayBuffer | string;
  mimetype?: string;
}

const loadAttempts = (username?: string): ExportAttempt[] =>
  readExportIntents(username).map(intent => {
    let stage: 'tracking' | 'handed-off' | 'abandoned' = 'tracking';
    if (intent.disposition === 'handed-off') stage = 'handed-off';
    if (intent.disposition === 'abandoned') stage = 'abandoned';
    return {...intent, phase: {stage}};
  });
const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));
const validId = (id?: string) => Boolean(id && /^[a-zA-Z0-9-]+$/.test(id));
const release = (runtime: AttemptRuntime) => {
  if (runtime.timer) clearTimeout(runtime.timer);
  runtime.timer = undefined;
  runtime.buffer = undefined;
  runtime.retries = 0;
};
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

const useReportExport = ({onDownload, onError}: UseReportExportParams) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  const queryClient = useQueryClient();
  const owner = `${token ?? ''}\0${username ?? ''}`;
  const [sessionStore, setSessionStore] = useState(() => ({
    owner,
    store: createExportAttemptStore(token ? loadAttempts(username) : []),
  }));
  if (sessionStore.owner !== owner)
    setSessionStore({
      owner,
      store: createExportAttemptStore(token ? loadAttempts(username) : []),
    });
  const {store} = sessionStore;
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const records = sessionStore.owner === owner ? snapshot : EMPTY_ATTEMPTS;
  const [direct, setDirect] = useState({owner, downloads: EMPTY_DIRECT});
  const directDownloads =
    direct.owner === owner ? direct.downloads : EMPTY_DIRECT;
  const activeStore = useRef(store);
  const resources = useRef(new Map<string, AttemptRuntime>());
  const dismissed = useRef(new Set<string>());
  const mounted = useRef(false);
  const callbacks = useRef({onDownload, onError});
  useEffect(() => {
    callbacks.current = {onDownload, onError};
  }, [onDownload, onError]);
  const inventory = useReportExportInventory();
  const isCurrentSession = useCallback(
    () =>
      mounted.current &&
      activeStore.current === store &&
      Boolean(token && username) &&
      gmp.session.token === token &&
      gmp.session.username === username,
    [gmp, token, username, store],
  );
  const current = (runtime: AttemptRuntime) =>
    isCurrentSession() &&
    Boolean(store.getAttempt(runtime.key)) &&
    resources.current.get(runtime.key) === runtime;
  const send = (runtime: AttemptRuntime, event: ExportAttemptEvent) =>
    current(runtime) && store.dispatch(event);
  const resourceFor = useCallback((attempt: ExportAttempt) => {
    let runtime = resources.current.get(attempt.key);
    if (!runtime) {
      runtime = {key: attempt.key, retries: 0};
      resources.current.set(attempt.key, runtime);
    }
    return runtime;
  }, []);
  const notify = (error: Error) => {
    callbacks.current.onError?.(error);
  };
  const refreshInventory = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['get_report_exports', token, username],
    });
  }, [queryClient, token, username]);
  useEffect(() => {
    activeStore.current = store;
    mounted.current = true;
    dismissed.current.clear();
    const attempts = resources.current;
    return () => {
      mounted.current = false;
      attempts.forEach(release);
      attempts.clear();
      void queryClient.cancelQueries({queryKey: ['get_report_export', token]});
      void queryClient.cancelQueries({
        queryKey: ['get_report_exports', token, username],
      });
    };
  }, [owner, queryClient, token, username, store]);
  const mergeInventory = useEffectEvent((exports: ReportExport[]) => {
    if (!isCurrentSession()) return;
    const visible = selectReportExportInventory(exports);
    for (const item of visible) {
      if (validId(item.id))
        queryClient.setQueryData(
          ['get_report_export', token, item.id, `recovered-${item.id}`],
          item,
        );
    }
    const known = new Set(store.getSnapshot().map(item => item.exportId));
    for (const item of visible) {
      if (
        item.id &&
        validId(item.id) &&
        !known.has(item.id) &&
        !dismissed.current.has(item.id)
      ) {
        store.dispatch({type: 'add', attempt: recoveredAttempt(item)});
        known.add(item.id);
      }
    }
  });
  useEffect(() => {
    if (inventory.data) mergeInventory(inventory.data.exports);
  }, [inventory.data, owner]);
  const statusQueries = useQueries({
    queries: records.map(attempt => ({
      ...reportExportQueryOptions(gmp, token, attempt.exportId, attempt.key),
      enabled: Boolean(
        token &&
        attempt.exportId &&
        attempt.disposition === 'awaiting' &&
        !inStage(
          attempt.phase,
          'creating',
          'handoff-failed',
          'transferring',
          'failed',
        ),
      ),
    })),
  });
  const jobs = records.map((attempt, index) =>
    toReportExportJob(
      attempt,
      statusQueries[index]?.data,
      statusQueries[index]?.error,
    ),
  );
  const pruneAttempts = useEffectEvent(() => {
    if (isCurrentSession() && store.getSnapshot() === records)
      store.dispatch({
        type: 'retain',
        keys: new Set(retainReportExportJobs(jobs).map(job => job.key)),
      });
  });
  useEffect(() => {
    pruneAttempts();
  }, [records, statusQueries, owner]);
  const persistIntents = useEffectEvent(() => {
    if (!isCurrentSession() || !username || store.getSnapshot() !== records)
      return;
    writeExportIntents(
      username,
      records.map((attempt, index) => {
        const status = statusQueries[index]?.data?.status;
        return status === 'canceled' ||
          status === 'error' ||
          status === 'expired'
          ? {...attempt, disposition: 'abandoned'}
          : attempt;
      }),
    );
  });
  useEffect(() => {
    persistIntents();
  }, [records, statusQueries, owner]);
  useEffect(() => {
    for (const attempt of records) resourceFor(attempt);
    const keys = new Set(records.map(attempt => attempt.key));
    for (const [key, runtime] of resources.current) {
      if (keys.has(key)) continue;
      release(runtime);
      resources.current.delete(key);
      void queryClient.cancelQueries({
        queryKey: ['get_report_export', token],
        predicate: query => query.queryKey[3] === key,
      });
    }
  }, [records, owner, resourceFor, queryClient, token]);
  const handoff = (runtime: AttemptRuntime) => {
    const attempt = store.getAttempt(runtime.key);
    if (
      !attempt ||
      !current(runtime) ||
      runtime.buffer === undefined ||
      !inStage(attempt.phase, 'transferring', 'handoff-failed')
    )
      return;
    try {
      if (runtime.mimetype)
        callbacks.current.onDownload(
          runtime.buffer,
          attempt.filename,
          runtime.mimetype,
        );
      else callbacks.current.onDownload(runtime.buffer, attempt.filename);
      send(runtime, {type: 'handoff', key: runtime.key});
      release(runtime);
      refreshInventory();
    } catch (error) {
      const failure = toError(error);
      if (
        !send(runtime, {
          type: 'handoff-failed',
          key: runtime.key,
          error: failure,
        })
      )
        return;
      notify(failure);
    }
  };
  const transfer = async (runtime: AttemptRuntime) => {
    const attempt = store.getAttempt(runtime.key);
    if (!attempt || !current(runtime)) return;
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
      if (!current(runtime)) return;
      runtime.buffer = response.data;
      handoff(runtime);
    } catch (error) {
      if (!current(runtime)) return;
      const failure = toError(error);
      if (
        !isPermanentExportError(error) &&
        runtime.retries++ < MAX_DOWNLOAD_RETRIES
      ) {
        send(runtime, {type: 'wait', key: runtime.key});
        runtime.timer = setTimeout(async () => {
          runtime.timer = undefined;
          if (!current(runtime)) return;
          try {
            const data = await queryClient.query({
              ...reportExportQueryOptions(
                gmp,
                token,
                reportExportId,
                runtime.key,
              ),
              staleTime: 0,
            });
            if (!current(runtime)) return;
            if (data.status === 'done') {
              void transfer(runtime);
              return;
            }
            send(runtime, {type: 'resume', key: runtime.key});
          } catch (lookupError) {
            if (!current(runtime)) return;
            send(runtime, {
              type: 'wait',
              key: runtime.key,
              error: toError(lookupError),
            });
          }
        }, REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL);
      } else {
        send(runtime, {type: 'wait', key: runtime.key, error: failure});
        notify(failure);
      }
    }
  };
  const pickUpExports = useEffectEvent(() => {
    for (const [index, attempt] of records.entries()) {
      const data = statusQueries[index]?.data;
      if (
        attempt.disposition !== 'awaiting' ||
        !attempt.autoDownload ||
        data?.status !== 'done' ||
        isPermanentExportError(statusQueries[index]?.error) ||
        !inStage(attempt.phase, 'tracking', 'cancel-requested')
      )
        continue;
      const runtime = resourceFor(attempt);
      runtime.mimetype = data.contentType;
      void transfer(runtime);
    }
  });
  useEffect(() => {
    pickUpExports();
  }, [records, statusQueries, owner]);
  const requestCancellation = async (runtime: AttemptRuntime) => {
    const reportExportId = store.getAttempt(runtime.key)?.exportId;
    if (!reportExportId) return;
    if (!send(runtime, {type: 'cancel', key: runtime.key})) return;
    try {
      await gmp.reportexport.cancelReportExport({reportExportId});
      send(runtime, {type: 'cancel-accepted', key: runtime.key});
    } catch (error) {
      if (!current(runtime)) return;
      const failure = toError(error);
      send(runtime, {type: 'cancel-failed', key: runtime.key, error: failure});
      notify(failure);
    } finally {
      if (current(runtime))
        void queryClient.invalidateQueries({
          queryKey: ['get_report_export', token, reportExportId, runtime.key],
        });
    }
  };
  const addAttempt = (params: StartReportExportParams) => {
    for (const job of jobs) {
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
    const runtime = resourceFor(attempt);
    store.dispatch({type: 'add', attempt});
    return runtime;
  };
  const start = async (params: StartReportExportParams) => {
    if (!isCurrentSession()) return false;
    const runtime = addAttempt(params);
    const methods = {
      scan: 'exportScanReport',
      audit: 'exportAuditReport',
      delta_scan: 'exportDeltaScanReport',
      delta_audit: 'exportDeltaAuditReport',
    } as const;
    try {
      const response = await gmp.reportexport[methods[params.kind]](
        params.payload,
      );
      if (!current(runtime)) return false;
      const attempt = store.getAttempt(runtime.key);
      const cancelRequested =
        attempt?.phase.stage === 'creating' && attempt.phase.cancelRequested;
      // gvmd reuses only pending/running exports, so a match is still generating
      const existing = store
        .getSnapshot()
        .find(
          candidate =>
            candidate.key !== runtime.key &&
            candidate.exportId === response.data.id &&
            candidate.disposition === 'awaiting',
        );
      if (existing) {
        const existingRuntime = resourceFor(existing);
        if (!existing.autoDownload)
          send(existingRuntime, {
            type: 'adopt',
            key: existing.key,
            metadata: {
              filename: params.filename,
              reportTitle: params.reportTitle,
              reportUrl: params.reportUrl,
            },
          });
        release(runtime);
        resources.current.delete(runtime.key);
        store.dispatch({type: 'remove', key: runtime.key});
        if (cancelRequested) await requestCancellation(existingRuntime);
        refreshInventory();
        return true;
      }
      dismissed.current.delete(response.data.id);
      send(runtime, {
        type: 'created',
        key: runtime.key,
        exportId: response.data.id,
      });
      refreshInventory();
      if (cancelRequested) await requestCancellation(runtime);
      return true;
    } catch (error) {
      if (!current(runtime)) return false;
      const failure = toError(error);
      send(runtime, {type: 'fail', key: runtime.key, error: failure});
      notify(failure);
      return false;
    }
  };
  const startDirect = (params: StartReportExportParams) => {
    if (!isCurrentSession()) return false;
    const key = `report-download-${uuid()}`;
    const {filename, reportTitle, reportUrl} = params;
    const setPhase = (phase: DirectDownloadPhase) =>
      setDirect(current =>
        current.owner === owner
          ? {
              owner,
              downloads: current.downloads.map(item =>
                item.key === key ? {...item, phase} : item,
              ),
            }
          : current,
      );
    setDirect(current => ({
      owner,
      downloads: [
        ...(current.owner === owner ? current.downloads : []),
        {key, filename, reportTitle, reportUrl, phase: {stage: 'downloading'}},
      ],
    }));
    const run = async () => {
      try {
        const data = await fetchDirectDownload(gmp, params);
        if (!isCurrentSession()) return;
        callbacks.current.onDownload(data, filename);
        setPhase({stage: 'complete'});
      } catch (error) {
        if (!isCurrentSession()) return;
        const failure = toError(error);
        setPhase({stage: 'failed', error: failure});
        notify(failure);
      }
    };
    void run();
    return true;
  };
  const jobFor = (key: string) => {
    const attempt = store.getAttempt(key);
    if (!attempt || !isCurrentSession()) return undefined;
    const queryKey = ['get_report_export', token, attempt.exportId, key];
    return toReportExportJob(
      attempt,
      queryClient.getQueryData<ReportExport>(queryKey),
      queryClient.getQueryState<ReportExport, Error>(queryKey)?.error,
    );
  };
  const cancel = async (key: string) => {
    const job = jobFor(key);
    const attempt = store.getAttempt(key);
    if (!job || !attempt || !getReportExportActions(job).cancel) return;
    const runtime = resourceFor(attempt);
    if (!attempt.exportId) {
      send(runtime, {type: 'queue-cancel', key});
      return;
    }
    await requestCancellation(runtime);
  };
  const dismiss = (key: string) => {
    if (
      directDownloads.some(
        item => item.key === key && item.phase.stage !== 'downloading',
      )
    ) {
      setDirect(current =>
        current.owner === owner
          ? {
              owner,
              downloads: current.downloads.filter(item => item.key !== key),
            }
          : current,
      );
      return;
    }
    const job = jobFor(key);
    if (!job || !getReportExportActions(job).dismiss) return;
    if (job.exportId) dismissed.current.add(job.exportId);
    const runtime = resources.current.get(key);
    if (runtime) release(runtime);
    resources.current.delete(key);
    void queryClient.cancelQueries({
      queryKey: ['get_report_export', token, job.exportId, key],
    });
    store.dispatch({type: 'remove', key});
  };
  const retry = async (key: string) => {
    const job = jobFor(key);
    const attempt = store.getAttempt(key);
    if (!job || !attempt || !getReportExportActions(job).retry) return;
    const runtime = resourceFor(attempt);
    if (runtime.buffer !== undefined) {
      handoff(runtime);
      return;
    }
    runtime.retries = 0;
    if (!send(runtime, {type: 'resume', key})) return;
    await queryClient.resetQueries({
      queryKey: ['get_report_export', token, attempt.exportId, key],
    });
  };
  const download = async (key: string) => {
    const job = jobFor(key);
    const attempt = store.getAttempt(key);
    if (!job || !attempt || !getReportExportActions(job).download) return;
    const runtime = resourceFor(attempt);
    runtime.mimetype = job.exportData?.contentType;
    send(runtime, {type: 'auto-download', key});
    await transfer(runtime);
  };
  const allJobs = [...jobs, ...directDownloads.map(toDirectDownloadJob)];
  return {
    start,
    startDirect,
    cancel,
    dismiss,
    retry,
    download,
    jobs: retainReportExportJobs(allJobs),
    isActive: allJobs.some(job => getReportExportActions(job).active),
    discoveryError: inventory.error,
    discoveryIncomplete: inventory.data?.incomplete ?? false,
    refreshDiscovery: refreshInventory,
  };
};

export default useReportExport;
