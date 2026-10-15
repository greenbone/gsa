/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type ReportExport from 'gmp/models/report-export';
import {type ReportExportAttempt} from 'web/report-export/report-export-job';
import {readStoredReportExportAttempts} from 'web/report-export/utils/report-export-attempt-store-utils';
import {ROUTES} from 'web/route-paths';

export const isValidGmpIdentifier = (identifier?: string) =>
  Boolean(identifier && /^[a-zA-Z0-9-]+$/.test(identifier));

export const restoreReportExportAttempts = (
  username?: string,
): ReportExportAttempt[] =>
  readStoredReportExportAttempts(username).map(record => {
    let stage: 'tracking' | 'handed-off' | 'abandoned' = 'tracking';
    if (record.disposition === 'handed-off') stage = 'handed-off';
    if (record.disposition === 'abandoned') stage = 'abandoned';
    return {...record, phase: {stage}};
  });

const getReportUrlForExport = ({
  type,
  reportId,
  deltaReportId,
}: ReportExport) => {
  if (!reportId || !isValidGmpIdentifier(reportId)) return undefined;
  const delta =
    deltaReportId && isValidGmpIdentifier(deltaReportId)
      ? deltaReportId
      : undefined;
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

export const createRecoveredReportExportAttempt = (
  reportExport: ReportExport,
): ReportExportAttempt => {
  const extension = reportExport.extension?.replace(/^\./, '');
  return {
    key: `recovered-${reportExport.id}`,
    origin: 'discovered',
    exportId: reportExport.id,
    filename: `report-${reportExport.id}.${extension && /^[a-zA-Z0-9]{1,16}$/.test(extension) ? extension : 'bin'}`,
    reportTitle: reportExport.name || reportExport.reportId || reportExport.id,
    reportUrl: getReportUrlForExport(reportExport),
    autoDownload: false,
    disposition: 'awaiting',
    phase: {stage: 'tracking'},
  };
};
