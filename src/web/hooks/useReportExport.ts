/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {showErrorNotification} from '@greenbone/ui-lib';
import {useQueries, useQueryClient} from '@tanstack/react-query';
import {type ReportExportPayload} from 'gmp/commands/report-export';
import {type FilterType} from 'gmp/models/filter';
import {
  REPORT_EXPORT_STATUS,
  type ReportExport,
} from 'gmp/models/report-export';
import {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';

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
}

export interface ReportExportJob {
  key: string;
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
        typeof record.reportTitle === 'string' &&
        record.downloadStarted !== true,
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
  const cancelIntentRef = useRef(new Set<string>());
  const cancelInFlightRef = useRef(new Set<string>());
  const cancelAcceptedRef = useRef(new Set<string>());
  const heldDownloadResponseRef = useRef(
    new Map<string, {data: ArrayBuffer; filename: string}>(),
  );
  const removeJobRecord = useCallback((key: string) => {
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
  }, []);

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
        if (record.directDownload && record.createError) {
          state = {status: 'error', error: record.createError};
        } else if (record.directDownload) {
          state = {status: 'creating'};
        } else if (
          record.cancelAccepted &&
          query?.data?.status === REPORT_EXPORT_STATUS.done
        ) {
          state = {
            status: 'canceled',
            exportData: {
              id: record.exportId,
              status: REPORT_EXPORT_STATUS.canceled,
            },
          };
        } else if (record.createError) {
          state = {status: 'error', error: record.createError};
        } else if (!record.exportId) {
          state = {status: 'creating'};
        } else if (!query?.data) {
          state = record.cancelAccepted
            ? {status: 'cancel_requested', exportData: {id: record.exportId}}
            : {status: 'checking', exportData: {id: record.exportId}};
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

  const requestCancellation = useCallback(
    async (key: string, exportId: string) => {
      if (
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
        if (!mountedRef.current) return;
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
          queryKey: ['get_report_export', token, exportId],
        });
      } catch (error) {
        if (!mountedRef.current) return;
        cancelInFlightRef.current.delete(key);
        const cancellationError = toError(error);
        setRecords(current =>
          updateRecord(current, key, {
            cancelPending: false,
            cancelError: cancellationError,
          }),
        );
        showErrorNotification(cancellationError.message);
        const heldResponse = heldDownloadResponseRef.current.get(key);
        if (heldResponse) {
          heldDownloadResponseRef.current.delete(key);
          try {
            onDownload(heldResponse.data, heldResponse.filename);
            downloadStartedRef.current.add(key);
            removeJobRecord(key);
          } catch {
            downloadInFlightRef.current.delete(key);
          }
        } else {
          void queryClient.invalidateQueries({
            queryKey: ['get_report_export', token, exportId],
          });
        }
      }
    },
    [gmp, onDownload, queryClient, removeJobRecord, token],
  );

  useEffect(() => {
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
          !mountedRef.current ||
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
          if (!mountedRef.current || cancelAcceptedRef.current.has(job.key))
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
          downloadStartedRef.current.add(job.key);
          removeJobRecord(job.key);
        } catch {
          downloadInFlightRef.current.delete(job.key);
          if (
            !mountedRef.current ||
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
            showErrorNotification(error.message);
            return;
          }

          downloadRetryCountRef.current.set(job.key, retryCount + 1);
          const retryTimer = setTimeout(() => {
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
    jobs,
    onDownload,
    queryRecords,
    removeJobRecord,
    records,
  ]);

  const start = useCallback(
    async ({
      kind,
      payload,
      filename: exportFilename,
      reportTitle: title,
      reportUrl,
    }: StartReportExportParams) => {
      const key = `report-export-${Date.now()}-${++nextKeyRef.current}`;
      const record: ExportJobRecord = {
        key,
        filename: exportFilename,
        reportTitle: title,
        reportUrl,
      };
      setRecords(current => [...current, record]);
      try {
        const response = await createExportCommand({kind, payload});
        if (!mountedRef.current) return false;
        setRecords(current =>
          updateRecord(current, key, {exportId: response.data.id}),
        );
        if (cancelIntentRef.current.has(key)) {
          void requestCancellation(key, response.data.id);
        }
        return true;
      } catch (error) {
        cancelIntentRef.current.delete(key);
        showErrorNotification(toError(error).message);
        if (mountedRef.current) {
          setRecords(current =>
            updateRecord(current, key, {
              cancelPending: false,
              createError: toError(error),
            }),
          );
        }
        return false;
      }
    },
    [createExportCommand, requestCancellation],
  );

  const startDirect = useCallback(
    ({
      kind,
      payload,
      filename: downloadFilename,
      reportTitle: title,
      reportUrl,
    }: StartDirectReportDownloadParams) => {
      const key = `report-download-${Date.now()}-${++nextKeyRef.current}`;
      const record: ExportJobRecord = {
        key,
        filename: downloadFilename,
        reportTitle: title,
        reportUrl,
        directDownload: true,
        directPending: true,
      };
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
          if (!mountedRef.current) return;
          onDownload(response.data, downloadFilename);
          downloadStartedRef.current.add(key);
          removeJobRecord(key);
        } catch (error) {
          if (!mountedRef.current) return;
          const downloadError = toError(error);
          showErrorNotification(downloadError.message);
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
    [gmp, onDownload, removeJobRecord],
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
    [jobs, records, requestCancellation],
  );

  const dismiss = useCallback(
    (key: string) => {
      const job = jobs.find(item => item.key === key);
      if (
        !job ||
        job.state.status === 'creating' ||
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
        isActiveStatus(job.state.status) ||
        job.downloadPending ||
        job.directPending,
    ),
    jobs,
    start,
    startDirect,
  };
};

export default useReportExport;
