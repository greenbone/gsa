/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Capabilities from 'gmp/capabilities/capabilities';
import {type ReportExportKind} from 'web/report-export/job';

interface ReportFormatContentType {
  content_type?: string;
}

const EXPORT_COMMANDS = {
  scan: 'export_scan_report',
  audit: 'export_audit_report',
  delta_scan: 'export_delta_scan_report',
  delta_audit: 'export_delta_audit_report',
} as const satisfies Record<ReportExportKind, string>;

export const isPdfReportFormat = (format?: ReportFormatContentType) =>
  format?.content_type?.split(';', 1)[0].trim().toLowerCase() ===
  'application/pdf';

// gvmd only supports asynchronous export for PDF formats
export const selectExportTransport = (
  kind: ReportExportKind,
  format?: ReportFormatContentType,
  capabilities?: Pick<Capabilities, 'mayOp'>,
): 'async' | 'direct' =>
  isPdfReportFormat(format) && capabilities?.mayOp(EXPORT_COMMANDS[kind])
    ? 'async'
    : 'direct';
