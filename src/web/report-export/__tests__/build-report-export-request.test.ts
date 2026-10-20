/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {buildReportExportRequest} from 'web/report-export/build-report-export-request';

describe('buildReportExportRequest', () => {
  test.each([
    ['scan', 'scan', true, false],
    ['audit', 'audit', false, false],
    ['delta_scan', 'delta_scan', true, true],
    ['delta_audit', 'delta_audit', false, true],
  ] as const)(
    'builds the %s request without dropping shared or kind-specific metadata',
    (kind, expectedKind, includesConfig, includesDelta) => {
      const filter = QueryFilter.fromString('rows=100');
      const request = buildReportExportRequest({
        kind,
        entity: {id: 'report-id', task: {name: 'Task report'}},
        format: {
          id: 'format-id',
          name: 'XML',
          extension: 'xml',
          content_type: 'text/xml',
        },
        filter,
        reportConfigId: 'config-id',
        deltaReportId: 'delta-id',
        reportUrl: '/reports/report-id',
        fileNameFormat: '%N',
        username: 'alice',
        fallbackReportTitle: 'Report',
      });

      expect(request).toMatchObject({
        kind: expectedKind,
        filename: 'Task report.xml',
        reportTitle: 'report-id',
        reportUrl: '/reports/report-id',
        payload: {
          reportId: 'report-id',
          reportFormatId: 'format-id',
          filter,
        },
      });
      expect(request.payload.reportConfigId).toBe(
        includesConfig ? 'config-id' : undefined,
      );
      expect(request.payload.deltaReportId).toBe(
        includesDelta ? 'delta-id' : undefined,
      );
    },
  );
});
