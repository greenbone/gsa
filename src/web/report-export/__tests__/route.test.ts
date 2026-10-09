/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import {
  isPdfReportFormat,
  selectExportTransport,
} from 'web/report-export/route';

const PDF = {content_type: 'application/pdf'};

describe('isPdfReportFormat', () => {
  test('recognizes PDF content types regardless of case and parameters', () => {
    expect(isPdfReportFormat(PDF)).toBe(true);
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

describe('selectExportTransport', () => {
  test('uses async export for PDF when reports are accessible', () => {
    expect(selectExportTransport(PDF, new EverythingCapabilities())).toBe(
      'async',
    );
    expect(selectExportTransport(PDF, new Capabilities(['get_reports']))).toBe(
      'async',
    );
  });

  test('falls back to direct download without report access', () => {
    expect(selectExportTransport(PDF, new Capabilities(['get_tasks']))).toBe(
      'direct',
    );
    expect(selectExportTransport(PDF)).toBe('direct');
  });

  test('uses direct download for non-PDF formats', () => {
    expect(
      selectExportTransport(
        {content_type: 'text/xml'},
        new EverythingCapabilities(),
      ),
    ).toBe('direct');
  });

  test('can route another format asynchronously when a test policy enables it', () => {
    const isAsyncFormat = format => format?.content_type === 'text/xml';

    expect(
      selectExportTransport(
        {content_type: 'text/xml'},
        new EverythingCapabilities(),
        isAsyncFormat,
      ),
    ).toBe('async');
  });
});
