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
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Policy from 'gmp/models/policy';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {isDefined} from 'gmp/utils/identity';

import {
  auditPolicy,
  auditSchedule,
  createCloneAuditQueryMock,
  createDeleteAuditQueryMock,
  createExportAuditsByIdsQueryMock,
  createGetAuditQueryMock,
  createResumeAuditQueryMock,
  createStartAuditQueryMock,
  unscheduledAudit,
} from 'web/graphql/__mocks__/audits';
import {createGetScheduleQueryMock} from 'web/graphql/__mocks__/schedules';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {createGetPolicyQueryMock} from 'web/graphql/__mocks__/policies';
import {
  createGetPermissionsQueryMock,
  noPermissions,
} from 'web/graphql/__mocks__/permissions';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '657',
  }),
}));

const policy = Policy.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  policy_type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '12345', name: 'foo'},
      {id: '678910', name: 'audit2'},
    ],
  },
});

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

const audit = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '1',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit2 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit3 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.new,
  alterable: '0',
  report_count: {__text: '0'},
  result_count: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit4 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  in_use: '1',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.running,
  alterable: '0',
  current_report: currentReport,
  report_count: {__text: '1'},
  result_count: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit5 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.stopped,
  alterable: '0',
  current_report: currentReport,
  last_report: lastReport,
  report_count: {__text: '2'},
  result_count: '10',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit6 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'get_tasks'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: policy,
  preferences: preferences,
  usage_type: 'audit',
});

const audit7 = Audit.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
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
  schedule_periods: '1',
  preferences: preferences,
  usage_type: 'audit',
});

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getEntities;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getEntities = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('Audit Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetAuditQueryMock();
    const [scheduleMock, scheduleResult] = createGetScheduleQueryMock(
      'foo',
      auditSchedule,
    );
    const [policyMock, policyResult] = createGetPolicyQueryMock(
      '234',
      auditPolicy,
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, scheduleMock, policyMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement, getAllByTestId} = render(<Detailspage />);

    await wait();

    expect(baseElement).toMatchSnapshot();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResult).toHaveBeenCalled();
    expect(policyResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Audit: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Audits');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );

    expect(icons[1]).toHaveAttribute('title', 'Audit List');
    expect(links[1]).toHaveAttribute('href', '/audits');

    expect(baseElement).toHaveTextContent('657');
    expect(baseElement).toHaveTextContent('Tue, Jul 30, 2019 3:00 PM CEST');
    expect(baseElement).toHaveTextContent('Fri, Aug 30, 2019 3:23 PM CEST');
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');

    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Done');
    expect(progressBars[0]).toHaveTextContent('Done');

    const headings = baseElement.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailslinks[3]).toHaveAttribute('href', '/target/159');
    expect(baseElement).toHaveTextContent('target 1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailslinks[4]).toHaveAttribute('href', '/alert/151617');
    expect(baseElement).toHaveTextContent('alert 1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailslinks[5]).toHaveAttribute('href', '/scanner/212223');
    expect(baseElement).toHaveTextContent('scanner 1');
    expect(baseElement).toHaveTextContent('OpenVAS Scanner');

    expect(detailslinks[6]).toHaveAttribute('href', '/policy/234');
    expect(baseElement).toHaveTextContent('unnamed policy');
    expect(baseElement).toHaveTextContent('Order for target hosts');
    expect(baseElement).toHaveTextContent('sequential');
    expect(baseElement).toHaveTextContent('Network Source Interface');
    expect(baseElement).toHaveTextContent(
      'Maximum concurrently executed NVTs per host',
    );
    expect(baseElement).toHaveTextContent('4');
    expect(baseElement).toHaveTextContent('Maximum concurrently scanned hosts');
    expect(baseElement).toHaveTextContent('20');

    expect(headings[4]).toHaveTextContent('Assets');
    expect(baseElement).toHaveTextContent('Add to Assets');
    expect(baseElement).toHaveTextContent('Yes');

    expect(headings[5]).toHaveTextContent('Schedule');
    expect(detailslinks[7]).toHaveAttribute('href', '/schedule/foo');
    expect(baseElement).toHaveTextContent('schedule 1');

    expect(headings[6]).toHaveTextContent('Scan');
    expect(baseElement).toHaveTextContent('2 minutes');
    expect(baseElement).toHaveTextContent(
      'Do not automatically delete reports',
    );
  });

  test('should render permissions tab', async () => {
    const gmp = {
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetAuditQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=657 first=1 rows=-1',
      },
      noPermissions,
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[16]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const gmp = {
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetAuditQueryMock('657', unscheduledAudit);

    const [renewQueryMock] = createRenewSessionQueryMock();
    const [startMock, startResult] = createStartAuditQueryMock('657', 'r1');
    const [resumeMock, resumeResult] = createResumeAuditQueryMock('657');
    const [cloneMock, cloneResult] = createCloneAuditQueryMock('657', '456');
    const [exportMock, exportResult] = createExportAuditsByIdsQueryMock();
    const [deleteMock, deleteResult] = createDeleteAuditQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewQueryMock,
        startMock,
        resumeMock,
        cloneMock,
        exportMock,
        deleteMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    render(<Detailspage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    await wait();
    expect(cloneResult).toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Audit as XML');
    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();
    expect(exportResult).toHaveBeenCalled();

    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);

    await wait();
    expect(startResult).toHaveBeenCalled();

    const resumeIcon = screen.getAllByTitle('Resume');
    expect(resumeIcon[0]).toBeInTheDocument();
    fireEvent.click(resumeIcon[0]);

    await wait();
    expect(resumeResult).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });
});

