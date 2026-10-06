/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import isPdfReportFormat from 'web/pages/reports/is-pdf-report-format';

describe('isPdfReportFormat', () => {
  test('recognizes PDF content types regardless of case and parameters', () => {
    expect(isPdfReportFormat({content_type: 'application/pdf'})).toBe(true);
    expect(
      isPdfReportFormat({content_type: 'Application/PDF; charset=binary'}),
    ).toBe(true);
  });

  test('does not treat other or missing content types as PDF', () => {
    expect(isPdfReportFormat({content_type: 'text/xml'})).toBe(false);
    expect(isPdfReportFormat({content_type: undefined})).toBe(false);
    expect(isPdfReportFormat()).toBe(false);
  });
});
