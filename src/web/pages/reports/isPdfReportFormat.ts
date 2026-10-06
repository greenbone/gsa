/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface ReportFormatContentType {
  content_type?: string;
}

const isPdfReportFormat = (format?: ReportFormatContentType) =>
  format?.content_type?.split(';', 1)[0].trim().toLowerCase() ===
  'application/pdf';

export default isPdfReportFormat;