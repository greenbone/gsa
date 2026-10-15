/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Capabilities from 'gmp/capabilities/capabilities';

interface ReportFormatContentType {
  content_type?: string;
}

export const isPdfReportFormat = (format?: ReportFormatContentType) =>
  format?.content_type?.split(';', 1)[0].trim().toLowerCase() ===
  'application/pdf';

// gvmd only supports asynchronous export for PDF formats
export const getReportExportMode = (
  format?: ReportFormatContentType,
  capabilities?: Pick<Capabilities, 'mayOp'>,
  isAsyncFormat: (
    format?: ReportFormatContentType,
  ) => boolean = isPdfReportFormat,
): 'async' | 'direct' =>
  isAsyncFormat(format) && capabilities?.mayOp('get_reports')
    ? 'async'
    : 'direct';
