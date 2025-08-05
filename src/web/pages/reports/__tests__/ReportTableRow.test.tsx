/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, screen, fireEvent} from 'web/testing';
import Report from 'gmp/models/report';
import {TASK_STATUS} from 'gmp/models/task';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import ReportTableRow from 'web/pages/reports/ReportTableRow';

const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('ReportTableRow tests', () => {
  test('should render the report row', () => {
    const report = Report.fromElement({
      _id: '1',
      report: {
        timestamp: '2024-01-01T12:00:00Z',
        scan_run_status: TASK_STATUS.running,
        severity: {filtered: 5},
        result_count: {
          high: {filtered: 10},
          medium: {filtered: 20},
          low: {filtered: 30},
          log: {filtered: 40},
          false_positive: {filtered: 50},
        },
        task: {
          _id: 'task-1',
          name: 'Task Name',
          progress: 50,
        },
      },
    });

    const {render} = rendererWithTableBody({capabilities: true, gmp});
    render(<ReportTableRow entity={report} links={true} />);

    expect(screen.queryAllByTestId('details-link')[0]).toHaveAttribute(
      'href',
      '/report/1',
    );
    expect(screen.getByTestId('statusbar-text')).toHaveTextContent('Uploading');
    expect(screen.getByText('Task Name')).toHaveAttribute(
      'href',
      '/task/task-1',
    );
    expect(screen.getByText('10')).toBeInTheDocument(); // High results
    expect(screen.getByText('20')).toBeInTheDocument(); // Medium results
    expect(screen.getByText('30')).toBeInTheDocument(); // Low results
    expect(screen.getByText('40')).toBeInTheDocument(); // Log results
    expect(screen.getByText('50')).toBeInTheDocument(); // False positives
  });

  test('should allow to delete a report', async () => {
    const handleDelete = testing.fn();
    const report = Report.fromElement({
      _id: '1',
      report: {
        timestamp: '2024-01-01T12:00:00Z',
        scan_run_status: TASK_STATUS.done,
        severity: {filtered: 5},
        result_count: {
          high: {filtered: 10},
          medium: {filtered: 20},
          low: {filtered: 30},
          log: {filtered: 40},
          false_positive: {filtered: 50},
        },
        task: {
          _id: 'task-1',
          name: 'Task Name',
          progress: 100,
        },
      },
    });
    const {render} = rendererWithTableBody({capabilities: true, gmp});
    render(
      <ReportTableRow entity={report} onReportDeleteClick={handleDelete} />,
    );

    const deleteIcon = screen.getByTitle('Delete Report');
    fireEvent.click(deleteIcon);
    expect(handleDelete).toHaveBeenCalledWith(report);
  });

  test('should allow to select a report for delta report comparison', async () => {
    const handleSelect = testing.fn();
    const report = Report.fromElement({
      _id: '1',
      report: {
        timestamp: '2024-01-01T12:00:00Z',
        scan_run_status: TASK_STATUS.done,
        severity: {filtered: 5},
        result_count: {
          high: {filtered: 10},
          medium: {filtered: 20},
          low: {filtered: 30},
          log: {filtered: 40},
          false_positive: {filtered: 50},
        },
        task: {
          _id: 'task-1',
          name: 'Task Name',
          progress: 100,
        },
      },
    });
    const {render} = rendererWithTableBody({capabilities: true, gmp});
    render(
      <ReportTableRow entity={report} onReportDeltaSelect={handleSelect} />,
    );
    const deltaIcon = screen.getByTitle('Select Report for delta comparison');
    fireEvent.click(deltaIcon);
    expect(handleSelect).toHaveBeenCalledWith(report);
  });

  test('should disable delete icon when scan is active', () => {
    const handleDelete = testing.fn();
    const report = Report.fromElement({
      _id: '1',
      report: {
        timestamp: '2024-01-01T12:00:00Z',
        scan_run_status: TASK_STATUS.running,
        severity: {filtered: 5},
        result_count: {
          high: {filtered: 10},
          medium: {filtered: 20},
          low: {filtered: 30},
          log: {filtered: 40},
          false_positive: {filtered: 50},
        },
        task: {
          _id: 'task-1',
          name: 'Task Name',
          progress: 50,
        },
      },
    });
    const {render} = rendererWithTableBody({capabilities: true, gmp});
    render(
      <ReportTableRow entity={report} onReportDeleteClick={handleDelete} />,
    );

    const deleteIcon = screen.getByTitle('Scan is active');
    expect(deleteIcon).toBeDisabled();
    fireEvent.click(deleteIcon);
    expect(handleDelete).not.toHaveBeenCalled();
  });

  test('should show report is selected for delta comparison when report is selected', () => {
    const report = Report.fromElement({
      _id: '1',
      report: {
        timestamp: '2024-01-01T12:00:00Z',
        scan_run_status: TASK_STATUS.done,
        severity: {filtered: 5},
        result_count: {
          high: {filtered: 10},
          medium: {filtered: 20},
          low: {filtered: 30},
          log: {filtered: 40},
          false_positive: {filtered: 50},
        },
        task: {
          _id: 'task-1',
          name: 'Task Name',
          progress: 100,
        },
      },
    });
    const {render} = rendererWithTableBody({capabilities: true, gmp});
    render(
      <ReportTableRow
        entity={report}
        selectedDeltaReport={report}
        onReportDeltaSelect={testing.fn()}
      />,
    );

    expect(
      screen.getByTitle('Report is selected for delta comparison'),
    ).toBeInTheDocument();
  });

  test('should show second delta icon when report is selected for delta comparison', () => {
    const report = Report.fromElement({
      _id: '1',
      report: {
        timestamp: '2024-01-01T12:00:00Z',
        scan_run_status: TASK_STATUS.done,
        severity: {filtered: 5},
        result_count: {
          high: {filtered: 10},
          medium: {filtered: 20},
          low: {filtered: 30},
          log: {filtered: 40},
          false_positive: {filtered: 50},
        },
        task: {
          _id: 'task-1',
          name: 'Task Name',
          progress: 100,
        },
      },
    });
    const selectedDeltaReport = new Report({id: '2'});
    const {render} = rendererWithTableBody({capabilities: true, gmp});
    render(
      <ReportTableRow
        entity={report}
        selectedDeltaReport={selectedDeltaReport}
        onReportDeltaSelect={testing.fn()}
      />,
    );

    expect(
      screen.getByTitle('Select Report for delta comparison'),
    ).toBeInTheDocument();
  });
});
