/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReportExportPayload} from 'gmp/commands/report-export';
import {
  type ReportExport,
  type ReportExportProgress,
} from 'gmp/models/report-export';

export type ReportExportKind = 'scan' | 'audit' | 'delta_scan' | 'delta_audit';

export const MAX_RETAINED_RECEIPTS = 50;

export interface StartReportExportParams {
  kind: ReportExportKind;
  payload: ReportExportPayload;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

export interface ExportIntent {
  key: string;
  origin: 'local' | 'discovered';
  exportId?: string;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
  autoDownload: boolean;
  disposition: 'awaiting' | 'handed-off' | 'abandoned';
}

export type AttemptPhase =
  | {stage: 'creating'; cancelRequested?: boolean}
  | {stage: 'tracking'}
  | {stage: 'canceling'}
  | {stage: 'cancel-requested'}
  | {stage: 'transferring'}
  | {stage: 'waiting'; error?: Error}
  | {stage: 'handoff-failed'; error: Error}
  | {stage: 'handed-off'}
  | {stage: 'failed'; error: Error}
  | {stage: 'abandoned'};

export interface ExportAttempt extends ExportIntent {
  phase: AttemptPhase;
  cancelError?: Error;
}

export const inStage = (
  phase: AttemptPhase,
  ...stages: AttemptPhase['stage'][]
) => stages.includes(phase.stage);

// 'gone': the download was rejected permanently; gvmd deletes the file after the first full response.
type FailureReason = 'export' | 'expired' | 'download' | 'gone' | 'unavailable';

export type JobView =
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
      reason: FailureReason;
      error: Error;
    };

export interface ReportExportJob extends ExportIntent {
  transport: 'async' | 'direct';
  view: JobView;
  exportData?: ReportExport;
  cancelError?: Error;
  statusError?: Error;
}

const ACTIVE_KINDS = new Set<JobView['kind']>([
  'creating',
  'checking',
  'queued',
  'generating',
  'cancel-requested',
  'canceling',
  'downloading',
]);

export const isGenerationActive = (
  status?: string,
): status is 'pending' | 'running' | 'cancel_requested' =>
  status === 'pending' || status === 'running' || status === 'cancel_requested';

export const getReportExportActions = ({transport, view}: ReportExportJob) => {
  const active = ACTIVE_KINDS.has(view.kind);
  return {
    active,
    cancel:
      transport === 'async' &&
      (view.kind === 'creating' ||
        view.kind === 'queued' ||
        view.kind === 'generating'),
    dismiss: !active || view.kind === 'checking',
    download: view.kind === 'ready',
    retry:
      view.kind === 'failed' &&
      (view.reason === 'unavailable' || view.reason === 'download'),
  };
};

export class ReportExportUnavailableError extends Error {}

const getStatus = (error: unknown) =>
  error && typeof error === 'object' && 'status' in error
    ? error.status
    : undefined;

export const isPermanentExportError = (error: unknown) =>
  error instanceof ReportExportUnavailableError ||
  [400, 401, 403, 404].some(code => getStatus(error) === code);

const failed = (reason: FailureReason, error: Error): JobView => ({
  kind: 'failed',
  reason,
  error,
});

const getLocalTerminalView = (
  phase: AttemptPhase,
  statusError?: Error | null,
): JobView | undefined => {
  if (phase.stage === 'handed-off') return {kind: 'complete'};
  if (phase.stage === 'failed') return failed('export', phase.error);
  if (phase.stage === 'creating')
    return {kind: phase.cancelRequested ? 'canceling' : 'creating'};
  if (statusError && isPermanentExportError(statusError))
    return failed('unavailable', statusError);
  if (phase.stage === 'abandoned')
    return failed('unavailable', new Error('Tracking stopped'));
  if (
    phase.stage === 'waiting' &&
    phase.error &&
    isPermanentExportError(phase.error)
  )
    return failed(
      getStatus(phase.error) === 404 ? 'gone' : 'unavailable',
      phase.error,
    );
  return undefined;
};

const getRemoteTerminalView = (
  exportData?: ReportExport,
): JobView | undefined => {
  switch (exportData?.status) {
    case 'error':
      return failed(
        'export',
        new Error(exportData.errorMessage || 'Export failed'),
      );
    case 'expired':
      return failed(
        'expired',
        new Error(exportData.errorMessage || 'Export expired'),
      );
    case 'canceled':
      return {kind: 'canceled'};
    case 'unknown':
      return failed('unavailable', new Error('Unsupported export status'));
  }
  return undefined;
};

const getProgressView = (
  {phase, autoDownload}: ExportAttempt,
  exportData?: ReportExport,
): JobView => {
  if (
    inStage(phase, 'waiting', 'handoff-failed') &&
    'error' in phase &&
    phase.error
  )
    return failed('download', phase.error);
  if (inStage(phase, 'transferring', 'waiting')) return {kind: 'downloading'};
  if (phase.stage === 'canceling') return {kind: 'canceling'};
  const status = exportData?.status;
  if (phase.stage === 'cancel-requested' && isGenerationActive(status))
    return {kind: 'cancel-requested'};
  switch (status) {
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

// Precedence: local terminal phases, then remote terminal status, then transfer/cancel/progress.
const getAttemptView = (
  attempt: ExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): JobView =>
  getLocalTerminalView(attempt.phase, statusError) ??
  getRemoteTerminalView(exportData) ??
  getProgressView(attempt, exportData);

export const toReportExportJob = (
  attempt: ExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportJob => {
  const {phase: _phase, ...intent} = attempt;
  return {
    ...intent,
    transport: 'async',
    view: getAttemptView(attempt, exportData, statusError),
    exportData,
    statusError:
      statusError && !isPermanentExportError(statusError)
        ? statusError
        : undefined,
  };
};

export const retainReportExportJobs = (jobs: ReportExportJob[]) => {
  const unfinished = new Set(
    jobs
      .filter(
        job =>
          getReportExportActions(job).active ||
          (job.autoDownload &&
            job.exportId &&
            job.disposition === 'awaiting' &&
            job.view.kind !== 'failed' &&
            job.view.kind !== 'canceled'),
      )
      .map(job => job.key),
  );
  const recent = new Set(
    jobs
      .filter(job => !unfinished.has(job.key))
      .slice(-MAX_RETAINED_RECEIPTS)
      .map(job => job.key),
  );
  return jobs.filter(job => unfinished.has(job.key) || recent.has(job.key));
};

export const selectReportExportInventory = (exports: ReportExport[]) =>
  exports.filter(item => isGenerationActive(item.status));
