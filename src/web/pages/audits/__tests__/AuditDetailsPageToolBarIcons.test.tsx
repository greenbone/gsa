/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Policy from 'gmp/models/policy';
import AuditDetailsPageToolBarIcons from 'web/pages/audits/AuditDetailsPageToolBarIcons';

const policy = Policy.fromElement({
  _id: '314',
  name: 'Policy 1',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  tasks: {
    task: [
      {_id: '12345', name: 'foo'},
      {_id: '678910', name: 'audit2'},
    ],
  },
});

const preferences = {
  preference: [
    {
      name: 'Add results to Asset Management',
      scanner_name: 'in_assets',
      value: 'yes',
    },
    {
      name: 'Auto Delete Reports',
      scanner_name: 'auto_delete',
      value: 'no',
    },
  ],
};

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const currentReport = {
  report: {
    _id: '12342',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
  },
};

const manualUrl = 'test/';

describe('AuditDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const audit = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'some comment',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.done,
      alterable: 1,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      preferences: preferences,
      usage_type: 'audit',
    });
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    expect(screen.getByTitle('Help: Audits')).toBeInTheDocument();
    expect(screen.getByTitle('Audit List')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/audits',
    );
  });

  test('should call click handlers for new audit', () => {
    const audit = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.new,
      alterable: 0,
      report_count: {__text: 0},
      result_count: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      preferences: preferences,
      usage_type: 'audit',
    });

    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit);
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit);
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');

    const startIcon = screen.getByTestId('start-icon');
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit);
    expect(startIcon).toHaveAttribute('title', 'Start');

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    const totalReports = screen.getByTitle('Total Reports for Audit foo');
    expect(totalReports).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(within(totalReports).getByTestId('badge-icon')).toHaveTextContent(
      '0',
    );

    const results = screen.getByTitle('Results for Audit foo');
    expect(results).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(results).toHaveAttribute('title', 'Results for Audit foo');
    expect(within(results).getByTestId('badge-icon')).toHaveTextContent('0');
  });

  test('should call click handlers for running audit', () => {
    const audit = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      in_use: 1,
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.running,
      alterable: 0,
      current_report: currentReport,
      report_count: {__text: 1},
      result_count: 0,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      preferences: preferences,
      usage_type: 'audit',
    });

    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit);

    const editIcon = screen.getByTestId('edit-icon');
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Audit is still in use');
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit);

    const stopIcon = screen.getByTestId('stop-icon');
    expect(stopIcon).toHaveAttribute('title', 'Stop');
    expect(handleAuditStopClick).not.toHaveBeenCalled();
    fireEvent.click(stopIcon);
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    expect(handleAuditStopClick).toHaveBeenCalledWith(audit);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

    const reports = screen.getByTitle(
      'Current Report for Audit foo from 07/30/2019',
    );
    expect(reports).toHaveAttribute('href', '/report/12342');

    const totalReports = screen.getByTitle('Total Reports for Audit foo');
    expect(totalReports).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(within(totalReports).getByTestId('badge-icon')).toHaveTextContent(
      '1',
    );

    const results = screen.getByTitle('Results for Audit foo');
    expect(results).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(within(results).getByTestId('badge-icon')).toHaveTextContent('0');
  });

  test('should call click handlers for stopped audit', () => {
    const audit5 = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.stopped,
      alterable: 0,
      current_report: currentReport,
      last_report: lastReport,
      report_count: {__text: 2},
      result_count: 10,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      preferences: preferences,
      usage_type: 'audit',
    });
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit5}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit5);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit5);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit5);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit5);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit5);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).toHaveBeenCalledWith(audit5);

    const reports = screen.getByTitle(
      'Current Report for Audit foo from 07/30/2019',
    );
    expect(reports).toHaveAttribute('href', '/report/12342');

    const totalReports = screen.getByTitle('Total Reports for Audit foo');
    expect(totalReports).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(within(totalReports).getByTestId('badge-icon')).toHaveTextContent(
      '2',
    );

    const results = screen.getByTitle('Results for Audit foo');
    expect(results).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(within(results).getByTestId('badge-icon')).toHaveTextContent('10');
  });

  test('should call click handlers for finished audit', () => {
    const audit2 = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      preferences: preferences,
      usage_type: 'audit',
    });
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit2}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit2);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit2);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit2);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit2);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

    const report = screen.getByTitle(
      'Last Report for Audit foo from 07/30/2019',
    );
    expect(report).toHaveAttribute('href', '/auditreport/1234');

    const totalReports = screen.getByTitle('Total Reports for Audit foo');
    expect(totalReports).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(within(totalReports).getByTestId('badge-icon')).toHaveTextContent(
      '1',
    );

    const results = screen.getByTitle('Results for Audit foo');
    expect(results).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(within(results).getByTestId('badge-icon')).toHaveTextContent('1');
  });

  test('should not call click handlers without permission', () => {
    const audit6 = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      preferences: preferences,
      usage_type: 'audit',
    });

    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit6}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');
    expect(handleAuditCloneClick).not.toHaveBeenCalled();
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit6);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Audit as XML');
    expect(handleAuditDownloadClick).not.toHaveBeenCalled();
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit6);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).not.toHaveBeenCalled();

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

    const report = screen.getByTitle(
      'Last Report for Audit foo from 07/30/2019',
    );
    expect(report).toHaveAttribute('href', '/auditreport/1234');

    const totalReports = screen.getByTitle('Total Reports for Audit foo');
    expect(totalReports).toHaveAttribute(
      'href',
      '/auditreports?filter=task_id%3D12345',
    );
    expect(within(totalReports).getByTestId('badge-icon')).toHaveTextContent(
      '1',
    );

    const results = screen.getByTitle('Results for Audit foo');
    expect(results).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(within(results).getByTestId('badge-icon')).toHaveTextContent('1');
  });

  test('should render schedule icon if audit is scheduled', () => {
    const audit7 = Audit.fromElement({
      _id: '12345',
      owner: {name: 'admin'},
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      status: AUDIT_STATUS.done,
      alterable: 0,
      last_report: lastReport,
      report_count: {__text: 1},
      result_count: 1,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      config: policy,
      schedule: {
        _id: '121314',
        name: 'schedule1',
        permissions: {permission: [{name: 'everything'}]},
      },
      schedule_periods: 1,
      preferences: preferences,
      usage_type: 'audit',
    });

    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    render(
      <AuditDetailsPageToolBarIcons
        entity={audit7}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const schedule = screen.getByTitle(/^View Details of Schedule/);
    expect(schedule).toHaveAttribute('href', '/schedule/121314');
    expect(schedule).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit7);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Audit is scheduled');
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
  });
});
