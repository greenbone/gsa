/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Report from 'gmp/models/report';
import {testModel} from 'gmp/models/testing';

describe('Report tests', () => {
  testModel(Report, 'report');

  test('should use defaults', () => {
    const report = new Report();
    expect(report.content_type).toBeUndefined();
    expect(report.report).toBeUndefined();
    expect(report.report_config).toBeUndefined();
    expect(report.report_format).toBeUndefined();
    expect(report.report_type).toBeUndefined();
    expect(report.task).toBeUndefined();
  });

  test('should parse empty element', () => {
    const report = Report.fromElement();
    expect(report.content_type).toBeUndefined();
    expect(report.report).toBeUndefined();
    expect(report.report_config).toBeUndefined();
    expect(report.report_format).toBeUndefined();
    expect(report.report_type).toBeUndefined();
    expect(report.task).toBeUndefined();
  });

  test('should parse report', () => {
    const report = Report.fromElement({
      report: {
        _type: 'delta',
        _id: '123',
        name: 'Test Report',
      },
    });
    expect(report.report).toBeDefined();
    expect(report.report?.report_type).toEqual('delta');
    expect(report.report?.id).toEqual('123');
    expect(report.report?.name).toEqual('Test Report');
  });

  test('should parse report type', () => {
    const report = Report.fromElement({
      _type: 'delta',
    });
    expect(report.report_type).toEqual('delta');
  });

  test('should parse report config', () => {
    const report = Report.fromElement({
      report_config: {
        _id: 'config123',
        name: 'Test Config',
      },
    });
    expect(report.report_config).toBeDefined();
    expect(report.report_config?.id).toEqual('config123');
    expect(report.report_config?.name).toEqual('Test Config');
  });

  test('should parse report format', () => {
    const report = Report.fromElement({
      report_format: {
        _id: 'format123',
        name: 'Test Format',
      },
    });
    expect(report.report_format).toBeDefined();
    expect(report.report_format?.id).toEqual('format123');
    expect(report.report_format?.name).toEqual('Test Format');
  });

  test('should parse task', () => {
    const report = Report.fromElement({
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
    const report = Report.fromElement({
      _content_type: 'application/xml',
    });
    expect(report.content_type).toEqual('application/xml');
  });
});
