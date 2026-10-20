/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {type FilterType} from 'gmp/models/filter';
import {
  type ReportExportKind,
  type StartReportExportParams,
} from 'web/report-export/report-export-job-model';
import {generateFilename} from 'web/utils/Render';

interface ReportExportEntity {
  id: string;
  creationTime?: Date;
  modificationTime?: Date;
  task?: {name?: string};
}

interface ReportExportFormat {
  id: string;
  name?: string;
  extension?: string;
  content_type?: string;
}

interface BuildReportExportRequestParams {
  kind: ReportExportKind;
  entity: ReportExportEntity;
  format: ReportExportFormat;
  filter: FilterType;
  reportConfigId?: string;
  deltaReportId?: string;
  reportUrl?: string;
  fileNameFormat?: string;
  username?: string;
}

export const buildReportExportRequest = ({
  kind,
  entity,
  format,
  filter,
  reportConfigId,
  deltaReportId,
  reportUrl,
  fileNameFormat,
  username,
}: BuildReportExportRequestParams): StartReportExportParams => ({
  kind,
  filename: generateFilename({
    creationTime: entity.creationTime,
    extension: format.extension || 'unknown',
    fileNameFormat,
    id: entity.id,
    modificationTime: entity.modificationTime,
    reportFormat: format.name,
    resourceName: entity.task?.name,
    resourceType: 'report',
    username,
  }),
  reportTitle: entity.id,
  reportUrl,
  payload: {
    reportId: entity.id,
    reportFormatId: format.id,
    reportConfigId:
      kind === 'scan' || kind === 'delta_scan'
        ? reportConfigId || undefined
        : undefined,
    deltaReportId:
      kind === 'delta_scan' || kind === 'delta_audit'
        ? deltaReportId
        : undefined,
    filter,
  },
});