describe('Audit ToolBarIcons tests', () => {
  test('should render', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons
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

    expect(element).toMatchSnapshot();

    const icons = getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );
    expect(icons[0]).toHaveAttribute('title', 'Help: Audits');

    expect(links[1]).toHaveAttribute('href', '/audits');
    expect(icons[1]).toHaveAttribute('title', 'Audit List');
  });

  test('should call click handlers for new audit', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={audit3}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    fireEvent.click(icons[2]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit3);
    expect(icons[2]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[3]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit3);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit3);
    expect(icons[4]).toHaveAttribute('title', 'Move Audit to trashcan');

    fireEvent.click(icons[5]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit3);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit as XML');

    fireEvent.click(icons[6]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit3);
    expect(icons[6]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[7]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Audit is not stopped');

    expect(links[2]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[2]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('0');

    expect(links[3]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('0');
  });

  test('should call click handlers for running audit', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
        entity={audit4}
        onAuditCloneClick={handleAuditCloneClick}
        onAuditDeleteClick={handleAuditDeleteClick}
        onAuditDownloadClick={handleAuditDownloadClick}
        onAuditEditClick={handleAuditEditClick}
        onAuditResumeClick={handleAuditResumeClick}
        onAuditStartClick={handleAuditStartClick}
        onAuditStopClick={handleAuditStopClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    fireEvent.click(icons[2]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit4);
    expect(icons[2]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[3]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit4);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Audit is still in use');

    fireEvent.click(icons[5]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit4);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit as XML');

    fireEvent.click(icons[6]);
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    expect(handleAuditStopClick).toHaveBeenCalledWith(audit4);
    expect(icons[6]).toHaveAttribute('title', 'Stop');

    fireEvent.click(icons[7]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Audit is not stopped');

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('0');
  });

  test('should call click handlers for stopped audit', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    fireEvent.click(icons[2]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit5);
    expect(icons[2]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[3]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit5);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit5);
    expect(icons[4]).toHaveAttribute('title', 'Move Audit to trashcan');

    fireEvent.click(icons[5]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit5);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit as XML');

    fireEvent.click(icons[6]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit5);
    expect(icons[6]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[7]);
    expect(handleAuditResumeClick).toHaveBeenCalledWith(audit5);
    expect(icons[7]).toHaveAttribute('title', 'Resume');

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('2');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('10');
  });

  test('should call click handlers for finished audit', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    fireEvent.click(icons[2]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit2);
    expect(icons[2]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[3]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit2);
    expect(icons[3]).toHaveAttribute('title', 'Edit Audit');

    fireEvent.click(icons[4]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit2);
    expect(icons[4]).toHaveAttribute('title', 'Move Audit to trashcan');

    fireEvent.click(icons[5]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit2);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit as XML');

    fireEvent.click(icons[6]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit2);
    expect(icons[6]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[7]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Audit is not stopped');

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('1');
  });

  test('should not call click handlers without permission', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement, getAllByTestId} = render(
      <ToolBarIcons
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    fireEvent.click(icons[2]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit6);
    expect(icons[2]).toHaveAttribute('title', 'Clone Audit');

    fireEvent.click(icons[3]);
    expect(handleAuditEditClick).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Audit denied',
    );

    fireEvent.click(icons[4]);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to move Audit to trashcan denied',
    );

    fireEvent.click(icons[5]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit6);
    expect(icons[5]).toHaveAttribute('title', 'Export Audit as XML');

    fireEvent.click(icons[6]);
    expect(handleAuditStartClick).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );

    fireEvent.click(icons[7]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Audit is not stopped');

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Audit foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Audit foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Audit foo');
    expect(badgeIcons[1]).toHaveTextContent('1');
  });

  test('should render schedule icon if audit is scheduled', () => {
    const handleAuditCloneClick = jest.fn();
    const handleAuditDeleteClick = jest.fn();
    const handleAuditDownloadClick = jest.fn();
    const handleAuditEditClick = jest.fn();
    const handleAuditResumeClick = jest.fn();
    const handleAuditStartClick = jest.fn();
    const handleAuditStopClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
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

    const icons = getAllByTestId('svg-icon');
    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/schedule/121314');
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    fireEvent.click(icons[7]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit7);
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Audit is scheduled');
  });
});
