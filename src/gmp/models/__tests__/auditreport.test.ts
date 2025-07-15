/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AuditReport from 'gmp/models/auditreport';
import {testModel} from 'gmp/models/testing';

describe('AuditReport tests', () => {
  testModel(AuditReport, 'auditreport');

  test('should use defaults', () => {
    const report = new AuditReport();
    expect(report.contentType).toBeUndefined();
    expect(report.report).toBeUndefined();
    expect(report.reportFormat).toBeUndefined();
    expect(report.reportType).toBeUndefined();
    expect(report.task).toBeUndefined();
  });

  test('should parse empty element', () => {
    const report = AuditReport.fromElement();
    expect(report.contentType).toBeUndefined();
    expect(report.report).toBeUndefined();
    expect(report.reportFormat).toBeUndefined();
    expect(report.reportType).toBeUndefined();
    expect(report.task).toBeUndefined();
  });

  test('should parse report', () => {
    const report = AuditReport.fromElement({
      report: {
        _type: 'delta',
        _id: '123',
        name: 'Test AuditReport',
      },
    });
    expect(report.report).toBeDefined();
    expect(report.report?.reportType).toEqual('delta');
    expect(report.report?.id).toEqual('123');
    expect(report.report?.name).toEqual('Test AuditReport');
  });

  test('should parse report type', () => {
    const report = AuditReport.fromElement({
      _type: 'delta',
    });
    expect(report.reportType).toEqual('delta');
  });

  test('should parse report format', () => {
    const report = AuditReport.fromElement({
      report_format: {
        _id: 'format123',
        name: 'Test Format',
      },
    });
    expect(report.reportFormat).toBeDefined();
    expect(report.reportFormat?.id).toEqual('format123');
    expect(report.reportFormat?.name).toEqual('Test Format');
  });

  test('should parse task', () => {
    const report = AuditReport.fromElement({
      task: {
        _id: 'task123',
        name: 'Test Task',
      },
    });
    expect(report.task).toBeDefined();
    expect(report.task?.id).toEqual('task123');
    expect(report.task?.name).toEqual('Test Task');
  });

  test('should parse content type', () => {
    const report = AuditReport.fromElement({
      _content_type: 'application/xml',
    });
    expect(report.contentType).toEqual('application/xml');
  });
});
