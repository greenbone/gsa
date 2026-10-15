/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReportExportPayload} from 'gmp/commands/report-export';
import type ReportExport from 'gmp/models/report-export';

type ReportExportProgress = NonNullable<ReportExport['progress']>;

export type ReportExportKind = 'scan' | 'audit' | 'delta_scan' | 'delta_audit';

export const MAX_RETAINED_EXPORT_HISTORY_COUNT = 50;

export interface StartReportExportParams {
  kind: ReportExportKind;
  payload: ReportExportPayload;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

export interface ReportExportAttemptRecord {
  key: string;
  origin: 'local' | 'discovered';
  exportId?: string;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
  autoDownload: boolean;
}

export type ReportExportAttemptPhase =
  | {stage: 'creating'; cancelRequested?: boolean}
  | {stage: 'tracking'}
  | {stage: 'canceling'}
  | {stage: 'cancel-requested'}
  | {stage: 'transferring'}
  | {stage: 'waiting'; error?: Error}
  | {stage: 'handoff-failed'; error: Error}
  | {stage: 'handed-off'}
  | {stage: 'failed'; error: Error};

export interface ReportExportAttempt extends ReportExportAttemptRecord {
  phase: ReportExportAttemptPhase;
  cancelError?: Error;
}

export const isAttemptInStage = (
  phase: ReportExportAttemptPhase,
  ...stages: ReportExportAttemptPhase['stage'][]
) => stages.includes(phase.stage);

// 'gone': the download was rejected permanently; gvmd deletes the file after the first full response.
type ReportExportFailureReason =
  | 'export'
  | 'expired'
  | 'download'
  | 'gone'
  | 'unavailable';

export type ReportExportJobView =
  | {
      kind:
        | 'creating'
        | 'checking'
        | 'queued'
        | 'cancel-requested'
        | 'canceling'
        | 'downloading'
        | 'ready'
        | 'complete'
        | 'canceled';
    }
  | {kind: 'generating'; progress?: ReportExportProgress}
  | {
      kind: 'failed';
      reason: ReportExportFailureReason;
      error: Error;
    };

export interface ReportExportJob extends ReportExportAttemptRecord {
  exportMode: 'async' | 'direct';
  view: ReportExportJobView;
  exportData?: ReportExport;
  cancelError?: Error;
  statusError?: Error;
}

const ACTIVE_JOB_VIEW_KINDS = new Set<ReportExportJobView['kind']>([
  'creating',
  'checking',
  'queued',
  'generating',
  'cancel-requested',
  'canceling',
  'downloading',
]);

export const isReportExportGenerationActive = (
  status?: string,
): status is 'pending' | 'running' | 'cancel_requested' =>
  status === 'pending' || status === 'running' || status === 'cancel_requested';

export const getReportExportActions = ({exportMode, view}: ReportExportJob) => {
  const isActive = ACTIVE_JOB_VIEW_KINDS.has(view.kind);
  return {
    active: isActive,
    cancel:
      exportMode === 'async' &&
      (view.kind === 'creating' ||
        view.kind === 'queued' ||
        view.kind === 'generating'),
    dismiss: !isActive || view.kind === 'checking',
    download: view.kind === 'ready',
    retry:
      view.kind === 'failed' &&
      (view.reason === 'unavailable' || view.reason === 'download'),
  };
};

export class ReportExportUnavailableError extends Error {}

const getHttpStatus = (error: unknown) =>
  error && typeof error === 'object' && 'status' in error
    ? error.status
    : undefined;

export const isPermanentReportExportError = (error: unknown) => {
  const httpStatus = getHttpStatus(error);
  return (
    error instanceof ReportExportUnavailableError ||
    (typeof httpStatus === 'number' &&
      [400, 401, 403, 404].includes(httpStatus))
  );
};

const createFailedJobView = (
  reason: ReportExportFailureReason,
  error: Error,
): ReportExportJobView => ({
  kind: 'failed',
  reason,
  error,
});

const getLocalAttemptTerminalView = (
  phase: ReportExportAttemptPhase,
  statusError?: Error | null,
): ReportExportJobView | undefined => {
  if (phase.stage === 'handed-off') return {kind: 'complete'};
  if (phase.stage === 'failed')
    return createFailedJobView('export', phase.error);
  if (phase.stage === 'creating')
    return {kind: phase.cancelRequested ? 'canceling' : 'creating'};
  if (statusError && isPermanentReportExportError(statusError))
    return createFailedJobView('unavailable', statusError);
  if (
    phase.stage === 'waiting' &&
    phase.error &&
    isPermanentReportExportError(phase.error)
  )
    return createFailedJobView(
      getHttpStatus(phase.error) === 404 ? 'gone' : 'unavailable',
      phase.error,
    );
  return undefined;
};

// Precedence: local terminal phases, then remote terminal status, then transfer/cancel/progress.
const getReportExportJobView = (
  {phase, autoDownload}: ReportExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportJobView => {
  const localTerminalView = getLocalAttemptTerminalView(phase, statusError);
  if (localTerminalView) return localTerminalView;
  const exportStatus = exportData?.status;
  switch (exportStatus) {
    case 'error':
      return createFailedJobView(
        'export',
        new Error(exportData?.errorMessage || 'Export failed'),
      );
    case 'expired':
      return createFailedJobView(
        'expired',
        new Error(exportData?.errorMessage || 'Export expired'),
      );
    case 'canceled':
      return {kind: 'canceled'};
    case 'unknown':
      return createFailedJobView(
        'unavailable',
        new Error('Unsupported export status'),
      );
  }
  if (
    isAttemptInStage(phase, 'waiting', 'handoff-failed') &&
    'error' in phase &&
    phase.error
  )
    return createFailedJobView('download', phase.error);
  if (isAttemptInStage(phase, 'transferring', 'waiting'))
    return {kind: 'downloading'};
  if (phase.stage === 'canceling') return {kind: 'canceling'};
  if (
    phase.stage === 'cancel-requested' &&
    isReportExportGenerationActive(exportStatus)
  )
    return {kind: 'cancel-requested'};
  switch (exportStatus) {
    case 'pending':
      return {kind: 'queued'};
    case 'running':
      return {kind: 'generating', progress: exportData?.progress};
    case 'cancel_requested':
      return {kind: 'cancel-requested'};
    case 'done':
      return {kind: autoDownload ? 'downloading' : 'ready'};
  }
  return {kind: 'checking'};
};

export const createReportExportJob = (
  attempt: ReportExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportJob => {
  const {phase: _phase, ...activityRecord} = attempt;
  return {
    ...activityRecord,
    exportMode: 'async',
    view: getReportExportJobView(attempt, exportData, statusError),
    exportData,
    statusError:
      statusError && !isPermanentReportExportError(statusError)
        ? statusError
        : undefined,
  };
};

export const retainReportExportJobs = (jobs: ReportExportJob[]) => {
  const retainedJobKeys = new Set(
    jobs
      .filter(
        job =>
          getReportExportActions(job).active ||
          (job.origin === 'discovered' && job.view.kind === 'ready') ||
          (job.autoDownload &&
            job.exportId &&
            job.view.kind !== 'complete' &&
            job.view.kind !== 'failed' &&
            job.view.kind !== 'canceled'),
      )
      .map(job => job.key),
  );
  const recentJobKeys = new Set(
    jobs
      .filter(job => !retainedJobKeys.has(job.key))
      .slice(-MAX_RETAINED_EXPORT_HISTORY_COUNT)
      .map(job => job.key),
  );
  return jobs.filter(
    job => retainedJobKeys.has(job.key) || recentJobKeys.has(job.key),
  );
};

export const selectReportExportInventory = (reportExports: ReportExport[]) => {
  const activeExports = reportExports.filter(reportExport =>
    isReportExportGenerationActive(reportExport.status),
  );
  const readyExports = reportExports.filter(
    reportExport => reportExport.status === 'done',
  );
  return [...activeExports, ...readyExports];
};
