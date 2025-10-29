/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collection-counts';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Filter from 'gmp/models/filter';
import Table from 'web/pages/audits/Table';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const caps = new Capabilities(['everything']);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-08-10T12:51:27Z',
    compliance_count: {yes: 4, no: 3, incomplete: 1},
  },
};

const lastReport2 = {
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

const audit = Audit.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id1', name: 'target1'},
});

const audit2 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'user'},
  name: 'lorem',
  comment: 'ipsum',
  status: AUDIT_STATUS.new,
  alterable: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id2', name: 'target2'},
});

const audit3 = Audit.fromElement({
  _id: '123456',
  owner: {name: 'user'},
  name: 'hello',
  comment: 'world',
  status: AUDIT_STATUS.running,
  alterable: '0',
  current_report: currentReport,
  last_report: lastReport2,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id2', name: 'target2'},
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 2,
});

const filter = Filter.fromString('rows=2');

describe('Audits table tests', () => {
  test('should render', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleReportDownloadClick = testing.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        entities={[audit, audit2, audit3]}
        entitiesCounts={counts}
        filter={filter}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
        onReportDownloadClick={handleReportDownloadClick}
      />,
    );

    expect(baseElement).toBeVisible();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Report');
    expect(header[3]).toHaveTextContent('Compliance Percent');
    expect(header[4]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleReportDownloadClick = testing.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {element} = render(
      <Table
        entities={[audit, audit2, audit3]}
        entitiesCounts={counts}
        filter={filter}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
        onReportDownloadClick={handleReportDownloadClick}
      />,
    );

    expect(element).not.toHaveTextContent('target1');
    expect(element).not.toHaveTextContent('target2');

    const foldIcon = screen.getByTestId('fold-state-icon-unfold');
    fireEvent.click(foldIcon);
    expect(foldIcon).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('target1');
    expect(element).toHaveTextContent('target2');
  });

  test('should call click handlers', () => {
    const handleAuditCloneClick = testing.fn();
    const handleAuditDeleteClick = testing.fn();
    const handleAuditDownloadClick = testing.fn();
    const handleAuditEditClick = testing.fn();
    const handleAuditStartClick = testing.fn();
    const handleAuditStopClick = testing.fn();
    const handleAuditResumeClick = testing.fn();
    const handleReportDownloadClick = testing.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    render(
      <Table
        entities={[audit, audit2, audit3]}
        entitiesCounts={counts}
        filter={filter}
        gcrFormatDefined={true}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
        onReportDownloadClick={handleReportDownloadClick}
      />,
    );

    const startIcon = screen.getAllByTestId('start-icon')[0];
    fireEvent.click(startIcon);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit);
    expect(startIcon).toHaveAttribute('title', 'Start');

    const resumeIcon = screen.getAllByTestId('resume-icon')[0];
    fireEvent.click(resumeIcon);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Audit is not stopped');

    const deleteIcon = screen.getAllByTestId('trashcan-icon')[0];
    fireEvent.click(deleteIcon);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit);
    expect(deleteIcon).toHaveAttribute('title', 'Move Audit to trashcan');

    const editIcon = screen.getAllByTestId('edit-icon')[0];
    fireEvent.click(editIcon);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit);
    expect(editIcon).toHaveAttribute('title', 'Edit Audit');

    const cloneIcon = screen.getAllByTestId('clone-icon')[0];
    fireEvent.click(cloneIcon);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Audit');

    const exportIcon = screen.getAllByTestId('export-icon')[0];
    fireEvent.click(exportIcon);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit);
    expect(exportIcon).toHaveAttribute('title', 'Export Audit');

    const downloadIcon = screen.getAllByTestId('download-icon')[0];
    fireEvent.click(downloadIcon);
    expect(handleReportDownloadClick).toHaveBeenCalledWith(audit);
    expect(downloadIcon).toHaveAttribute(
      'title',
      'Download Greenbone Compliance Report',
    );
  });
});
