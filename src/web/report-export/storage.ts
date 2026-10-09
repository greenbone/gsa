/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ExportIntent, MAX_RETAINED_RECEIPTS} from 'web/report-export/job';

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

const DISPOSITIONS: ExportIntent['disposition'][] = [
  'awaiting',
  'handed-off',
  'abandoned',
];

const readIntent = (value: unknown): ExportIntent | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  if (
    !('key' in value) ||
    typeof value.key !== 'string' ||
    !value.key ||
    !('exportId' in value) ||
    typeof value.exportId !== 'string' ||
    !value.exportId ||
    !('filename' in value) ||
    typeof value.filename !== 'string' ||
    !('reportTitle' in value) ||
    typeof value.reportTitle !== 'string' ||
    !('origin' in value) ||
    (value.origin !== 'local' && value.origin !== 'discovered') ||
    !('disposition' in value) ||
    !DISPOSITIONS.includes(value.disposition as ExportIntent['disposition'])
  )
    return undefined;
  return {
    key: value.key,
    origin: value.origin,
    exportId: value.exportId,
    filename: value.filename,
    reportTitle: value.reportTitle,
    reportUrl:
      'reportUrl' in value ? safeReportUrl(value.reportUrl) : undefined,
    autoDownload: 'autoDownload' in value && value.autoDownload === true,
    disposition: value.disposition as ExportIntent['disposition'],
  };
};

export const readExportIntents = (username?: string): ExportIntent[] => {
  try {
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
    .slice(-MAX_RETAINED_RECEIPTS);
  const values = [...unfinished, ...receipts].map(intent => ({
    key: intent.key,
    origin: intent.origin,
    exportId: intent.exportId,
    filename: intent.filename,
    reportTitle: intent.reportTitle,
    reportUrl: intent.reportUrl,
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
