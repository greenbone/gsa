/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Report from 'gmp/models/report';
import {TASK_STATUS} from 'gmp/models/task';
import {getReportTaskFilter} from 'web/pages/reports/ReportListPage';

describe('ReportListPage task enrichment', () => {
  test('should not create a task filter without report task ids', () => {
    expect(getReportTaskFilter([])).toBeUndefined();
  });

  test('should create a filter for unique visible report task ids', () => {
    const firstReport = Report.fromElement({
      _id: 'report-1',
      report: {
        _id: 'report-1',
        scan_run_status: TASK_STATUS.running,
        task: {_id: 'task-1'},
      },
    });
    const secondReport = Report.fromElement({
      _id: 'report-2',
      report: {
        _id: 'report-2',
        scan_run_status: TASK_STATUS.running,
        task: {_id: 'task-2'},
      },
    });
    const duplicateReport = Report.fromElement({
      _id: 'report-3',
      report: {
        _id: 'report-3',
        scan_run_status: TASK_STATUS.running,
        task: {_id: 'task-1'},
      },
    });

    expect(
      getReportTaskFilter([
        firstReport,
        secondReport,
        duplicateReport,
      ])?.toFilterString(),
    ).toEqual('id=task-1,task-2');
  });

  test('should only include task ids from running reports', () => {
    const runningReport = Report.fromElement({
      _id: 'running-report',
      report: {
        _id: 'running-report',
        scan_run_status: TASK_STATUS.running,
        task: {_id: 'running-task'},
      },
    });
    const stoppedReport = Report.fromElement({
      _id: 'stopped-report',
      report: {
        _id: 'stopped-report',
        scan_run_status: TASK_STATUS.stopped,
        task: {_id: 'stopped-task'},
      },
    });

    expect(
      getReportTaskFilter([runningReport, stoppedReport])?.toFilterString(),
    ).toEqual('id=running-task');
  });

  test('should not create a task filter without running reports', () => {
    const stoppedReport = Report.fromElement({
      _id: 'stopped-report',
      report: {
        _id: 'stopped-report',
        scan_run_status: TASK_STATUS.stopped,
        task: {_id: 'stopped-task'},
      },
    });

    expect(getReportTaskFilter([stoppedReport])).toBeUndefined();
  });
});
