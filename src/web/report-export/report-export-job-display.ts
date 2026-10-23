/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type TranslateFunc} from 'web/hooks/useTranslation';
import {
  type ReportExportJobView,
  type ReportExportJob,
} from 'web/report-export/report-export-job-model';

export type ReportExportStatusTone =
  | 'active'
  | 'queued'
  | 'downloading'
  | 'canceled'
  | 'error'
  | 'complete';

export interface ReportExportJobDisplay {
  label: string;
  detail?: string;
  tone: ReportExportStatusTone;
}

const getReportExportFailureLabel = (
  reason: Extract<ReportExportJobView, {kind: 'failed'}>['reason'],
  _: TranslateFunc,
) => {
  switch (reason) {
    case 'export':
      return _('Export failed');
    case 'download':
      return _('Download failed');
    case 'status':
    case 'expired':
    case 'unavailable':
      return _('Unavailable');
  }
};

export const getReportExportJobDisplay = (
  {view}: ReportExportJob,
  _: TranslateFunc,
): ReportExportJobDisplay => {
  switch (view.kind) {
    case 'creating':
      return {label: _('Preparing'), tone: 'active'};
    case 'checking':
      return {label: _('Checking'), tone: 'active'};
    case 'queued':
      return {label: _('Queued'), tone: 'queued'};
    case 'generating':
      return {
        label: view.progress === 'preparing' ? _('Preparing') : _('Generating'),
        detail:
          view.progress &&
          view.progress !== 'preparing' &&
          view.progress !== 'generating'
            ? _('Progress: {{progress}}', {progress: view.progress})
            : undefined,
        tone: 'active',
      };
    case 'canceling':
      return {label: _('Canceling'), tone: 'queued'};
    case 'downloading':
      return {
        label: _('Downloading'),
        tone: 'downloading',
      };
    case 'complete':
      return {label: _('Complete'), tone: 'complete'};
    case 'canceled':
      return {label: _('Canceled'), tone: 'canceled'};
    case 'failed':
      return {
        label: getReportExportFailureLabel(view.reason, _),
        detail: view.error.message,
        tone: 'error',
      };
  }
};

export const getReportExportJobTitle = (
  job: ReportExportJob,
  _: TranslateFunc,
) => {
  let title = _('Report export');
  if (job.reportTitle) {
    title = _('Report export: {{report}}', {report: job.reportTitle});
  }
  const extensionIndex = job.filename.lastIndexOf('.');
  const extension =
    extensionIndex > 0
      ? job.filename.slice(extensionIndex + 1).toLowerCase()
      : '';
  return extension ? `${title} (.${extension})` : title;
};

export const getReportExportCancelTitle = (
  {view, cancelError}: ReportExportJob,
  _: TranslateFunc,
) => {
  if (view.kind === 'canceling') return _('Cancellation requested');
  if (cancelError) return _('Retry cancellation');
  return _('Cancel report export');
};
