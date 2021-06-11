/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable no-console */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Audit, {AUDIT_STATUS, HYPERION_AUDIT_STATUS} from 'gmp/models/audit';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import Row from '../row';

setLocale('en');

let handleAuditClone;
let handleAuditDelete;
let handleAuditDownload;
let handleAuditEdit;
let handleAuditResume;
let handleAuditStart;
let handleAuditStop;
let handleReportDownload;
let handleToggleDetailsClick;

beforeEach(() => {
  handleAuditClone = jest.fn();
  handleAuditDelete = jest.fn();
  handleAuditDownload = jest.fn();
  handleAuditEdit = jest.fn();
  handleAuditResume = jest.fn();
  handleAuditStart = jest.fn();
  handleAuditStop = jest.fn();
  handleReportDownload = jest.fn();
  handleToggleDetailsClick = jest.fn();
});

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const lastReport = {
  id: '1234',
  creationTime: '2019-07-10T12:51:27Z',
  complianceCount: {yes: 4, no: 3, incomplete: 1},
};

const currentReport = {
  id: '5678',
  creationTime: '2019-07-10T12:51:27Z',
};

describe('Audit Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: HYPERION_AUDIT_STATUS.done,
      alterable: false,
      reports: {
        lastReport,
      },
      permissions: [{name: 'everything'}],
      target: {id: '5678', name: 'target'},
      usageType: 'audit',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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

    expect(baseElement).toMatchSnapshot();

    // Name
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    expect(screen.getAllByTitle('Start')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Audit is not stopped')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Move Audit to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Audit is not stopped')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Move Audit to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Audit')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Audit')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Audit')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Download Greenbone Compliance Report')[0],
    ).toBeInTheDocument();
  });

  test('should render icons', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: HYPERION_AUDIT_STATUS.new,
      alterable: true,
      reports: {
        lastReport,
      },
      permissions: [{name: 'everything'}],
      target: {id: 'id', name: 'target'},
      scanner: {
        id: 'id',
        name: 'scanner',
        type: 'GREENBONE_SENSOR_SCANNER_TYPE',
      },
      observers: {
        users: ['anon', 'nymous'],
        roles: [{name: 'lorem'}],
        groups: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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

    expect(screen.getAllByTitle('Audit is alterable')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Audit is configured to run on sensor scanner')[0],
    ).toBeInTheDocument();
    // expect(screen.getAllByTitle('Audit made visible for:\nUsers anon, nymous\nRoles lorem\nGroups ipsum, dolor')[0]).toBeInTheDocument();

    const icons = getAllByTestId('svg-icon'); // somehow screen.getAllByTitle does not work for the observer icon title...

    expect(icons[2]).toHaveAttribute(
      'title',
      'Audit made visible for:\nUsers anon, nymous\nRoles lorem\nGroups ipsum, dolor',
    );
  });

  test('should call click handlers for new audit', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: HYPERION_AUDIT_STATUS.new,
      alterable: false,
      permissions: [{name: 'everything'}],
      target: {id: 'id', name: 'target'},
      usageType: 'audit',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.new);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.new);

    // Compliance Satus
    expect(bars.length).toBe(1);
    // because there is no compliance status bar yet

    // Actions
    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    expect(resumeIcon[0]).toBeInTheDocument();
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);

    const editIcon = screen.getAllByTitle('Edit Audit');
    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);

    const exportIcon = screen.getAllByTitle('Export Audit');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);

    const reportDownloadIcon = screen.getAllByTitle(
      'Report download not available',
    );
    expect(reportDownloadIcon[0]).toBeInTheDocument();
    fireEvent.click(reportDownloadIcon[0]);
    expect(handleReportDownload).not.toHaveBeenCalled();
  });

  test('should call click handlers for running audit', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      inUse: true,
      status: HYPERION_AUDIT_STATUS.running,
      alterable: false,
      reports: {
        currentReport,
      },
      permissions: [{name: 'everything'}],
      target: {id: 'id', name: 'target'},
      usageType: 'audit',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.running);
    expect(bars[0]).toHaveTextContent('0 %');

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('0 %');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Report
    expect(detailsLinks.length).toBe(1);
    // because there is no last report yet

    // Compliance Satus
    expect(bars.length).toBe(1);
    // because there is no compliance status bar yet

    // Actions
    const stopIcon = screen.getAllByTitle('Stop');
    expect(stopIcon[0]).toBeInTheDocument();
    fireEvent.click(stopIcon[0]);
    expect(handleAuditStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    expect(resumeIcon[0]).toBeInTheDocument();
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Audit is still in use');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDelete).not.toHaveBeenCalled();

    const editIcon = screen.getAllByTitle('Edit Audit');
    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);

    const exportIcon = screen.getAllByTitle('Export Audit');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);

    const reportDownloadIcon = screen.getAllByTitle(
      'Report download not available',
    );
    expect(reportDownloadIcon[0]).toBeInTheDocument();
    fireEvent.click(reportDownloadIcon[0]);
    expect(handleReportDownload).not.toHaveBeenCalled();
  });

  test('should call click handlers for stopped audit', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: HYPERION_AUDIT_STATUS.stopped,
      alterable: false,
      reports: {
        currentReport,
        lastReport,
      },
      permissions: [{name: 'everything'}],
      target: {id: 'id', name: 'target'},
      usageType: 'audit',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.stopped);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.stopped);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Stopped');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);

    const resumeIcon = screen.getAllByTitle('Resume');
    expect(resumeIcon[0]).toBeInTheDocument();
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResume).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);

    const editIcon = screen.getAllByTitle('Edit Audit');
    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);

    const exportIcon = screen.getAllByTitle('Export Audit');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);

    const reportDownloadIcon = screen.getAllByTitle(
      'Download Greenbone Compliance Report',
    );
    expect(reportDownloadIcon[0]).toBeInTheDocument();
    fireEvent.click(reportDownloadIcon[0]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
  });

  test('should call click handlers for finished audit', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: HYPERION_AUDIT_STATUS.done,
      alterable: false,
      reports: {
        lastReport,
      },
      permissions: [{name: 'everything'}],
      target: {id: 'id', name: 'target'},
      usageType: 'audit',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleAuditStart).toHaveBeenCalledWith(audit);

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    expect(resumeIcon[0]).toBeInTheDocument();
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDelete).toHaveBeenCalledWith(audit);

    const editIcon = screen.getAllByTitle('Edit Audit');
    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleAuditEdit).toHaveBeenCalledWith(audit);

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);

    const exportIcon = screen.getAllByTitle('Export Audit');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);

    const reportDownloadIcon = screen.getAllByTitle(
      'Download Greenbone Compliance Report',
    );
    expect(reportDownloadIcon[0]).toBeInTheDocument();
    fireEvent.click(reportDownloadIcon[0]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
  });

  test('should not call click handlers for audit without permission', () => {
    const audit = Audit.fromObject({
      id: '314',
      owner: 'user',
      name: 'foo',
      comment: 'bar',
      status: HYPERION_AUDIT_STATUS.done,
      alterable: false,
      reports: {
        lastReport,
      },
      permissions: [{name: 'get_tasks'}],
      target: {id: 'id', name: 'target'},
      usageType: 'audit',
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={audit}
        links={true}
        gcrFormatDefined={true}
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
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[0]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    expect(screen.getAllByTitle('Audit owned by user')[0]).toBeInTheDocument();

    // Status
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', AUDIT_STATUS.done);
    expect(bars[0]).toHaveTextContent(AUDIT_STATUS.done);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Report
    expect(detailsLinks[1]).toHaveTextContent('Wed, Jul 10, 2019 2:51 PM CEST');
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Compliance Status
    expect(bars[1]).toHaveAttribute('title', '50%');
    expect(bars[1]).toHaveTextContent('50%');

    // Actions
    const startIcon = screen.getAllByTitle('Permission to start audit denied');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleAuditStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    expect(resumeIcon[0]).toBeInTheDocument();
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle(
      'Permission to move Audit to trashcan denied',
    );
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDelete).not.toHaveBeenCalled();

    const editIcon = screen.getAllByTitle('Permission to edit Audit denied');
    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleAuditEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditClone).toHaveBeenCalledWith(audit);

    const exportIcon = screen.getAllByTitle('Export Audit');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownload).toHaveBeenCalledWith(audit);

    const reportDownloadIcon = screen.getAllByTitle(
      'Download Greenbone Compliance Report',
    );
    expect(reportDownloadIcon[0]).toBeInTheDocument();
    fireEvent.click(reportDownloadIcon[0]);
    expect(handleReportDownload).toHaveBeenCalledWith(audit);
  });

  console.warn = consoleError;
});
