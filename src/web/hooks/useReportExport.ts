/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {showErrorNotification} from '@greenbone/ui-lib';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {type ReportExportPayload} from 'gmp/commands/report-export';
import {type FilterType} from 'gmp/models/filter';
import {filterString} from 'gmp/models/filter/utils';
import {
  REPORT_EXPORT_STATUS,
  type ReportExport,
} from 'gmp/models/report-export';
import {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import useUserName from 'web/hooks/useUserName';

export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';

const MAX_DOWNLOAD_RETRIES = 10;
export const REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL = 3000;

export type ReportExportKind = 'scan' | 'audit' | 'delta_scan' | 'delta_audit';

export interface StartReportExportParams {
  kind: ReportExportKind;
  payload: ReportExportPayload;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

export interface StartDirectReportDownloadParams {
  kind: ReportExportKind;
  payload: {
    report_id: string;
    format_id: string;
    config_id?: string;
    delta_report_id?: string;
    filter?: FilterType;
  };
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

export type ReportExportState =
  | {status: 'idle'; exportData?: undefined; error?: undefined}
  | {status: 'creating'; exportData?: undefined; error?: undefined}
  | {status: 'checking'; exportData: ReportExport; error?: undefined}
  | {status: 'downloaded'; exportData?: undefined; error?: undefined}
  | {
      status: 'pending' | 'running' | 'cancel_requested';
      exportData: ReportExport;
      error?: undefined;
    }
  | {status: 'done'; exportData: ReportExport; error?: undefined}
  | {status: 'canceled'; exportData: ReportExport; error?: undefined}
  | {status: 'error'; exportData?: ReportExport; error: Error};

interface UseReportExportParams {
  onDownload: (data: ArrayBuffer | string, filename: string) => void;
  activityOpen?: boolean;
  onCancelError?: (error: Error) => void;
}

export interface ReportExportJob {
  key: string;
  requestIdentity?: string;
  filename: string;
  reportTitle: string;
  state: ReportExportState;
  downloadStarted: boolean;
  downloadPending: boolean;
  directDownload: boolean;
  directPending: boolean;
  cancelPending: boolean;
  reportUrl?: string;
  cancelError?: Error;
  downloadError?: Error;
  statusError?: Error;
}

interface ExportJobRecord {
  key: string;
  requestIdentity?: string;
  exportId?: string;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
  directDownload?: boolean;
  directPending?: boolean;
  createError?: Error;
  cancelError?: Error;
  cancelRequested?: boolean;
  cancelAccepted?: boolean;
  cancelPending?: boolean;
  downloadStarted?: boolean;
  downloadError?: Error;
}

const EXPORT_STORAGE_KEY = 'gsa-report-export-jobs';
const EMPTY_EXPORT_RECORDS: ExportJobRecord[] = [];

const getExportStorageKey = (username: string) =>
  `${EXPORT_STORAGE_KEY}:${encodeURIComponent(username)}`;

const readStoredRecords = (username?: string): ExportJobRecord[] => {
  if (typeof window === 'undefined' || !username) return [];
  try {
    window.sessionStorage.removeItem(EXPORT_STORAGE_KEY);
    const stored = window.sessionStorage.getItem(getExportStorageKey(username));
    if (!stored) return [];
    const records: unknown = JSON.parse(stored);
    if (!Array.isArray(records)) return [];
    return records
      .filter(
        (record): record is ExportJobRecord =>
          Boolean(record) &&
          typeof record === 'object' &&
          typeof record.key === 'string' &&
          typeof record.filename === 'string' &&
          typeof record.reportTitle === 'string' &&
          (typeof record.exportId === 'string' ||
            (record.directDownload === true &&
              record.downloadStarted === true)),
      )
      .map(record => ({
        ...record,
        cancelPending: false,
        cancelError: undefined,
        downloadError: undefined,
      }));
  } catch {
    return [];
  }
};

const updateRecord = (
  current: ExportJobRecord[],
  key: string,
  changes: Partial<ExportJobRecord>,
) =>
  current.map(record =>
    record.key === key ? {...record, ...changes} : record,
  );

const getReportRequestIdentity = (
  kind: ReportExportKind,
  payload: ReportExportPayload,
) =>
  JSON.stringify([
    kind,
    payload.report_id,
    payload.format_id,
    payload.config_id ?? '',
    filterString(payload.filter) ?? '',
    payload.filter_id ?? '',
    payload.delta_report_id ?? '',
    payload.ignore_pagination ?? '',
    payload.lean ?? '',
  ]);

const toError = (error: unknown) => {
  if (error instanceof Error) return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return new Error(error.message);
  }
  return new Error('Unknown report export error');
};

const notifyExportErrorIfActivityClosed = (
  activityOpen: boolean,
  error: Error,
) => {
  if (!activityOpen) showErrorNotification(error.message);
};

const isActiveStatus = (status?: string) =>
  status === REPORT_EXPORT_STATUS.pending ||
  status === REPORT_EXPORT_STATUS.running ||
  status === REPORT_EXPORT_STATUS.cancelRequested;

const getTerminalState = (reportExport: ReportExport): ReportExportState => {
  if (reportExport.status === REPORT_EXPORT_STATUS.done) {
    return {status: 'done', exportData: reportExport};
  }
  if (reportExport.status === REPORT_EXPORT_STATUS.canceled) {
    return {status: 'canceled', exportData: reportExport};
  }
  return {
    status: 'error',
    exportData: reportExport,
    error: new Error(
      reportExport.errorMessage ||
        `Report export ended with status ${reportExport.status ?? 'unknown'}`,
    ),
  };
};

const getJobState = (
  record: ExportJobRecord,
  reportExport?: ReportExport,
): ReportExportState => {
  if (record.createError) {
    return {status: 'error', error: record.createError};
  }
  if (record.downloadStarted) {
    return record.directDownload
      ? {status: 'downloaded'}
      : {
          status: 'done',
          exportData: {id: record.exportId, status: REPORT_EXPORT_STATUS.done},
        };
  }
  if (record.directDownload || !record.exportId) {
    return {status: 'creating'};
  }
  if (
    record.cancelAccepted &&
    reportExport?.status === REPORT_EXPORT_STATUS.done
  ) {
    return {
      status: 'canceled',
      exportData: {
        id: record.exportId,
        status: REPORT_EXPORT_STATUS.canceled,
      },
    };
  }
  if (!reportExport) {
    return record.cancelAccepted
      ? {status: 'cancel_requested', exportData: {id: record.exportId}}
      : {status: 'checking', exportData: {id: record.exportId}};
  }
  if (record.cancelRequested && isActiveStatus(reportExport.status)) {
    return {status: 'cancel_requested', exportData: reportExport};
  }
  if (isActiveStatus(reportExport.status)) {
    return {
      status: reportExport.status as 'pending' | 'running' | 'cancel_requested',
      exportData: reportExport,
    };
  }
  return getTerminalState(reportExport);
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
  const createExportCommand = useCallback(
    ({
      kind,
      payload,
    }: {
      kind: ReportExportKind;
      payload: ReportExportPayload;
    }) => {
      switch (kind) {
        case 'scan':
          return gmp.reportexport.exportScanReport(payload);
        case 'audit':
          return gmp.reportexport.exportAuditReport(payload);
        case 'delta_scan':
          return gmp.reportexport.exportDeltaScanReport(payload);
        case 'delta_audit':
          return gmp.reportexport.exportDeltaAuditReport(payload);
      }
    },
    [gmp],
  );
  const [sessionRecords, setSessionRecords] = useState(() => ({
    token,
    username,
    records: readStoredRecords(token ? username : undefined),
  }));
  if (sessionRecords.token !== token || sessionRecords.username !== username) {
    setSessionRecords({
      token,
      username,
      records: readStoredRecords(token ? username : undefined),
    });
  }
  const records =
    token &&
    username &&
    sessionRecords.token === token &&
    sessionRecords.username === username
      ? sessionRecords.records
      : EMPTY_EXPORT_RECORDS;
  const setRecords = useCallback(
    (update: SetStateAction<ExportJobRecord[]>) => {
      setSessionRecords(current => {
        if (current.token !== token || current.username !== username)
          return current;
        return {
          ...current,
          records:
            typeof update === 'function' ? update(current.records) : update,
        };
      });
    },
    [token, username],
  );
  const activityOpenRef = useRef(activityOpen);

  useEffect(() => {
    activityOpenRef.current = activityOpen;
  }, [activityOpen]);
  const nextKeyRef = useRef(0);
  const mountedRef = useRef(true);
  const downloadStartedRef = useRef(
    new Set(
      records
        .filter(record => record.downloadStarted)
        .map(record => record.key),
    ),
  );
  const downloadInFlightRef = useRef(new Set<string>());
  const downloadRetryCountRef = useRef(new Map<string, number>());
  const downloadRetryTimerRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const cancelIntentRef = useRef(new Set<string>());
  const cancelInFlightRef = useRef(new Set<string>());
  const cancelAcceptedRef = useRef(new Set<string>());
  const heldDownloadResponseRef = useRef(
    new Map<string, {data: ArrayBuffer; filename: string}>(),
  );
  const isCurrentSession = useCallback(
    () =>
      mountedRef.current &&
      Boolean(token && username) &&
      gmp.session.token === token &&
      gmp.session.username === username,
    [gmp, token, username],
  );

  useEffect(() => {
    const restored = readStoredRecords(token ? username : undefined);
    downloadInFlightRef.current.clear();
    downloadRetryCountRef.current.clear();
    downloadRetryTimerRef.current.forEach(timer => clearTimeout(timer));
    downloadRetryTimerRef.current.clear();
    cancelIntentRef.current.clear();
    cancelInFlightRef.current.clear();
    heldDownloadResponseRef.current.clear();
    downloadStartedRef.current = new Set(
      restored
        .filter(record => record.downloadStarted)
        .map(record => record.key),
    );
    cancelAcceptedRef.current = new Set(
      restored
        .filter(record => record.cancelAccepted)
        .map(record => record.key),
    );
    return () => {
      void queryClient.cancelQueries({queryKey: ['get_report_export', token]});
    };
  }, [queryClient, token, username]);
  const removeJobRecord = useCallback(
    (key: string) => {
      setRecords(current => current.filter(item => item.key !== key));
      downloadInFlightRef.current.delete(key);
      downloadRetryCountRef.current.delete(key);
      const retryTimer = downloadRetryTimerRef.current.get(key);
      if (retryTimer) clearTimeout(retryTimer);
      downloadRetryTimerRef.current.delete(key);
      cancelIntentRef.current.delete(key);
      cancelInFlightRef.current.delete(key);
      cancelAcceptedRef.current.delete(key);
      heldDownloadResponseRef.current.delete(key);
    },
    [setRecords],
  );
  const markDownloadStarted = useCallback(
    (key: string) => {
      downloadStartedRef.current.add(key);
      downloadInFlightRef.current.delete(key);
      downloadRetryCountRef.current.delete(key);
      const retryTimer = downloadRetryTimerRef.current.get(key);
      if (retryTimer) clearTimeout(retryTimer);
      downloadRetryTimerRef.current.delete(key);
      setRecords(current =>
        updateRecord(current, key, {
          downloadStarted: true,
          directPending: false,
        }),
      );
    },
    [setRecords],
  );

  const queryRecords = records.filter(
    record => record.exportId && !record.downloadStarted,
  );
  const exportQueries = useQueries({
    queries: queryRecords.map(record => ({
      enabled: Boolean(token && username),
      queryKey: ['get_report_export', token, record.exportId, record.key],
      queryFn: async () => {
        const response = await gmp.reportexport.getReportExports({
          reportExportId: record.exportId as string,
        });
        const reportExport = response.data.find(
          exportItem => exportItem?.id === record.exportId,
        );
        if (!reportExport) {
          throw new Error(`Report export ${record.exportId} was not found`);
        }
        return reportExport;
      },
      retry: 2,
      refetchInterval: (query: {state: {data?: ReportExport}}) =>
        !query.state.data || isActiveStatus(query.state.data.status)
          ? REPORT_EXPORT_POLL_INTERVAL
          : false,
      refetchIntervalInBackground: true,
    })),
  });

  const jobs = useMemo(
    () =>
      records.map(record => {
        const queryIndex = queryRecords.findIndex(
          queryRecord => queryRecord.key === record.key,
        );
        const query = queryIndex >= 0 ? exportQueries[queryIndex] : undefined;
        const state = getJobState(record, query?.data);
        const statusError = query?.isError ? toError(query.error) : undefined;
        return {
          key: record.key,
          requestIdentity: record.requestIdentity,
          filename: record.filename,
          reportTitle: record.reportTitle,
          reportUrl: record.reportUrl,
          state,
          downloadStarted: Boolean(record.downloadStarted),
          downloadPending:
            state.status === 'done' &&
            !record.cancelAccepted &&
            !record.downloadStarted &&
            !record.downloadError,
          directDownload: Boolean(record.directDownload),
          directPending: Boolean(record.directPending),
          cancelPending: Boolean(record.cancelPending),
          cancelError: record.cancelError,
          downloadError: record.downloadError,
          statusError,
        };
      }),
    [exportQueries, queryRecords, records],
  );

  const removeCanceledJobsForReport = useCallback(
    (requestIdentity: string, reportUrl?: string) => {
      jobs
        .filter(
          job =>
            job.state.status === 'canceled' &&
            (job.requestIdentity === requestIdentity ||
              (!job.requestIdentity &&
                Boolean(reportUrl) &&
                job.reportUrl === reportUrl)),
        )
        .forEach(job => removeJobRecord(job.key));
    },
    [jobs, removeJobRecord],
  );

  const requestCancellation = useCallback(
    async (key: string, exportId: string) => {
      if (
        !isCurrentSession() ||
        cancelInFlightRef.current.has(key) ||
        cancelAcceptedRef.current.has(key)
      )
        return;
      cancelIntentRef.current.delete(key);
      cancelInFlightRef.current.add(key);
      setRecords(current =>
        updateRecord(current, key, {
          cancelPending: true,
          cancelError: undefined,
        }),
      );
      try {
        await gmp.reportexport.cancelReportExport({reportExportId: exportId});
        if (!isCurrentSession()) return;
        cancelInFlightRef.current.delete(key);
        cancelAcceptedRef.current.add(key);
        const retryTimer = downloadRetryTimerRef.current.get(key);
        if (retryTimer) clearTimeout(retryTimer);
        downloadRetryTimerRef.current.delete(key);
        downloadInFlightRef.current.delete(key);
        heldDownloadResponseRef.current.delete(key);
        setRecords(current =>
          updateRecord(current, key, {
            cancelAccepted: true,
            cancelPending: false,
            cancelRequested: true,
          }),
        );
        void queryClient.invalidateQueries({
          queryKey: ['get_report_export', token, exportId, key],
        });
      } catch (error) {
        if (!isCurrentSession()) return;
        cancelInFlightRef.current.delete(key);
        const cancellationError = toError(error);
        setRecords(current =>
          updateRecord(current, key, {
            cancelPending: false,
            cancelError: activityOpenRef.current
              ? cancellationError
              : undefined,
          }),
        );
        if (!activityOpenRef.current) {
          if (onCancelError) onCancelError(cancellationError);
          else showErrorNotification(cancellationError.message);
        }
        const heldResponse = heldDownloadResponseRef.current.get(key);
        if (heldResponse) {
          heldDownloadResponseRef.current.delete(key);
          try {
            onDownload(heldResponse.data, heldResponse.filename);
            markDownloadStarted(key);
          } catch {
            downloadInFlightRef.current.delete(key);
          }
        } else {
          void queryClient.invalidateQueries({
            queryKey: ['get_report_export', token, exportId, key],
          });
        }
      }
    },
    [
      gmp,
      isCurrentSession,
      markDownloadStarted,
      onCancelError,
      onDownload,
      queryClient,
      setRecords,
      token,
    ],
  );

  useEffect(() => {
    if (!isCurrentSession()) return;
    jobs.forEach(job => {
      const record = records.find(item => item.key === job.key);
      const queryIndex = queryRecords.findIndex(item => item.key === job.key);
      const query = queryIndex >= 0 ? exportQueries[queryIndex] : undefined;
      if (
        !record?.exportId ||
        query?.data?.status !== REPORT_EXPORT_STATUS.done ||
        record.downloadError ||
        cancelAcceptedRef.current.has(job.key) ||
        downloadStartedRef.current.has(job.key) ||
        downloadInFlightRef.current.has(job.key) ||
        downloadRetryTimerRef.current.has(job.key)
      ) {
        return;
      }

      const exportId = record.exportId;
      const attemptDownload = async () => {
        if (
          !isCurrentSession() ||
          cancelAcceptedRef.current.has(job.key) ||
          cancelInFlightRef.current.has(job.key)
        ) {
          return;
        }
        downloadInFlightRef.current.add(job.key);
        try {
          const response = await gmp.reportexport.downloadReportExport({
            reportExportId: exportId,
          });
          if (!isCurrentSession() || cancelAcceptedRef.current.has(job.key))
            return;
          if (cancelInFlightRef.current.has(job.key)) {
            heldDownloadResponseRef.current.set(job.key, {
              data: response.data,
              filename: job.filename,
            });
            downloadInFlightRef.current.delete(job.key);
            return;
          }
          onDownload(response.data, job.filename);
          markDownloadStarted(job.key);
        } catch {
          if (!isCurrentSession()) return;
          downloadInFlightRef.current.delete(job.key);
          if (
            cancelAcceptedRef.current.has(job.key) ||
            cancelInFlightRef.current.has(job.key)
          )
            return;
          const retryCount = downloadRetryCountRef.current.get(job.key) ?? 0;
          if (retryCount >= MAX_DOWNLOAD_RETRIES) {
            const error = new Error('Report export download failed');
            setRecords(current =>
              updateRecord(current, job.key, {downloadError: error}),
            );
            notifyExportErrorIfActivityClosed(activityOpenRef.current, error);
            return;
          }

          downloadRetryCountRef.current.set(job.key, retryCount + 1);
          const retryTimer = setTimeout(() => {
            if (!isCurrentSession()) return;
            downloadRetryTimerRef.current.delete(job.key);
            void attemptDownload();
          }, REPORT_EXPORT_DOWNLOAD_RETRY_INTERVAL);
          downloadRetryTimerRef.current.set(job.key, retryTimer);
        }
      };
      void attemptDownload();
    });
  }, [
    exportQueries,
    gmp,
    isCurrentSession,
    jobs,
    onDownload,
    markDownloadStarted,
    queryRecords,
    removeJobRecord,
    records,
    setRecords,
  ]);

  const start = useCallback(
    async ({
      kind,
      payload,
      filename: exportFilename,
      reportTitle: title,
      reportUrl,
    }: StartReportExportParams) => {
      if (!isCurrentSession()) return false;
      const key = `report-export-${Date.now()}-${++nextKeyRef.current}`;
      const requestIdentity = getReportRequestIdentity(kind, payload);
      const record: ExportJobRecord = {
        key,
        requestIdentity,
        filename: exportFilename,
        reportTitle: title,
        reportUrl,
      };
      removeCanceledJobsForReport(requestIdentity, reportUrl);
      setRecords(current => [...current, record]);
      try {
        const response = await createExportCommand({kind, payload});
        if (!isCurrentSession()) return false;
        setRecords(current =>
          updateRecord(current, key, {exportId: response.data.id}),
        );
        if (cancelIntentRef.current.has(key)) {
          void requestCancellation(key, response.data.id);
        }
        return true;
      } catch (error) {
        if (!isCurrentSession()) return false;
        cancelIntentRef.current.delete(key);
        const creationError = toError(error);
        notifyExportErrorIfActivityClosed(
          activityOpenRef.current,
          creationError,
        );
        if (mountedRef.current) {
          setRecords(current =>
            updateRecord(current, key, {
              cancelPending: false,
              createError: creationError,
            }),
          );
        }
        return false;
      }
    },
    [
      createExportCommand,
      isCurrentSession,
      removeCanceledJobsForReport,
      requestCancellation,
      setRecords,
    ],
  );

  const startDirect = useCallback(
    ({
      kind,
      payload,
      filename: downloadFilename,
      reportTitle: title,
      reportUrl,
    }: StartDirectReportDownloadParams) => {
      if (!isCurrentSession()) return false;
      const key = `report-download-${Date.now()}-${++nextKeyRef.current}`;
      const requestIdentity = getReportRequestIdentity(kind, payload);
      const record: ExportJobRecord = {
        key,
        requestIdentity,
        filename: downloadFilename,
        reportTitle: title,
        reportUrl,
        directDownload: true,
        directPending: true,
      };
      removeCanceledJobsForReport(requestIdentity, reportUrl);
      setRecords(current => [...current, record]);

      const download = async () => {
        try {
          const {report_id, format_id, config_id, delta_report_id, filter} =
            payload;
          const response =
            kind === 'audit' || kind === 'delta_audit'
              ? await gmp.auditreport.download(
                  {id: report_id},
                  {
                    reportFormatId: format_id,
                    deltaReportId: delta_report_id,
                    filter,
                  },
                )
              : await gmp.report.download(
                  {id: report_id},
                  {
                    reportFormatId: format_id,
                    reportConfigId: config_id ?? '',
                    deltaReportId: delta_report_id,
                    filter,
                  },
                );
          if (!isCurrentSession()) return;
          onDownload(response.data, downloadFilename);
          markDownloadStarted(key);
        } catch (error) {
          if (!isCurrentSession()) return;
          const downloadError = toError(error);
          notifyExportErrorIfActivityClosed(
            activityOpenRef.current,
            downloadError,
          );
          setRecords(current =>
            updateRecord(current, key, {
              directPending: false,
              createError: downloadError,
            }),
          );
        }
      };
      void download();
      return true;
    },
    [
      gmp,
      isCurrentSession,
      markDownloadStarted,
      onDownload,
      removeCanceledJobsForReport,
      setRecords,
    ],
  );

  const cancel = useCallback(
    async (key: string) => {
      const record = records.find(item => item.key === key);
      const job = jobs.find(item => item.key === key);
      if (
        !record ||
        !job ||
        record.directDownload ||
        job.cancelPending ||
        cancelInFlightRef.current.has(key) ||
        cancelAcceptedRef.current.has(key)
      )
        return;
      if (!record.exportId) {
        if (job.state.status !== 'creating') return;
        cancelIntentRef.current.add(key);
        setRecords(current =>
          updateRecord(current, key, {
            cancelPending: true,
            cancelError: undefined,
          }),
        );
        return;
      }
      if (
        !isActiveStatus(job.state.status) &&
        job.state.status !== 'checking' &&
        !job.downloadPending
      )
        return;
      await requestCancellation(key, record.exportId);
    },
    [jobs, records, requestCancellation, setRecords],
  );

  const dismiss = useCallback(
    (key: string) => {
      const job = jobs.find(item => item.key === key);
      if (
        !job ||
        (!job.directDownload && job.state.status === 'creating') ||
        job.downloadPending ||
        job.cancelPending ||
        isActiveStatus(job.state.status)
      ) {
        return;
      }
      removeJobRecord(key);
      downloadStartedRef.current.delete(key);
    },
    [jobs, removeJobRecord],
  );

  useEffect(() => {
    mountedRef.current = true;
    const retryTimers = downloadRetryTimerRef.current;
    return () => {
      mountedRef.current = false;
      retryTimers.forEach(timer => clearTimeout(timer));
      retryTimers.clear();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !token ||
      !username ||
      sessionRecords.token !== token ||
      sessionRecords.username !== username
    )
      return;
    const storageKey = getExportStorageKey(username);
    const recoverableRecords = records.filter(
      record =>
        record.exportId || (record.directDownload && record.downloadStarted),
    );
    try {
      if (recoverableRecords.length === 0) {
        window.sessionStorage.removeItem(storageKey);
        return;
      }
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify(recoverableRecords),
      );
    } catch {
      // Storage may be disabled or full; live export tracking still works.
    }
  }, [records, sessionRecords.token, sessionRecords.username, token, username]);

  return {
    cancel,
    dismiss,
    isActive: jobs.some(job =>
      job.directDownload
        ? job.directPending
        : job.state.status === 'creating' ||
          job.state.status === 'checking' ||
          isActiveStatus(job.state.status) ||
          job.downloadPending,
    ),
    jobs,
    start,
    startDirect,
  };
};

export default useReportExport;
