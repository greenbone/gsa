/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityModelProperties} from 'gmp/models/entity-model';

export const REPORT_EXPORT_STATUS = {
  pending: 'pending',
  running: 'running',
  done: 'done',
  error: 'error',
  cancelRequested: 'cancel_requested',
  canceled: 'canceled',
  expired: 'expired',
} as const;

export type ReportExportStatus =
  (typeof REPORT_EXPORT_STATUS)[keyof typeof REPORT_EXPORT_STATUS];

export const REPORT_EXPORT_PROGRESS = {
  queued: 'queued',
  preparing: 'preparing',
  generating: 'generating',
  completed: 'completed',
} as const;

export type ReportExportProgress =
  (typeof REPORT_EXPORT_PROGRESS)[keyof typeof REPORT_EXPORT_PROGRESS];

export interface ReportExport extends Pick<
  EntityModelProperties,
  'owner' | 'name' | 'creationTime' | 'modificationTime'
> {
  id?: string;
  type?: string;
  status?: ReportExportStatus | (string & {});
  progress?: ReportExportProgress | (string & {});
  reportId?: string;
  deltaReportId?: string;
  reportFormatId?: string;
  reportConfigId?: string;
  fileSize?: number;
  contentType?: string;
  extension?: string;
  errorMessage?: string;
  attemptCount?: number;
  createdTime?: string;
  startTime?: string;
  endTime?: string;
}
