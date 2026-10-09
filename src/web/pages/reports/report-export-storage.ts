/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ExportIntent} from 'web/pages/reports/report-export-job';

const storageKey = (username: string) =>
  `gsa-report-export-jobs:${encodeURIComponent(username)}`;

const safeReportUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : undefined;
  } catch {
    return undefined;
  }
};

const readIntent = (value: unknown): ExportIntent | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  if (
    !('key' in value) ||
    typeof value.key !== 'string' ||
    !value.key ||
    !('filename' in value) ||
    typeof value.filename !== 'string' ||
    !('reportTitle' in value) ||
    typeof value.reportTitle !== 'string'
  )
    return undefined;
  const exportId =
    'exportId' in value && typeof value.exportId === 'string' && value.exportId
      ? value.exportId
      : undefined;
  const directDownload =
    'directDownload' in value && value.directDownload === true;
  const handedOff =
    ('disposition' in value && value.disposition === 'handed-off') ||
    ('downloadStarted' in value && value.downloadStarted === true);
  if (!exportId && !(directDownload && handedOff)) return undefined;
  return {
    key: value.key,
    exportId,
    filename: value.filename,
    reportTitle: value.reportTitle,
    reportUrl:
      'reportUrl' in value ? safeReportUrl(value.reportUrl) : undefined,
    directDownload,
    autoDownload: !('autoDownload' in value) || value.autoDownload === true,
    disposition: handedOff
      ? 'handed-off'
      : 'disposition' in value && value.disposition === 'abandoned'
        ? 'abandoned'
        : 'awaiting',
  };
};

export const readExportIntents = (username?: string): ExportIntent[] => {
  try {
    window.sessionStorage.removeItem('gsa-report-export-jobs');
    if (!username) return [];
    const raw: unknown = JSON.parse(
      window.sessionStorage.getItem(storageKey(username)) ?? '[]',
    );
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const unfinished = new Set<string>();
    return raw.flatMap(value => {
      const intent = readIntent(value);
      if (!intent || seen.has(intent.key)) return [];
      if (intent.disposition === 'awaiting' && intent.exportId) {
        if (unfinished.has(intent.exportId)) return [];
        unfinished.add(intent.exportId);
      }
      seen.add(intent.key);
      return [intent];
    });
  } catch {
    return [];
  }
};

export const writeExportIntents = (
  username: string,
  intents: ExportIntent[],
) => {
  const unfinished = intents.filter(
    intent =>
      intent.autoDownload &&
      intent.disposition === 'awaiting' &&
      intent.exportId,
  );
  const receipts = intents
    .filter(intent => intent.disposition !== 'awaiting')
    .slice(-50);
  const values = [...unfinished, ...receipts].map(intent => ({
    key: intent.key,
    exportId: intent.exportId,
    filename: intent.filename,
    reportTitle: intent.reportTitle,
    reportUrl: intent.reportUrl,
    directDownload: intent.directDownload,
    autoDownload: intent.autoDownload,
    disposition: intent.disposition,
  }));
  try {
    const serialized = JSON.stringify(values);
    if (!values.length) window.sessionStorage.removeItem(storageKey(username));
    else if (window.sessionStorage.getItem(storageKey(username)) !== serialized)
      window.sessionStorage.setItem(storageKey(username), serialized);
  } catch {
    return;
  }
};
