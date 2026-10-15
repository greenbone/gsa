/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type ReportExportAttemptRecord,
  MAX_RETAINED_EXPORT_RECEIPT_COUNT,
} from 'web/report-export/report-export-job';

const getReportExportAttemptsStorageKey = (username: string) =>
  `gsa-report-export-jobs:${encodeURIComponent(username)}`;

const getSafeReportUrl = (candidate: unknown) => {
  if (typeof candidate !== 'string' || !candidate.startsWith('/'))
    return undefined;
  try {
    const url = new URL(candidate, window.location.origin);
    return url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : undefined;
  } catch {
    return undefined;
  }
};

const VALID_ATTEMPT_DISPOSITIONS = new Set<
  ReportExportAttemptRecord['disposition']
>(['awaiting', 'handed-off', 'abandoned']);

const parseStoredReportExportAttempt = (
  candidate: unknown,
): ReportExportAttemptRecord | undefined => {
  if (!candidate || typeof candidate !== 'object') return undefined;
  if (
    !('key' in candidate) ||
    typeof candidate.key !== 'string' ||
    !candidate.key ||
    !('exportId' in candidate) ||
    typeof candidate.exportId !== 'string' ||
    !candidate.exportId ||
    !('filename' in candidate) ||
    typeof candidate.filename !== 'string' ||
    !('reportTitle' in candidate) ||
    typeof candidate.reportTitle !== 'string' ||
    !('origin' in candidate) ||
    (candidate.origin !== 'local' && candidate.origin !== 'discovered') ||
    !('disposition' in candidate) ||
    !VALID_ATTEMPT_DISPOSITIONS.has(
      candidate.disposition as ReportExportAttemptRecord['disposition'],
    )
  )
    return undefined;
  return {
    key: candidate.key,
    origin: candidate.origin,
    exportId: candidate.exportId,
    filename: candidate.filename,
    reportTitle: candidate.reportTitle,
    reportUrl:
      'reportUrl' in candidate
        ? getSafeReportUrl(candidate.reportUrl)
        : undefined,
    autoDownload:
      'autoDownload' in candidate && candidate.autoDownload === true,
    disposition:
      candidate.disposition as ReportExportAttemptRecord['disposition'],
  };
};

export const readStoredReportExportAttempts = (
  username?: string,
): ReportExportAttemptRecord[] => {
  try {
    if (!username) return [];
    const raw: unknown = JSON.parse(
      window.sessionStorage.getItem(
        getReportExportAttemptsStorageKey(username),
      ) ?? '[]',
    );
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const unfinished = new Set<string>();
    return raw.flatMap(candidate => {
      const attempt = parseStoredReportExportAttempt(candidate);
      if (!attempt || seen.has(attempt.key)) return [];
      if (attempt.disposition === 'awaiting' && attempt.exportId) {
        if (unfinished.has(attempt.exportId)) return [];
        unfinished.add(attempt.exportId);
      }
      seen.add(attempt.key);
      return [attempt];
    });
  } catch {
    return [];
  }
};

const toStoredAttemptRecords = (attempts: ReportExportAttemptRecord[]) => {
  const unfinished = attempts.filter(
    attempt =>
      attempt.autoDownload &&
      attempt.disposition === 'awaiting' &&
      attempt.exportId,
  );
  const receipts = attempts
    .filter(attempt => attempt.disposition !== 'awaiting')
    .slice(-MAX_RETAINED_EXPORT_RECEIPT_COUNT);
  return [...unfinished, ...receipts].map(attempt => ({
    key: attempt.key,
    origin: attempt.origin,
    exportId: attempt.exportId,
    filename: attempt.filename,
    reportTitle: attempt.reportTitle,
    reportUrl: attempt.reportUrl,
    autoDownload: attempt.autoDownload,
    disposition: attempt.disposition,
  }));
};

export const writeStoredReportExportAttempts = (
  username: string,
  attempts: ReportExportAttemptRecord[],
) => {
  try {
    const serialized = JSON.stringify(toStoredAttemptRecords(attempts));
    const storageKey = getReportExportAttemptsStorageKey(username);
    if (serialized === '[]') window.sessionStorage.removeItem(storageKey);
    else if (window.sessionStorage.getItem(storageKey) !== serialized)
      window.sessionStorage.setItem(storageKey, serialized);
  } catch {
    return;
  }
};
