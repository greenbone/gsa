/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReportExportPayload} from 'gmp/commands/report-export';
import {type ReportExport} from 'gmp/models/report-export';
import {isDefined} from 'gmp/utils/identity';

type ReportExportProgress = NonNullable<ReportExport['progress']>;

export type ReportExportKind = 'scan' | 'audit' | 'delta_scan' | 'delta_audit';

export interface StartReportExportParams {
  kind: ReportExportKind;
  payload: ReportExportPayload;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

// Server state lives entirely in the per-export status poll. A record only
// holds the client-side bits the server cannot observe: which export it maps
// to, its display metadata, and local operation state.
export interface ReportExportRecord {
  key: string;
  exportId?: string;
  filename: string;
  reportTitle: string;
  reportUrl?: string;
  // cancel was requested while the export id did not exist yet
  cancelRequested?: boolean;
  downloading?: boolean;
  downloaded?: boolean;
  createError?: Error;
  downloadError?: Error;
  cancelError?: Error;
}

type ReportExportFailureReason =
  | 'export'
  | 'download'
  | 'status'
  | 'expired'
  | 'unavailable';

export type ReportExportJobView =
  | {
      kind:
        | 'creating'
        | 'checking'
        | 'queued'
        | 'canceling'
        | 'downloading'
        | 'complete'
        | 'canceled';
    }
  | {kind: 'generating'; progress?: ReportExportProgress}
  | {kind: 'failed'; reason: ReportExportFailureReason; error: Error};

export interface ReportExportJob extends ReportExportRecord {
  view: ReportExportJobView;
  exportData?: ReportExport;
}

export interface AdoptedExportMetadata {
  filename: string;
  reportTitle: string;
  reportUrl?: string;
}

export const MAX_RETAINED_EXPORT_HISTORY_COUNT = 50;

// kinds that end a job; every other kind is part of an active export
const TERMINAL_JOB_VIEW_KINDS = new Set<ReportExportJobView['kind']>([
  'complete',
  'canceled',
  'failed',
]);

export const isReportExportJobFinished = ({view}: ReportExportJob) =>
  TERMINAL_JOB_VIEW_KINDS.has(view.kind);

// kinds whose export can still be canceled on the server
const CANCELABLE_JOB_VIEW_KINDS = new Set<ReportExportJobView['kind']>([
  'creating',
  'checking',
  'queued',
  'generating',
]);

export const getReportExportActions = ({
  view,
}: ReportExportJob): {
  active: boolean;
  cancel: boolean;
  dismiss: boolean;
  retry: boolean;
} => {
  const isActive = !TERMINAL_JOB_VIEW_KINDS.has(view.kind);
  return {
    active: isActive,
    cancel: CANCELABLE_JOB_VIEW_KINDS.has(view.kind),
    dismiss: !isActive || view.kind === 'checking',
    retry:
      view.kind === 'failed' &&
      (view.reason === 'unavailable' ||
        view.reason === 'download' ||
        view.reason === 'status'),
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

const getDownloadFailureReason = (error: Error): ReportExportFailureReason =>
  isPermanentReportExportError(error) ? 'unavailable' : 'download';

const createFailedView = (reason: ReportExportFailureReason, error: Error) => ({
  kind: 'failed' as const,
  reason,
  error,
});

// Decides the outcomes the server determines on its own: terminal statuses
// (error, canceled) and statuses the client does not know (e.g. from a newer
// gvmd version). Known generation statuses return undefined and are mapped
// by the caller.
const getServerStatusView = (
  exportData?: ReportExport,
): ReportExportJobView | undefined => {
  const status = exportData?.status;
  switch (status) {
    case undefined:
      return undefined;
    case 'error':
      return createFailedView(
        'export',
        new Error(exportData?.errorMessage || 'Export failed'),
      );
    case 'canceled':
      return {kind: 'canceled'};
    case 'pending':
    case 'running':
    case 'cancel_requested':
    case 'done':
      return undefined;
    case 'expired':
      // the generated file was removed by the server retention; there is
      // nothing left to download or re-check
      return createFailedView(
        'expired',
        new Error(exportData?.errorMessage || 'Export is expired'),
      );
    default:
      return createFailedView(
        'unavailable',
        new Error(
          exportData?.errorMessage || 'Export is in an unexpected state',
        ),
      );
  }
};

const getReportExportJobView = (
  record: ReportExportRecord,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportJobView => {
  const serverStatusView = getServerStatusView(exportData);
  if (record.createError) {
    return createFailedView('export', record.createError);
  }
  if (record.downloaded) return {kind: 'complete'};
  if (serverStatusView) return serverStatusView;
  if (record.downloadError) {
    return createFailedView(
      getDownloadFailureReason(record.downloadError),
      record.downloadError,
    );
  }
  if (record.downloading) return {kind: 'downloading'};
  if (!record.exportId) {
    return record.cancelRequested ? {kind: 'canceling'} : {kind: 'creating'};
  }
  // A permanent status failure outranks cached status data: the export is
  // gone (e.g. 404) even though an earlier poll still reported it running.
  if (statusError && isPermanentReportExportError(statusError)) {
    return createFailedView('status', statusError);
  }
  if (record.cancelRequested) return {kind: 'canceling'};
  switch (exportData?.status) {
    case 'cancel_requested':
      return {kind: 'canceling'};
    case 'pending':
      return {kind: 'queued'};
    case 'running':
      return {kind: 'generating', progress: exportData?.progress};
    case 'done':
      return {kind: 'downloading'};
  }
  // no status data yet: keep checking
  return {kind: 'checking'};
};

export const createReportExportJob = (
  record: ReportExportRecord,
  exportData?: ReportExport,
  statusError?: Error | null,
): ReportExportJob => ({
  ...record,
  view: getReportExportJobView(record, exportData, statusError),
  exportData,
});

// Binds a create response to the record waiting for it. When gvmd reuses an
// export id, the re-export intent (metadata and queued cancellation) carries
// over to the record already tracking it.
export const adoptCreatedExportRecord = (
  previous: ReportExportRecord[],
  key: string,
  exportId: string,
  metadata: AdoptedExportMetadata,
): ReportExportRecord[] => {
  const target = previous.find(record => record.key === key);
  if (!isDefined(target)) return previous;
  const existing = previous.find(
    record => record.key !== key && record.exportId === exportId,
  );
  if (!isDefined(existing)) {
    return previous.map(record =>
      record.key === key ? {...record, exportId} : record,
    );
  }
  return previous
    .map(record =>
      record.key === existing.key
        ? {
            ...record,
            ...metadata,
            cancelRequested: record.cancelRequested || target.cancelRequested,
          }
        : record,
    )
    .filter(record => record.key !== key);
};

export const shouldAutoDownloadRecord = (
  record: ReportExportRecord,
  exportData?: ReportExport,
) =>
  isDefined(record.exportId) &&
  !record.downloading &&
  !record.downloaded &&
  !isDefined(record.createError) &&
  !isDefined(record.downloadError) &&
  exportData?.status === 'done';

// Retention bounds the tracked exports: active exports are always kept,
// finished ones only as the most recent history entries. The status of a
// record is resolved by the caller (query results or cache reads), so the
// retention can be applied to the records themselves and not only to the
// displayed jobs.
export const retainReportExportRecords = (
  records: ReportExportRecord[],
  resolveStatus: (record: ReportExportRecord) => {
    data?: ReportExport;
    error?: Error | null;
  },
): ReportExportRecord[] => {
  const activeIndexes = new Set<number>();
  const finishedIndexes: number[] = [];
  records.forEach((record, index) => {
    const {data, error} = resolveStatus(record);
    const job = createReportExportJob(record, data, error);
    if (getReportExportActions(job).active) activeIndexes.add(index);
    else finishedIndexes.push(index);
  });
  const retainedHistory = new Set(
    finishedIndexes.slice(-MAX_RETAINED_EXPORT_HISTORY_COUNT),
  );
  return records.filter(
    (_, index) => activeIndexes.has(index) || retainedHistory.has(index),
  );
};
