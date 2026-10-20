/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo} from 'react';
import useGmp from 'web/hooks/useGmp';
import useGmpMutation from 'web/queries/useGmpMutation';
import {type StartReportExportParams} from 'web/report-export/report-export-job-model';

const EXPORT_METHODS = {
  scan: 'exportScanReport',
  audit: 'exportAuditReport',
  delta_scan: 'exportDeltaScanReport',
  delta_audit: 'exportDeltaAuditReport',
} as const;

export const useReportExportMutations = () => {
  const gmp = useGmp();
  const create = useGmpMutation<
    Pick<StartReportExportParams, 'kind' | 'payload'>,
    {data: {id: string}},
    Error
  >({
    gmpMethod: ({kind, payload}) =>
      gmp.reportexport[EXPORT_METHODS[kind]](payload),
  });
  const cancel = useGmpMutation<string, unknown, Error>({
    gmpMethod: reportExportId =>
      gmp.reportexport.cancelReportExport({reportExportId}),
  });
  const download = useGmpMutation<string, {data: ArrayBuffer}, Error>({
    gmpMethod: reportExportId =>
      gmp.reportexport.downloadReportExport({reportExportId}),
  });

  return useMemo(
    () => ({
      create: create.mutateAsync,
      cancel: cancel.mutateAsync,
      download: download.mutateAsync,
    }),
    [create.mutateAsync, cancel.mutateAsync, download.mutateAsync],
  );
};

export type ReportExportMutations = ReturnType<typeof useReportExportMutations>;
