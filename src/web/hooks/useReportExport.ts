/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {type ReportExportPayload} from 'gmp/commands/report-export';
import {
  REPORT_EXPORT_STATUS,
  type ReportExport,
} from 'gmp/models/report-export';
import {useGetActiveReportExport} from 'web/hooks/use-query/report-exports';
import useGmp from 'web/hooks/useGmp';
import useGmpMutation from 'web/queries/useGmpMutation';

export {REPORT_EXPORT_POLL_INTERVAL} from 'web/hooks/use-query/report-exports';

type ExportCommand = (
  payload: ReportExportPayload,
) => Promise<{data: {id: string}}>;

export type ReportExportState =
  | {status: 'idle'; exportData?: undefined; error?: undefined}
  | {status: 'creating'; exportData?: undefined; error?: undefined}
  | {
      status: 'pending' | 'running' | 'cancel_requested';
      exportData: ReportExport;
      error?: undefined;
    }
  | {status: 'done'; exportData: ReportExport; error?: undefined}
  | {status: 'canceled'; exportData: ReportExport; error?: undefined}
  | {status: 'error'; exportData?: ReportExport; error: Error};

interface UseReportExportParams {
  createExport: ExportCommand;
  onDownload: (data: ArrayBuffer, reportExport: ReportExport) => void;
}

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

const useReportExport = ({createExport, onDownload}: UseReportExportParams) => {
  const gmp = useGmp();
  const [exportId, setExportId] = useState<string>();
  const [workflowStatus, setWorkflowStatus] = useState<
    'idle' | 'creating' | 'cancel_requested'
  >('idle');
  const mountedRef = useRef(true);
  const workflowActiveRef = useRef(false);
  const exportIdRef = useRef<string | undefined>(undefined);
  const downloadStartedRef = useRef(false);

  const createMutation = useGmpMutation({gmpMethod: createExport});
  const cancelMutation = useGmpMutation({
    gmpMethod: (reportExportId: string) =>
      gmp.reportexport.cancelReportExport({reportExportId}),
  });
  const downloadMutation = useGmpMutation({
    gmpMethod: (reportExportId: string) =>
      gmp.reportexport.downloadReportExport({reportExportId}),
  });
  const reportExportQuery = useGetActiveReportExport(exportId);

  const state: ReportExportState = (() => {
    if (workflowStatus === 'creating' || createMutation.isPending) {
      return {status: 'creating'};
    }
    if (createMutation.isError) {
      return {status: 'error', error: toError(createMutation.error)};
    }
    if (reportExportQuery.isError || cancelMutation.isError) {
      return {
        status: 'error',
        error: toError(reportExportQuery.error ?? cancelMutation.error),
      };
    }
    const reportExport = reportExportQuery.data;
    if (!reportExport) {
      return {status: 'idle'};
    }
    if (
      workflowStatus === 'cancel_requested' &&
      isActiveStatus(reportExport.status)
    ) {
      return {
        status: 'cancel_requested',
        exportData: reportExport,
      };
    }
    return isActiveStatus(reportExport.status)
      ? {status: reportExport.status, exportData: reportExport}
      : getTerminalState(reportExport);
  })();

  useEffect(() => {
    if (
      !exportId ||
      reportExportQuery.data?.status !== REPORT_EXPORT_STATUS.done ||
      downloadStartedRef.current
    ) {
      return;
    }

    downloadStartedRef.current = true;
    const reportExport = reportExportQuery.data;
    void downloadMutation
      .mutateAsync(exportId)
      .then(response => {
        if (mountedRef.current && reportExport) {
          onDownload(response.data, reportExport);
        }
      })
      .catch(() => undefined);
  }, [downloadMutation, exportId, onDownload, reportExportQuery.data]);

  const start = useCallback(
    async (payload: ReportExportPayload) => {
      if (
        workflowActiveRef.current ||
        createMutation.isPending ||
        exportIdRef.current ||
        isActiveStatus(state.status) ||
        isActiveStatus(reportExportQuery.data?.status)
      ) {
        return false;
      }

      workflowActiveRef.current = true;
      downloadStartedRef.current = false;
      setWorkflowStatus('creating');

      try {
        const response = await createMutation.mutateAsync(payload);
        if (!mountedRef.current) return false;

        setExportId(response.data.id);
        exportIdRef.current = response.data.id;
        setWorkflowStatus('idle');
        return true;
      } catch {
        if (mountedRef.current) setWorkflowStatus('idle');
        return false;
      } finally {
        workflowActiveRef.current = false;
      }
    },
    [createMutation, reportExportQuery.data?.status, state.status],
  );

  const cancel = useCallback(async () => {
    if (!exportId || !isActiveStatus(state.status)) return;

    try {
      await cancelMutation.mutateAsync(exportId);
      if (mountedRef.current) {
        setWorkflowStatus('cancel_requested');
        void reportExportQuery.refetch();
      }
    } catch {
      // The mutation error is exposed through the query state below.
    }
  }, [cancelMutation, exportId, reportExportQuery, state.status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    cancel,
    isActive: state.status === 'creating' || isActiveStatus(state.status),
    start,
    state,
  };
};

export default useReportExport;
