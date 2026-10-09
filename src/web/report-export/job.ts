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
      reason: 'export' | 'expired' | 'download' | 'unavailable';
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

export const isPermanentExportError = (error: unknown) => {
  if (error instanceof ReportExportUnavailableError) return true;
  if (!error || typeof error !== 'object' || !('status' in error)) return false;
  return (
    error.status === 400 ||
    error.status === 401 ||
    error.status === 403 ||
    error.status === 404
  );
};

const failed = (
  reason: 'export' | 'expired' | 'download' | 'unavailable',
  error: Error,
): JobView => ({kind: 'failed', reason, error});

// Ordered by precedence: terminal states first, then local transfer/cancel, then remote progress.
const getAttemptView = (
  {phase, autoDownload}: ExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): JobView => {
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
    return failed('unavailable', phase.error);
  const status = exportData?.status;
  if (status === 'error')
    return failed(
      'export',
      new Error(exportData?.errorMessage || 'Export failed'),
    );
  if (status === 'expired')
    return failed(
      'expired',
      new Error(exportData?.errorMessage || 'Export expired'),
    );
  if (status === 'canceled') return {kind: 'canceled'};
  if (status === 'unknown')
    return failed('unavailable', new Error('Unsupported export status'));
  if (
    (phase.stage === 'waiting' || phase.stage === 'handoff-failed') &&
    phase.error
  )
    return failed('download', phase.error);
  if (phase.stage === 'transferring' || phase.stage === 'waiting')
    return {kind: 'downloading'};
  if (phase.stage === 'canceling') return {kind: 'canceling'};
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
      .slice(-50)
      .map(job => job.key),
  );
  return jobs.filter(job => unfinished.has(job.key) || recent.has(job.key));
};

export const selectReportExportInventory = (exports: ReportExport[]) =>
  exports.filter(item => isGenerationActive(item.status));
