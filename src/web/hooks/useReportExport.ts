/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {showErrorNotification} from '@greenbone/ui-lib';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {type ReportExportPayload} from 'gmp/commands/report-export';
import {
  REPORT_EXPORT_STATUS,
  type ReportExport,
} from 'gmp/models/report-export';
import {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';

export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';

const MAX_DOWNLOAD_RETRIES = 10;

export type ReportExportKind = 'scan' | 'audit' | 'delta_scan' | 'delta_audit';

export interface StartReportExportParams {
  kind: ReportExportKind;
  payload: ReportExportPayload;
  filename: string;
  reportTitle: string;
}

export type ReportExportState =
  | {status: 'idle'; exportData?: undefined; error?: undefined}
  | {status: 'creating'; exportData?: undefined; error?: undefined}
  | {status: 'checking'; exportData: ReportExport; error?: undefined}
  | {
      status: 'pending' | 'running' | 'cancel_requested';
      exportData: ReportExport;
      error?: undefined;
    }
  | {status: 'done'; exportData: ReportExport; error?: undefined}
  | {status: 'canceled'; exportData: ReportExport; error?: undefined}
  | {status: 'error'; exportData?: ReportExport; error: Error};

interface UseReportExportParams {
  onDownload: (data: ArrayBuffer, filename: string) => void;
}

export interface ReportExportJob {
  key: string;
  filename: string;
  reportTitle: string;
  state: ReportExportState;
  downloadStarted: boolean;
  cancelError?: Error;
  downloadError?: Error;
  statusError?: Error;
}

interface ExportJobRecord {
  key: string;
  exportId?: string;
  filename: string;
  reportTitle: string;
  createError?: Error;
  cancelError?: Error;
  cancelRequested?: boolean;
  downloadStarted?: boolean;
  downloadError?: Error;
}

const EXPORT_STORAGE_KEY = 'gsa-report-export-jobs';

const readStoredRecords = (): ExportJobRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.sessionStorage.getItem(EXPORT_STORAGE_KEY);
    if (!stored) return [];
    const records: unknown = JSON.parse(stored);
    if (!Array.isArray(records)) return [];
    return records.filter(
      (record): record is ExportJobRecord =>
        Boolean(record) &&
        typeof record === 'object' &&
        typeof record.key === 'string' &&
        typeof record.exportId === 'string' &&
        typeof record.filename === 'string' &&
        typeof record.reportTitle === 'string',
    );
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

const useReportExport = ({onDownload}: UseReportExportParams) => {
  const gmp = useGmp();
  const token = useSessionToken();
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
  const [records, setRecords] = useState<ExportJobRecord[]>(readStoredRecords);
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

  const queryRecords = records.filter(record => record.exportId);
  const exportQueries = useQueries({
    queries: queryRecords.map(record => ({
      enabled: Boolean(token),
      queryKey: ['get_report_export', token, record.exportId],
      queryFn: async () => {
        const response = await gmp.reportexport.getReportExports({
          reportExportId: record.exportId as string,
        });
        const reportExport = response.data[0];
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
        let state: ReportExportState;
        const statusError = query?.isError ? toError(query.error) : undefined;
        if (record.createError) {
          state = {status: 'error', error: record.createError};
        } else if (!record.exportId) {
          state = {status: 'creating'};
        } else if (!query?.data) {
          state = {status: 'checking', exportData: {id: record.exportId}};
        } else if (
          record.cancelRequested &&
          isActiveStatus(query.data.status)
        ) {
          state = {status: 'cancel_requested', exportData: query.data};
        } else {
          state = isActiveStatus(query.data.status)
            ? {
                status: query.data.status as
                  | 'pending'
                  | 'running'
                  | 'cancel_requested',
                exportData: query.data,
              }
            : getTerminalState(query.data);
        }
        return {
          key: record.key,
          filename: record.filename,
          reportTitle: record.reportTitle,
          state,
          downloadStarted: Boolean(record.downloadStarted),
          cancelError: record.cancelError,
          downloadError: record.downloadError,
          statusError,
        };
      }),
    [exportQueries, queryRecords, records],
  );

  useEffect(() => {
    jobs.forEach(job => {
      const record = records.find(item => item.key === job.key);
      const queryIndex = queryRecords.findIndex(item => item.key === job.key);
      const query = queryIndex >= 0 ? exportQueries[queryIndex] : undefined;
      if (
        !record?.exportId ||
        query?.data?.status !== REPORT_EXPORT_STATUS.done ||
        downloadStartedRef.current.has(job.key) ||
        downloadInFlightRef.current.has(job.key)
      ) {
        return;
      }

      downloadInFlightRef.current.add(job.key);
      void gmp.reportexport
        .downloadReportExport({reportExportId: record.exportId})
        .then(response => {
          downloadStartedRef.current.add(job.key);
          if (mountedRef.current) {
            onDownload(response.data, job.filename);
            setRecords(current =>
              updateRecord(current, job.key, {downloadStarted: true}),
            );
          }
        })
        .catch(() => {
          downloadInFlightRef.current.delete(job.key);
          const retryCount = downloadRetryCountRef.current.get(job.key) ?? 0;
          if (retryCount >= MAX_DOWNLOAD_RETRIES) {
            if (mountedRef.current) {
              const error = new Error('Report export download failed');
              setRecords(current =>
                updateRecord(current, job.key, {downloadError: error}),
              );
              showErrorNotification(error.message);
            }
            return;
          }

          downloadRetryCountRef.current.set(job.key, retryCount + 1);
          const retryTimer = setTimeout(() => {
            downloadRetryTimerRef.current.delete(job.key);
            if (mountedRef.current && record.exportId) {
              void queryClient.invalidateQueries({
                queryKey: ['get_report_export', token, record.exportId],
              });
            }
          }, REPORT_EXPORT_POLL_INTERVAL);
          downloadRetryTimerRef.current.set(job.key, retryTimer);
        });
    });
  }, [
    exportQueries,
    gmp,
    jobs,
    onDownload,
    queryClient,
    queryRecords,
    records,
    token,
  ]);

  const start = useCallback(
    async ({
      kind,
      payload,
      filename: exportFilename,
      reportTitle: title,
    }: StartReportExportParams) => {
      const key = `report-export-${Date.now()}-${++nextKeyRef.current}`;
      const record: ExportJobRecord = {
        key,
        filename: exportFilename,
        reportTitle: title,
      };
      setRecords(current => [...current, record]);
      try {
        const response = await createExportCommand({kind, payload});
        if (!mountedRef.current) return false;
        setRecords(current =>
          updateRecord(current, key, {exportId: response.data.id}),
        );
        return true;
      } catch (error) {
        showErrorNotification(toError(error).message);
        if (mountedRef.current) {
          setRecords(current =>
            updateRecord(current, key, {createError: toError(error)}),
          );
        }
        return false;
      }
    },
    [createExportCommand],
  );

  const cancel = useCallback(
    async (key: string) => {
      const record = records.find(item => item.key === key);
      const job = jobs.find(item => item.key === key);
      if (!record?.exportId || !job || !isActiveStatus(job.state.status))
        return;
      setRecords(current =>
        updateRecord(current, key, {cancelError: undefined}),
      );
      try {
        await gmp.reportexport.cancelReportExport({
          reportExportId: record.exportId,
        });
        if (mountedRef.current) {
          setRecords(current =>
            updateRecord(current, key, {cancelRequested: true}),
          );
          void queryClient.invalidateQueries({
            queryKey: ['get_report_export', token, record.exportId],
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          const cancellationError = toError(error);
          setRecords(current =>
            updateRecord(current, key, {cancelError: cancellationError}),
          );
          showErrorNotification(cancellationError.message);
        }
      }
    },
    [gmp, jobs, queryClient, records, token],
  );

  const dismiss = useCallback(
    (key: string) => {
      const job = jobs.find(item => item.key === key);
      if (
        !job ||
        job.state.status === 'creating' ||
        isActiveStatus(job.state.status)
      ) {
        return;
      }
      setRecords(current => current.filter(item => item.key !== key));
      downloadStartedRef.current.delete(key);
      downloadInFlightRef.current.delete(key);
      downloadRetryCountRef.current.delete(key);
      const retryTimer = downloadRetryTimerRef.current.get(key);
      if (retryTimer) clearTimeout(retryTimer);
      downloadRetryTimerRef.current.delete(key);
    },
    [jobs],
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
    if (typeof window === 'undefined') return;
    const recoverableRecords = records.filter(record => record.exportId);
    if (recoverableRecords.length === 0) {
      window.sessionStorage.removeItem(EXPORT_STORAGE_KEY);
      return;
    }
    try {
      window.sessionStorage.setItem(
        EXPORT_STORAGE_KEY,
        JSON.stringify(recoverableRecords),
      );
    } catch {
      // Storage may be disabled or full; live export tracking still works.
    }
  }, [records]);

  return {
    cancel,
    dismiss,
    isActive: jobs.some(
      job =>
        job.state.status === 'creating' ||
        job.state.status === 'checking' ||
        isActiveStatus(job.state.status),
    ),
    jobs,
    start,
  };
};

export default useReportExport;
