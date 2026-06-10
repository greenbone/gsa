/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {COMPLIANCE} from 'gmp/models/compliance';
import AuditReportReport from 'gmp/models/report/audit-report';
import {parseDate} from 'gmp/parser';

describe('AuditReportReport tests', () => {
  test('should use defaults', () => {
    const report = new AuditReportReport();
    expect(report.compliance).toBeUndefined();
    expect(report.complianceCounts).toBeUndefined();
    expect(report.delta_report).toBeUndefined();
    expect(report.filter).toBeUndefined();
    expect(report.reportType).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_run_status).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.task).toBeUndefined();
    expect(report.timezone).toBeUndefined();
    expect(report.timezone_abbrev).toBeUndefined();
  });

  test('should parse empty element', () => {
    const report = AuditReportReport.fromElement();
    expect(report.compliance).toBeUndefined();
    expect(report.complianceCounts).toBeUndefined();
    expect(report.delta_report).toBeUndefined();
    expect(report.filter).toBeDefined();
    expect(report.reportType).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_run_status).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.task).toBeDefined();
    expect(report.timezone).toBeUndefined();
    expect(report.timezone_abbrev).toBeUndefined();
  });

  test('should parse filter', () => {
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
      _type: 'delta',
    });
    expect(report.reportType).toEqual('delta');
  });

  test('should parse scan start', () => {
    const report = AuditReportReport.fromElement({
      scan_start: '2024-01-01T00:00:00Z',
    });
    expect(report.scan_start).toEqual(parseDate('2024-01-01T00:00:00Z'));
  });

  test('should parse scan end', () => {
    const report = AuditReportReport.fromElement({
      scan_end: '2024-01-02T00:00:00Z',
    });
    expect(report.scan_end).toEqual(parseDate('2024-01-02T00:00:00Z'));
  });

  test('should parse task', () => {
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
      scan_run_status: 'completed',
    });
    expect(report.scan_run_status).toEqual('completed');
  });

  test('should parse compliance count', () => {
    const report = AuditReportReport.fromElement({
      compliance_count: {
        full: 20,
        filtered: 5,
        yes: {
          full: 15,
          filtered: 3,
        },
        no: {
          full: 5,
          filtered: 2,
        },
        incomplete: {
          full: 2,
          filtered: 1,
        },
        undefined: {
          full: 3,
          filtered: 1,
        },
      },
    });
    expect(report.complianceCounts).toBeDefined();
    expect(report.complianceCounts?.full).toEqual(20);
    expect(report.complianceCounts?.filtered).toEqual(5);
    expect(report.complianceCounts?.yes?.full).toEqual(15);
    expect(report.complianceCounts?.yes?.filtered).toEqual(3);
    expect(report.complianceCounts?.no?.full).toEqual(5);
    expect(report.complianceCounts?.no?.filtered).toEqual(2);
    expect(report.complianceCounts?.incomplete?.full).toEqual(2);
    expect(report.complianceCounts?.incomplete?.filtered).toEqual(1);
    expect(report.complianceCounts?.undefined?.full).toEqual(3);
    expect(report.complianceCounts?.undefined?.filtered).toEqual(1);
  });

  test('should parse compliance', () => {
    const report = AuditReportReport.fromElement({
      compliance: {
        full: COMPLIANCE.INCOMPLETE,
        filtered: COMPLIANCE.YES,
      },
    });
    expect(report.compliance).toBeDefined();
    expect(report.compliance?.full).toEqual(COMPLIANCE.INCOMPLETE);
    expect(report.compliance?.filtered).toEqual(COMPLIANCE.YES);
  });

  test('should parse timezone', () => {
    const report = AuditReportReport.fromElement({
      timezone: 'Europe/Berlin',
    });
    expect(report.timezone).toEqual('Europe/Berlin');
  });

  test('should parse timezone abbreviation', () => {
    const report = AuditReportReport.fromElement({
      timezone_abbrev: 'CET',
    });
    expect(report.timezone_abbrev).toEqual('CET');
  });
});
