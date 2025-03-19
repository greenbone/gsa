/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import Row from 'web/pages/audits/Row';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {screen, rendererWithTable, fireEvent} from 'web/utils/Testing';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-10T12:51:27Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const currentReport = {
  report: {
    _id: '5678',
    timestamp: '2019-07-10T12:51:27Z',
  },
};

describe('Audit Row tests', () => {
  test('should render', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target'},
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
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {element} = render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(element).toBeVisible();

    // Name
    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('(bar)');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/auditreport/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/auditreport/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    expect(screen.getByTestId('start-icon')).toHaveAttribute('title', 'Start');
    expect(screen.getByTestId('resume-icon')).toHaveAttribute(
      'title',
      'Audit is not stopped',
    );
    expect(screen.getByTestId('trashcan-icon')).toHaveAttribute(
      'title',
      'Move Audit to trashcan',
    );
    expect(screen.getByTestId('edit-icon')).toHaveAttribute(
      'title',
      'Edit Audit',
    );
    expect(screen.getByTestId('clone-icon')).toHaveAttribute(
      'title',
      'Clone Audit',
    );
    expect(screen.getByTestId('export-icon')).toHaveAttribute(
      'title',
      'Export Audit',
    );
    expect(screen.getByTestId('download-icon')).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });

  test('should render icons', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.new,
      alterable: '1',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      scanner: {
        _id: 'id',
        name: 'scanner',
        type: GREENBONE_SENSOR_SCANNER_TYPE,
      },
      observers: {
        __text: 'anon nymous',
        role: [{name: 'lorem'}],
        group: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const handleAuditClone = testing.fn();
    const handleAuditDelete = testing.fn();
    const handleAuditDownload = testing.fn();
    const handleAuditEdit = testing.fn();
    const handleAuditResume = testing.fn();
    const handleAuditStart = testing.fn();
    const handleAuditStop = testing.fn();
    const handleReportDownload = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );
    expect(screen.getByTestId('alterable-icon')).toHaveAttribute(
      'title',
      'Audit is alterable',
    );
    expect(screen.getByTestId('sensor-icon')).toHaveAttribute(
      'title',
      'Audit is configured to run on sensor scanner',
    );
    expect(screen.getByTestId('provide-view-icon')).toHaveAttribute(
      'title',
      'Audit made visible for:\nUsers anon, nymous\nRoles lorem\nGroups ipsum, dolor',
    );
  });

  test('should call click handlers for new audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.new,
      alterable: '0',
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
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.new);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.new);

    const detailsLinks = screen.queryAllByTestId('details-link');
    expect(detailsLinks.length).toBe(0);
    // because there are no reports yet

    // Compliance Status
    expect(bars.length).toBe(1);
    // because there is no compliance status bar yet

    // Actions
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
    expect(handleReportDownload).not.toHaveBeenCalled();
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Report download not available',
    );
  });

  test('should call click handlers for running audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      in_use: true,
      status: AUDIT_STATUS.running,
      alterable: '0',
      current_report: currentReport,
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
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.running);
    expect(bars[0]).toHaveTextContent('0 %');

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('0 %');
    expect(detailsLinks[0]).toHaveAttribute('href', '/auditreport/5678');

    // Report
    expect(detailsLinks.length).toBe(1);
    // because there is no last report yet

    // Compliance Status
    expect(bars.length).toBe(1);
    // because there is no compliance status bar yet

    // Actions
    const stopIcon = screen.getByTestId('stop-icon');
    fireEvent.click(stopIcon);
    expect(handleAuditStart).not.toHaveBeenCalled();
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
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.stopped,
      alterable: '0',
      current_report: currentReport,
      last_report: lastReport,
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
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.stopped);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.stopped);

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Stopped');
    expect(detailsLinks[0]).toHaveAttribute('href', '/auditreport/5678');

    // Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/auditreport/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
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

  test('should call click handlers for finished audit', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
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
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/auditreport/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/auditreport/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
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

  test('should not call click handlers for audit without permission', () => {
    const audit = Audit.fromElement({
      _id: '314',
      owner: {name: 'user'},
      name: 'foo',
      comment: 'bar',
      status: AUDIT_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'get_tasks'}]},
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
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
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
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    expect(screen.getByTestId('observer-icon')).toHaveAttribute(
      'title',
      'Audit owned by user',
    );

    // Status
    const bars = screen.getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/auditreport/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/auditreport/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

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
});
