/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type TranslateFunc} from 'web/hooks/useTranslation';
import {type JobView, type ReportExportJob} from 'web/report-export/job';

export type ActivityStatusTone =
  | 'active'
  | 'queued'
  | 'downloading'
  | 'canceled'
  | 'error'
  | 'ready';

export type ActivityStatusIcon =
  | 'loading'
  | Exclude<ActivityStatusTone, 'active'>;

export interface ActivityStatusPresentation {
  label: string;
  detail?: string;
  tone: ActivityStatusTone;
  icon: ActivityStatusIcon;
}

const getFailedLabel = (
  reason: Extract<JobView, {kind: 'failed'}>['reason'],
  _: TranslateFunc,
) => {
  switch (reason) {
    case 'export':
      return _('Export failed');
    case 'expired':
      return _('Export expired');
    case 'download':
      return _('Download failed');
    case 'gone':
      return _('No longer available');
    case 'unavailable':
      return _('Unavailable');
  }
};

export const getJobPresentation = (
  {view}: ReportExportJob,
  _: TranslateFunc,
): ActivityStatusPresentation => {
  switch (view.kind) {
    case 'creating':
      return {label: _('Preparing'), tone: 'active', icon: 'loading'};
    case 'checking':
      return {label: _('Checking'), tone: 'active', icon: 'loading'};
    case 'queued':
      return {label: _('Queued'), tone: 'queued', icon: 'queued'};
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
        icon: 'loading',
      };
    case 'cancel-requested':
      return {label: _('Cancel requested'), tone: 'queued', icon: 'queued'};
    case 'canceling':
      return {label: _('Canceling'), tone: 'queued', icon: 'queued'};
    case 'downloading':
      return {
        label: _('Downloading'),
        tone: 'downloading',
        icon: 'downloading',
      };
    case 'ready':
      return {label: _('Ready'), tone: 'ready', icon: 'ready'};
    case 'complete':
      return {label: _('Complete'), tone: 'ready', icon: 'ready'};
    case 'canceled':
      return {label: _('Canceled'), tone: 'canceled', icon: 'canceled'};
    case 'failed':
      return {
        label: getFailedLabel(view.reason, _),
        detail:
          view.reason === 'gone'
            ? _(
                'The file may already have been downloaded. Export the report again.',
              )
            : view.error.message,
        tone: 'error',
        icon: 'error',
      };
  }
};

export const getJobTitle = (job: ReportExportJob, _: TranslateFunc) => {
  const isDirect = job.transport === 'direct';
  let title = isDirect ? _('Report download') : _('Report export');
  if (job.reportTitle) {
    title = isDirect
      ? _('Report download: {{report}}', {report: job.reportTitle})
      : _('Report export: {{report}}', {report: job.reportTitle});
  }
  const extensionIndex = job.filename.lastIndexOf('.');
  const extension =
    extensionIndex > 0
      ? job.filename.slice(extensionIndex + 1).toLowerCase()
      : '';
  return extension ? `${title} (.${extension})` : title;
};

export const getCancelButtonTitle = (
  {view, cancelError}: ReportExportJob,
  _: TranslateFunc,
) => {
  if (view.kind === 'canceling') return _('Cancellation requested');
  if (cancelError) return _('Retry cancellation');
  return _('Cancel report export');
};
