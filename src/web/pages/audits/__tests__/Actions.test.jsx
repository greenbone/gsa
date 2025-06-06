/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Actions from 'web/pages/audits/Actions';

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_task']);

describe('Audit Actions tests', () => {
  // deactivate console.error for tests
  // to make it possible to test actions without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.new,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: caps});
    const {container} = render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    expect(container.lastChild).toBeVisible();
  });

  test('should call click handlers', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const startIcon = screen.getByTestId('start-icon');
    fireEvent.click(startIcon);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);
    expect(startIcon).toHaveAttribute('title', 'Start');

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should not call click handlers without permissions', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_task'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const startIcon = screen.getByTestId('start-icon');
    fireEvent.click(startIcon);
    expect(handleAuditStart).not.toHaveBeenCalled();
    expect(startIcon).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditClone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Audit denied',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should not call click handlers for stopped audit without permissions', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_task'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const startIcon = screen.getByTestId('start-icon');
    fireEvent.click(startIcon);
    expect(handleAuditStart).not.toHaveBeenCalled();
    expect(startIcon).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute(
      'title',
      'Permission to resume audit denied',
    );

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditClone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Audit denied',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should not call click handlers for running audit without permissions', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.running,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'get_task'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: wrongCaps});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const stopIcon = screen.getByTestId('stop-icon');
    fireEvent.click(stopIcon);
    expect(handleAuditStop).not.toHaveBeenCalled();
    expect(stopIcon).toHaveAttribute(
      'title',
      'Permission to stop audit denied',
    );

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditClone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Audit denied',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should call click handlers for running audit', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.running,
      alterable: '0',
      in_use: true,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const stopIcon = screen.getByTestId('stop-icon');
    fireEvent.click(stopIcon);
    expect(handleAuditStop).toHaveBeenCalledWith(audit);
    expect(stopIcon).toHaveAttribute('title', 'Stop');

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Audit is still in use');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    // should not be called because the audit does not have a report yet
    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Report download not available',
    );
  });

  test('should call click handlers for stopped audit', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={true}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const startIcon = screen.getByTestId('start-icon');
    fireEvent.click(startIcon);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);
    expect(startIcon).toHaveAttribute('title', 'Start');

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).toHaveBeenCalledWith(audit);
    expect(resumeIcon).toHaveAttribute('title', 'Resume');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should disable report download if grc format is not defined', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={false}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Report download not available',
    );
  });

  test('should render schedule icon if task is scheduled', () => {
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      last_report: {report: {_id: 'id'}},
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      schedule: {
        _id: 'schedule1',
        name: 'schedule1',
        permissions: {permission: [{name: 'everything'}]},
      },
      usage_type: 'audit',
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();

    const {render} = rendererWith({
      capabilities: true,
      store: true,
      router: true,
    });
    render(
      <Actions
        entity={audit}
        gcrFormatDefined={false}
        links={true}
        onAuditCloneClick={handleAuditClone}
        onAuditDeleteClick={handleAuditDelete}
        onAuditDownloadClick={handleAuditDownload}
        onAuditEditClick={handleAuditEdit}
        onAuditResumeClick={handleAuditResume}
        onAuditStartClick={handleAuditStart}
        onAuditStopClick={handleAuditStop}
        onReportDownloadClick={handleReportDownload}
      />,
    );

    const detailsLinks = screen.getAllByTestId('details-link');

    fireEvent.click(detailsLinks[0]);
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    const resumeIcon = screen.getByTestId('resume-icon');
    fireEvent.click(resumeIcon);
    expect(handleAuditResume).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is scheduled');
  });

  console.warn = consoleError;
});
