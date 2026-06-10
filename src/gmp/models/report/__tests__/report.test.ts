/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportReport from 'gmp/models/report/report';
import {parseDate} from 'gmp/parser';

describe('ReportReport tests', () => {
  test('should use defaults', () => {
    const report = new ReportReport();
    expect(report.delta_report).toBeUndefined();
    expect(report.filter).toBeUndefined();
    expect(report.report_type).toBeUndefined();
    expect(report.result_count).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_run_status).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.severity).toBeUndefined();
    expect(report.task).toBeUndefined();
  });

  test('should parse empty element', () => {
    const report = ReportReport.fromElement();
    expect(report.delta_report).toBeUndefined();
    expect(report.filter).toBeDefined();
    expect(report.report_type).toBeUndefined();
    expect(report.result_count).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_run_status).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.severity).toBeUndefined();
    expect(report.task).toBeDefined();
  });

  test('should parse filter', () => {
    const report = ReportReport.fromElement({
      filters: {
        _id: 'filter1',
        term: 'foo=bar',
      },
    });
    expect(report.filter).toBeDefined();
    expect(report.filter?.id).toEqual('filter1');
    expect(report.filter?.toFilterString()).toEqual('foo=bar');
  });

  test('should parse report type', () => {
    const report = ReportReport.fromElement({
      _type: 'delta',
    });
    expect(report.report_type).toEqual('delta');
  });

  test('should parse severity', () => {
    const report = ReportReport.fromElement({
      severity: {
        filtered: 5,
        full: 7,
      },
    });
    expect(report.severity).toBeDefined();
    expect(report.severity?.filtered).toEqual(5);
    expect(report.severity?.full).toEqual(7);
  });

  test('should parse scan start', () => {
    const report = ReportReport.fromElement({
      scan_start: '2024-01-01T00:00:00Z',
    });
    expect(report.scan_start).toEqual(parseDate('2024-01-01T00:00:00Z'));
  });

  test('should parse scan end', () => {
    const report = ReportReport.fromElement({
      scan_end: '2024-01-02T00:00:00Z',
    });
    expect(report.scan_end).toEqual(parseDate('2024-01-02T00:00:00Z'));
  });

  test('should parse task', () => {
    const report = ReportReport.fromElement({
      task: {
        _id: 'task1',
        name: 'Test Task',
      },
    });
    expect(report.task).toBeDefined();
    expect(report.task?.id).toEqual('task1');
    expect(report.task?.name).toEqual('Test Task');
  });

  test('should parse delta report', () => {
    const report = ReportReport.fromElement({
      delta: {
        report: {
          _id: 'delta1',
          scan_run_status: 'completed',
          scan_start: '2024-01-01T00:00:00Z',
          scan_end: '2024-01-02T00:00:00Z',
        },
      },
    });
    expect(report.delta_report).toBeDefined();
    expect(report.delta_report?.id).toEqual('delta1');
    expect(report.delta_report?.scan_run_status).toEqual('completed');
    expect(report.delta_report?.scan_start).toEqual(
      parseDate('2024-01-01T00:00:00Z'),
    );
    expect(report.delta_report?.scan_end).toEqual(
      parseDate('2024-01-02T00:00:00Z'),
    );
  });

  test('should parse scan run status', () => {
    const report = ReportReport.fromElement({
      scan_run_status: 'completed',
    });
    expect(report.scan_run_status).toEqual('completed');
  });

  test('should parse result_count', () => {
    const report = ReportReport.fromElement({
      result_count: {
        full: 10,
        filtered: 5,
        critical: {
          filtered: 4,
          full: 8,
        },
        high: {
          filtered: 3,
          full: 6,
        },
        medium: {
          filtered: 2,
          full: 4,
        },
        low: {
          filtered: 5,
          full: 10,
        },
        log: {
          filtered: 0,
          full: 1,
        },
        false_positive: {
          filtered: 1,
          full: 2,
        },
      },
    });
    expect(report.result_count).toBeDefined();
    expect(report.result_count?.full).toEqual(10);
    expect(report.result_count?.filtered).toEqual(5);
    expect(report.result_count?.low?.full).toEqual(10);
    expect(report.result_count?.low?.filtered).toEqual(5);
    expect(report.result_count?.medium?.full).toEqual(4);
    expect(report.result_count?.medium?.filtered).toEqual(2);
    expect(report.result_count?.high?.full).toEqual(6);
    expect(report.result_count?.high?.filtered).toEqual(3);
    expect(report.result_count?.log?.full).toEqual(1);
    expect(report.result_count?.log?.filtered).toEqual(0);
    expect(report.result_count?.false_positive?.full).toEqual(2);
    expect(report.result_count?.false_positive?.filtered).toEqual(1);
    expect(report.result_count?.critical?.full).toEqual(8);
    expect(report.result_count?.critical?.filtered).toEqual(4);
  });

  test('should parse timezone', () => {
    const report = ReportReport.fromElement({
      timezone: 'Europe/Berlin',
    });
    expect(report.timezone).toEqual('Europe/Berlin');
  });

  test('should parse timezone abbreviation', () => {
    const report = ReportReport.fromElement({
      timezone_abbrev: 'CET',
    });
    expect(report.timezone_abbrev).toEqual('CET');
  });
});
