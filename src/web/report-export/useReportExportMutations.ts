/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo} from 'react';
import {useMutation} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';
import {fetchDirectDownload} from 'web/report-export/direct-download';
import {type StartReportExportParams} from 'web/report-export/report-export-job-model';

const EXPORT_METHODS = {
  scan: 'exportScanReport',
  audit: 'exportAuditReport',
  delta_scan: 'exportDeltaScanReport',
  delta_audit: 'exportDeltaAuditReport',
} as const;

export const useReportExportMutations = (token?: string) => {
  const gmp = useGmp();
  const create = useMutation({
    mutationKey: ['report-export', 'create', token],
    mutationFn: ({
      kind,
      payload,
    }: Pick<StartReportExportParams, 'kind' | 'payload'>) =>
      gmp.reportexport[EXPORT_METHODS[kind]](payload),
    retry: false,
  });
  const cancel = useMutation({
    mutationKey: ['report-export', 'cancel', token],
    mutationFn: (reportExportId: string) =>
      gmp.reportexport.cancelReportExport({reportExportId}),
    retry: false,
  });
  const download = useMutation({
    mutationKey: ['report-export', 'download', token],
    mutationFn: (reportExportId: string) =>
      gmp.reportexport.downloadReportExport({reportExportId}),
    retry: false,
  });
  const direct = useMutation({
    mutationKey: ['report-export', 'direct-download', token],
    mutationFn: (params: StartReportExportParams) =>
      fetchDirectDownload(gmp, params),
    retry: false,
  });

  return useMemo(
    () => ({
      create: create.mutateAsync,
      cancel: cancel.mutateAsync,
      download: download.mutateAsync,
      direct: direct.mutateAsync,
    }),
    [
      create.mutateAsync,
      cancel.mutateAsync,
      download.mutateAsync,
      direct.mutateAsync,
    ],
  );
};

export type ReportExportMutations = ReturnType<typeof useReportExportMutations>;
