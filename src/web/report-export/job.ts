/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReportExportPayload} from 'gmp/commands/report-export';
import {type FilterType} from 'gmp/models/filter';
import {type ReportExport} from 'gmp/models/report-export';

export type ReportExportKind = 'scan' | 'audit' | 'delta_scan' | 'delta_audit';

export interface StartReportExportParams {
  kind: ReportExportKind;
  payload: ReportExportPayload;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

export interface StartDirectReportDownloadParams extends Omit<
  StartReportExportParams,
  'payload'
> {
  payload: Omit<ReportExportPayload, 'filter'> & {filter?: FilterType};
}

export interface ExportIntent {
  key: string;
  origin: 'local' | 'discovered';
  exportId?: string;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
  directDownload?: boolean;
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

export type ReportExportState =
  | {
      status:
        | 'creating'
        | 'checking'
        | 'pending'
        | 'running'
        | 'cancel_requested'
        | 'done'
        | 'downloaded'
        | 'canceled';
      exportData?: ReportExport;
      error?: undefined;
    }
  | {
      status: 'error' | 'unavailable';
      exportData?: ReportExport;
      error: Error;
    };

export interface ReportExportJob extends ExportIntent {
  state: ReportExportState;
  downloadStarted: boolean;
  downloadPending: boolean;
  directPending: boolean;
  cancelPending: boolean;
  downloadError?: Error;
  cancelError?: Error;
  statusError?: Error;
}

export const isGenerationActive = (
  status?: string,
): status is 'pending' | 'running' | 'cancel_requested' =>
  status === 'pending' || status === 'running' || status === 'cancel_requested';

export const getReportExportActions = (job: ReportExportJob) => {
  const status = job.state.status;
  const active =
    status === 'creating' ||
    status === 'checking' ||
    isGenerationActive(status) ||
    job.downloadPending ||
    job.directPending ||
    job.cancelPending;
  return {
    active,
    cancel:
      !job.directDownload &&
      !job.cancelPending &&
      (status === 'creating' || status === 'pending' || status === 'running'),
    dismiss: !active || (status === 'checking' && !job.cancelPending),
    download: status === 'done' && !job.downloadStarted && !job.downloadPending,
    retry: status === 'unavailable' || Boolean(job.downloadError),
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

const getRemoteState = (
  exportData: ReportExport,
  phase: AttemptPhase,
): ReportExportState => {
  const status = exportData.status;
  if (status === 'error' || status === 'expired') {
    return {
      status: 'error',
      exportData,
      error: new Error(
        exportData.errorMessage ||
          (status === 'expired' ? 'Export expired' : 'Export failed'),
      ),
    };
  }
  if (status === 'canceled') return {status: 'canceled', exportData};
  if (status === 'done') return {status: 'done', exportData};
  if (isGenerationActive(status)) {
    return {
      status: phase.stage === 'cancel-requested' ? 'cancel_requested' : status,
      exportData,
    };
  }
  return {
    status: 'unavailable',
    exportData,
    error: new Error('Unsupported export status'),
  };
};

const getAttemptState = (
  attempt: ExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportState => {
  const {phase} = attempt;
  if (phase.stage === 'handed-off')
    return {status: attempt.directDownload ? 'downloaded' : 'done'};
  if (phase.stage === 'failed') return {status: 'error', error: phase.error};
  if (phase.stage === 'creating') return {status: 'creating'};
  if (attempt.directDownload && phase.stage === 'transferring')
    return {status: 'creating'};
  if (attempt.directDownload && phase.stage === 'handoff-failed')
    return {status: 'error', error: phase.error};
  if (statusError && isPermanentExportError(statusError))
    return {status: 'unavailable', exportData, error: statusError};
  if (
    phase.stage === 'waiting' &&
    phase.error &&
    isPermanentExportError(phase.error)
  )
    return {status: 'unavailable', exportData, error: phase.error};
  if (phase.stage === 'abandoned')
    return {
      status: 'unavailable',
      exportData,
      error: new Error('Tracking stopped'),
    };
  return exportData ? getRemoteState(exportData, phase) : {status: 'checking'};
};

const isTransferPending = (
  attempt: ExportAttempt,
  state: ReportExportState,
  downloadError?: Error,
) => {
  const {phase} = attempt;
  if (attempt.directDownload) return false;
  if (phase.stage === 'transferring') return true;
  if (phase.stage === 'waiting') return !phase.error;
  return (
    state.status === 'done' &&
    attempt.autoDownload &&
    phase.stage !== 'handed-off' &&
    phase.stage !== 'canceling' &&
    !downloadError
  );
};

export const toReportExportJob = (
  attempt: ExportAttempt,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportJob => {
  const {phase} = attempt;
  const state = getAttemptState(attempt, exportData, statusError);
  const downloadError =
    phase.stage === 'handoff-failed' || phase.stage === 'waiting'
      ? phase.error
      : undefined;
  return {
    ...attempt,
    state,
    downloadStarted: phase.stage === 'handed-off',
    downloadPending: isTransferPending(attempt, state, downloadError),
    directPending: Boolean(
      attempt.directDownload && phase.stage === 'transferring',
    ),
    cancelPending:
      phase.stage === 'canceling' ||
      (phase.stage === 'creating' && Boolean(phase.cancelRequested)),
    downloadError,
    statusError: !isPermanentExportError(statusError)
      ? (statusError ?? undefined)
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
            job.state.status !== 'error' &&
            job.state.status !== 'canceled'),
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
