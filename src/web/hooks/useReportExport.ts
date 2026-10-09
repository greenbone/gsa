/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useEffectEvent, useRef, useState} from 'react';
import {showErrorNotification} from '@greenbone/ui-lib';
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
  type ExportAttempt,
  type StartReportExportParams,
  type StartDirectReportDownloadParams,
  getReportExportActions,
  isPermanentExportError,
  toReportExportJob,
  retainReportExportJobs,
  selectReportExportInventory,
} from 'web/pages/reports/report-export-job';
import {
  readExportIntents,
  writeExportIntents,
} from 'web/pages/reports/report-export-storage';
import {ROUTES} from 'web/route-paths';

export type {
  ReportExportJob,
  ReportExportKind,
  ReportExportState,
  StartReportExportParams,
  StartDirectReportDownloadParams,
} from 'web/pages/reports/report-export-job';
export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';
export const REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL = 3000;
const MAX_DOWNLOAD_RETRIES = 10;
const EMPTY_ATTEMPTS: ExportAttempt[] = [];

interface UseReportExportParams {
  onDownload: (
    data: ArrayBuffer | string,
    filename: string,
    mimetype?: string,
  ) => void;
  activityOpen?: boolean;
  onCancelError?: (error: Error) => void;
}

interface AttemptRuntime {
  attempt: ExportAttempt;
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
const recoveredAttempt = (item: ReportExport): ExportAttempt => {
  let reportUrl: string | undefined;
  if (item.reportId && validId(item.reportId)) {
    if (item.type === 'audit')
      reportUrl = ROUTES.auditReport.url(item.reportId);
    if (item.type === 'scan') reportUrl = ROUTES.report.url(item.reportId);
  }
  const extension = item.extension?.replace(/^\./, '');
  return {
    key: `recovered-${item.id}`,
    exportId: item.id,
    filename: `report-${item.id}.${extension && /^[a-zA-Z0-9]{1,16}$/.test(extension) ? extension : 'bin'}`,
    reportTitle: item.name || item.reportId || item.id || '',
    reportUrl,
    autoDownload: false,
    disposition: 'awaiting',
    phase: {stage: 'tracking'},
  };
};

const useReportExport = ({
  onDownload,
  activityOpen = false,
  onCancelError,
}: UseReportExportParams) => {
  const gmp = useGmp();
  const token = useSessionToken();
  const username = useUserName();
  const queryClient = useQueryClient();
  const owner = `${token ?? ''}\0${username ?? ''}`;
  const [sessionRecords, setSessionRecords] = useState(() => ({
    owner,
    records: token ? loadAttempts(username) : [],
  }));
  if (sessionRecords.owner !== owner)
    setSessionRecords({owner, records: token ? loadAttempts(username) : []});
  const records =
    sessionRecords.owner === owner ? sessionRecords.records : EMPTY_ATTEMPTS;
  const resources = useRef(new Map<string, AttemptRuntime>());
  const dismissed = useRef(new Set<string>());
  const mounted = useRef(false);
  const callbacks = useRef({onDownload, activityOpen, onCancelError});
  useEffect(() => {
    callbacks.current = {onDownload, activityOpen, onCancelError};
  }, [onDownload, activityOpen, onCancelError]);
  const inventory = useReportExportInventory();
  const isCurrentSession = useCallback(
    () =>
      mounted.current &&
      Boolean(token && username) &&
      gmp.session.token === token &&
      gmp.session.username === username,
    [gmp, token, username],
  );
  const current = (runtime: AttemptRuntime) =>
    isCurrentSession() &&
    resources.current.get(runtime.attempt.key) === runtime;
  const update = (runtime: AttemptRuntime, changes: Partial<ExportAttempt>) => {
    if (!current(runtime)) return;
    runtime.attempt = {...runtime.attempt, ...changes};
    setSessionRecords(previous =>
      previous.owner !== owner
        ? previous
        : {
            ...previous,
            records: previous.records.map(item =>
              item.key === runtime.attempt.key ? runtime.attempt : item,
            ),
          },
    );
  };
  const resourceFor = useCallback((attempt: ExportAttempt) => {
    let runtime = resources.current.get(attempt.key);
    if (!runtime) {
      runtime = {attempt, retries: 0};
      resources.current.set(attempt.key, runtime);
    }
    return runtime;
  }, []);
  const notify = (error: Error) => {
    if (!callbacks.current.activityOpen) showErrorNotification(error.message);
  };
  const refreshInventory = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['get_report_exports', token, username],
    });
  }, [queryClient, token, username]);
  useEffect(() => {
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
  }, [owner, queryClient, token, username]);
  useEffect(() => {
    if (activityOpen) refreshInventory();
  }, [activityOpen, refreshInventory]);
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
    setSessionRecords(previous => {
      if (previous.owner !== owner) return previous;
      const known = new Set(previous.records.map(item => item.exportId));
      const additions = visible
        .filter(
          item =>
            item.id &&
            validId(item.id) &&
            !known.has(item.id) &&
            !dismissed.current.has(item.id),
        )
        .map(recoveredAttempt);
      return additions.length
        ? {...previous, records: [...previous.records, ...additions]}
        : previous;
    });
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
        attempt.phase.stage !== 'creating' &&
        attempt.phase.stage !== 'handoff-failed' &&
        attempt.phase.stage !== 'transferring' &&
        attempt.phase.stage !== 'failed',
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
  const retained = new Set(retainReportExportJobs(jobs).map(job => job.key));
  if (retained.size < records.length) {
    setSessionRecords(previous =>
      previous.owner !== owner
        ? previous
        : {
            ...previous,
            records: previous.records.filter(item => retained.has(item.key)),
          },
    );
  }
  const persistIntents = useEffectEvent(() => {
    if (!isCurrentSession() || !username) return;
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
      const {attempt} = runtime;
      release(runtime);
      resources.current.delete(key);
      if (attempt.exportId) dismissed.current.add(attempt.exportId);
      void queryClient.cancelQueries({
        queryKey: ['get_report_export', token, attempt.exportId, attempt.key],
      });
    }
  }, [records, owner, resourceFor, queryClient, token]);
  const handoff = (runtime: AttemptRuntime) => {
    if (!current(runtime) || runtime.buffer === undefined) return;
    try {
      if (runtime.mimetype)
        callbacks.current.onDownload(
          runtime.buffer,
          runtime.attempt.filename,
          runtime.mimetype,
        );
      else
        callbacks.current.onDownload(runtime.buffer, runtime.attempt.filename);
      update(runtime, {
        phase: {stage: 'handed-off'},
        disposition: 'handed-off',
      });
      release(runtime);
      refreshInventory();
    } catch (error) {
      const failure = toError(error);
      update(runtime, {phase: {stage: 'handoff-failed', error: failure}});
      notify(failure);
    }
  };
  const transfer = async (runtime: AttemptRuntime) => {
    if (
      !current(runtime) ||
      runtime.attempt.phase.stage === 'transferring' ||
      runtime.attempt.phase.stage === 'canceling'
    )
      return;
    if (runtime.buffer !== undefined) {
      handoff(runtime);
      return;
    }
    const reportExportId = runtime.attempt.exportId;
    if (!reportExportId) return;
    update(runtime, {phase: {stage: 'transferring'}});
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
        update(runtime, {phase: {stage: 'waiting'}});
        runtime.timer = setTimeout(async () => {
          runtime.timer = undefined;
          if (!current(runtime)) return;
          try {
            const data = await queryClient.query({
              ...reportExportQueryOptions(
                gmp,
                token,
                runtime.attempt.exportId,
                runtime.attempt.key,
              ),
              staleTime: 0,
            });
            if (!current(runtime)) return;
            if (data.status === 'done') {
              void transfer(runtime);
              return;
            }
            update(runtime, {phase: {stage: 'tracking'}});
          } catch (lookupError) {
            if (!current(runtime)) return;
            update(runtime, {
              phase: {stage: 'waiting', error: toError(lookupError)},
            });
          }
        }, REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL);
      } else {
        update(runtime, {phase: {stage: 'waiting', error: failure}});
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
        (attempt.phase.stage !== 'tracking' &&
          attempt.phase.stage !== 'cancel-requested')
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
    const reportExportId = runtime.attempt.exportId;
    if (!reportExportId) return;
    update(runtime, {phase: {stage: 'canceling'}, cancelError: undefined});
    try {
      await gmp.reportexport.cancelReportExport({reportExportId});
      if (current(runtime))
        update(runtime, {phase: {stage: 'cancel-requested'}});
    } catch (error) {
      if (!current(runtime)) return;
      const failure = toError(error);
      update(runtime, {
        phase: {stage: 'tracking'},
        cancelError: callbacks.current.activityOpen ? failure : undefined,
      });
      if (!callbacks.current.activityOpen)
        callbacks.current.onCancelError?.(failure);
    } finally {
      if (current(runtime))
        void queryClient.invalidateQueries({
          queryKey: [
            'get_report_export',
            token,
            runtime.attempt.exportId,
            runtime.attempt.key,
          ],
        });
    }
  };
  const addAttempt = (
    params: StartReportExportParams,
    directDownload = false,
  ) => {
    for (const job of jobs) {
      if (
        params.reportUrl &&
        job.reportUrl === params.reportUrl &&
        job.state.status === 'canceled'
      )
        dismiss(job.key);
    }
    const attempt: ExportAttempt = {
      key: `report-${directDownload ? 'download' : 'export'}-${uuid()}`,
      filename: params.filename,
      reportTitle: params.reportTitle,
      reportUrl: params.reportUrl,
      directDownload,
      autoDownload: true,
      disposition: 'awaiting',
      phase: {stage: directDownload ? 'transferring' : 'creating'},
    };
    const runtime = resourceFor(attempt);
    setSessionRecords(previous =>
      previous.owner !== owner
        ? previous
        : {...previous, records: [...previous.records, attempt]},
    );
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
      const cancelRequested =
        runtime.attempt.phase.stage === 'creating' &&
        runtime.attempt.phase.cancelRequested;
      const existing = [...resources.current.values()].find(candidate => {
        if (
          candidate === runtime ||
          candidate.attempt.exportId !== response.data.id ||
          candidate.attempt.disposition !== 'awaiting'
        )
          return false;
        const data = queryClient.getQueryData<ReportExport>([
          'get_report_export',
          token,
          candidate.attempt.exportId,
          candidate.attempt.key,
        ]);
        return (
          data?.status !== 'error' &&
          data?.status !== 'expired' &&
          data?.status !== 'canceled'
        );
      });
      if (existing) {
        if (!existing.attempt.autoDownload)
          update(existing, {
            autoDownload: true,
            filename: params.filename,
            reportTitle: params.reportTitle,
            reportUrl: params.reportUrl,
          });
        release(runtime);
        resources.current.delete(runtime.attempt.key);
        setSessionRecords(previous =>
          previous.owner !== owner
            ? previous
            : {
                ...previous,
                records: previous.records.filter(
                  item => item.key !== runtime.attempt.key,
                ),
              },
        );
        if (cancelRequested && existing.attempt.phase.stage !== 'transferring')
          await requestCancellation(existing);
        refreshInventory();
        return true;
      }
      dismissed.current.delete(response.data.id);
      update(runtime, {
        exportId: response.data.id,
        phase: {stage: cancelRequested ? 'canceling' : 'tracking'},
      });
      refreshInventory();
      if (cancelRequested) await requestCancellation(runtime);
      return true;
    } catch (error) {
      if (!current(runtime)) return false;
      const failure = toError(error);
      update(runtime, {phase: {stage: 'failed', error: failure}});
      notify(failure);
      return false;
    }
  };
  const startDirect = (params: StartDirectReportDownloadParams) => {
    if (!isCurrentSession()) return false;
    const runtime = addAttempt(params, true);
    const {report_id, format_id, config_id, delta_report_id, filter} =
      params.payload;
    const fetch = async () => {
      try {
        const options = {
          reportFormatId: format_id,
          deltaReportId: delta_report_id,
          filter,
        };
        const response =
          params.kind === 'audit' || params.kind === 'delta_audit'
            ? await gmp.auditreport.download({id: report_id}, options)
            : await gmp.report.download(
                {id: report_id},
                {...options, reportConfigId: config_id ?? ''},
              );
        if (!current(runtime)) return;
        runtime.buffer = response.data;
        handoff(runtime);
      } catch (error) {
        if (!current(runtime)) return;
        const failure = toError(error);
        update(runtime, {phase: {stage: 'failed', error: failure}});
        notify(failure);
      }
    };
    void fetch();
    return true;
  };
  const cancel = async (key: string) => {
    const job = jobs.find(item => item.key === key);
    const attempt = records.find(item => item.key === key);
    if (!job || !attempt || !getReportExportActions(job).cancel) return;
    const runtime = resourceFor(attempt);
    if (runtime.attempt.phase.stage === 'canceling') return;
    if (!runtime.attempt.exportId) {
      update(runtime, {phase: {stage: 'creating', cancelRequested: true}});
      return;
    }
    await requestCancellation(runtime);
  };
  const dismiss = (key: string) => {
    const job = jobs.find(item => item.key === key);
    if (!job || !getReportExportActions(job).dismiss) return;
    if (job.exportId) dismissed.current.add(job.exportId);
    const runtime = resources.current.get(key);
    if (runtime) release(runtime);
    resources.current.delete(key);
    void queryClient.cancelQueries({
      queryKey: ['get_report_export', token, job.exportId, key],
    });
    setSessionRecords(previous =>
      previous.owner !== owner
        ? previous
        : {
            ...previous,
            records: previous.records.filter(item => item.key !== key),
          },
    );
  };
  const retry = async (key: string) => {
    const job = jobs.find(item => item.key === key);
    const attempt = records.find(item => item.key === key);
    if (!job || !attempt || !getReportExportActions(job).retry) return;
    const runtime = resourceFor(attempt);
    if (runtime.buffer !== undefined) {
      handoff(runtime);
      return;
    }
    runtime.retries = 0;
    update(runtime, {phase: {stage: 'tracking'}, disposition: 'awaiting'});
    await queryClient.resetQueries({
      queryKey: ['get_report_export', token, attempt.exportId, key],
    });
  };
  const download = async (key: string) => {
    const job = jobs.find(item => item.key === key);
    const attempt = records.find(item => item.key === key);
    if (!job || !attempt || !getReportExportActions(job).download) return;
    const runtime = resourceFor(attempt);
    runtime.mimetype = job.state.exportData?.contentType;
    update(runtime, {autoDownload: true});
    await transfer(runtime);
  };
  return {
    start,
    startDirect,
    cancel,
    dismiss,
    retry,
    download,
    jobs: retainReportExportJobs(jobs),
    isActive: jobs.some(job => getReportExportActions(job).active),
    discoveryError: inventory.error,
    discoveryIncomplete: inventory.data?.incomplete ?? false,
  };
};

export default useReportExport;
