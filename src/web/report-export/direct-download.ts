/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Gmp from 'gmp/gmp';
import {
  type ReportExportJob,
  type StartReportExportParams,
} from 'web/report-export/job';

export interface DirectDownload {
  key: string;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
  view:
    | {kind: 'downloading' | 'complete'}
    | {kind: 'failed'; reason: 'export'; error: Error};
}

export const fetchDirectDownload = async (
  gmp: Pick<Gmp, 'report' | 'auditreport'>,
  {kind, payload}: Pick<StartReportExportParams, 'kind' | 'payload'>,
) => {
  const {report_id, format_id, config_id, delta_report_id, filter} = payload;
  const options = {
    reportFormatId: format_id,
    deltaReportId: delta_report_id,
    filter,
  };
  const response =
    kind === 'audit' || kind === 'delta_audit'
      ? await gmp.auditreport.download({id: report_id}, options)
      : await gmp.report.download(
          {id: report_id},
          {...options, reportConfigId: config_id ?? ''},
        );
  return response.data;
};

export const toDirectDownloadJob = (
  download: DirectDownload,
): ReportExportJob => ({
  ...download,
  origin: 'local',
  autoDownload: true,
  disposition: download.view.kind === 'complete' ? 'handed-off' : 'awaiting',
  transport: 'direct',
});
