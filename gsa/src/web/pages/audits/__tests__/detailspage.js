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

const policy = {
  id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: [
    {id: '12345', name: 'foo'},
    {id: '678910', name: 'audit2'},
  ],
};

const lastReport = {
  id: '1234',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
  complianceCount: {yes: 4, no: 3, incomplete: 1},
};

const currentReport = {
  id: '12342',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
};

const preferences = [
  {
    description: 'Add results to Asset Management',
    name: 'in_assets',
    value: 'yes',
  },
  {
    description: 'Auto Delete Reports',
    name: 'auto_delete',
    value: 'no',
  },
];

const audit = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: true,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 1,
    },
  },
  permissions: [{name: 'everything'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  preferences,
  usageType: 'audit',
});

const audit2 = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: false,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 1,
    },
  },
  permissions: [{name: 'everything'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  preferences,
  usageType: 'audit',
});

const audit3 = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.new,
  alterable: false,
  reports: {
    counts: {
      total: 0,
    },
  },
  results: {
    counts: {
      current: 0,
    },
  },
  permissions: [{name: 'everything'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  preferences,
  usageType: 'audit',
});

const audit4 = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  inUse: true,
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.running,
  alterable: false,
  reports: {
    currentReport,
    counts: {
      total: 1,
    },
  },
  results: {
    counts: {
      current: 0,
    },
  },
  permissions: [{name: 'everything'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  preferences,
  usageType: 'audit',
});

const audit5 = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.stopped,
  alterable: false,
  reports: {
    currentReport,
    lastReport,
    counts: {
      total: 2,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 10,
    },
  },
  permissions: [{name: 'everything'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  preferences,
  usageType: 'audit',
});

const audit6 = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: false,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 1,
    },
  },
  permissions: [{name: 'get_tasks'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  preferences,
  usageType: 'audit',
});

const audit7 = Audit.fromObject({
  id: '12345',
  owner: 'admin',
  name: 'foo',
  comment: 'bar',
  creationTime: '2019-07-16T06:31:29Z',
  modificationTime: '2019-07-16T06:44:55Z',
  status: AUDIT_STATUS.done,
  alterable: false,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  results: {
    counts: {
      current: 1,
    },
  },
  permissions: [{name: 'everything'}],
  target: {id: '5678', name: 'target1'},
  alert: {id: '91011', name: 'alert1'},
  scanner: {id: '1516', name: 'scanner1', type: '2'},
  policy,
  schedule: {
    id: '121314',
    name: 'schedule1',
    permissions: [{name: 'everything'}],
  },
  schedulePeriods: 1,
  preferences,
  usageType: 'audit',
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

    expect(screen.getAllByTitle('Help: Audits')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );

    expect(screen.getAllByTitle('Audit List')[0]).toBeInTheDocument();
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
    const [renewQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, renewQueryMock],
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

    const {element} = render(
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

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );
    expect(screen.getAllByTitle('Help: Audits')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/audits');
    expect(screen.getAllByTitle('Audit List')[0]).toBeInTheDocument();
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

    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit3);

    const editIcon = screen.getAllByTitle('Edit Audit');
    fireEvent.click(editIcon[0]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit3);

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit3);

    const exportIcon = screen.getAllByTitle('Export Audit as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit3);

    const startIcon = screen.getAllByTitle('Start');
    fireEvent.click(startIcon[0]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit3);

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

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

    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit4);

    const editIcon = screen.getAllByTitle('Edit Audit');
    fireEvent.click(editIcon[0]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit4);

    const deleteIcon = screen.getAllByTitle('Audit is still in use');
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Audit as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit4);

    const stopIcon = screen.getAllByTitle('Stop');
    expect(stopIcon[0]).toBeInTheDocument();
    fireEvent.click(stopIcon[0]);
    expect(handleAuditStopClick).toHaveBeenCalledWith(audit4);

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

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

    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit5);

    const editIcon = screen.getAllByTitle('Edit Audit');
    fireEvent.click(editIcon[0]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit5);

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit5);

    const exportIcon = screen.getAllByTitle('Export Audit as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit5);

    const startIcon = screen.getAllByTitle('Start');
    fireEvent.click(startIcon[0]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit5);

    const resumeIcon = screen.getAllByTitle('Resume');
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResumeClick).toHaveBeenCalledWith(audit5);

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

    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit2);

    const editIcon = screen.getAllByTitle('Edit Audit');
    fireEvent.click(editIcon[0]);
    expect(handleAuditEditClick).toHaveBeenCalledWith(audit2);

    const deleteIcon = screen.getAllByTitle('Move Audit to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDeleteClick).toHaveBeenCalledWith(audit2);

    const exportIcon = screen.getAllByTitle('Export Audit as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit2);

    const startIcon = screen.getAllByTitle('Start');
    fireEvent.click(startIcon[0]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit2);

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

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

    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');

    const cloneIcon = screen.getAllByTitle('Clone Audit');
    fireEvent.click(cloneIcon[0]);
    expect(handleAuditCloneClick).toHaveBeenCalledWith(audit6);

    const editIcon = screen.getAllByTitle('Permission to edit Audit denied');
    fireEvent.click(editIcon[0]);
    expect(handleAuditEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle(
      'Permission to move Audit to trashcan denied',
    );
    fireEvent.click(deleteIcon[0]);
    expect(handleAuditDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Audit as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleAuditDownloadClick).toHaveBeenCalledWith(audit6);

    const startIcon = screen.getAllByTitle('Permission to start audit denied');
    fireEvent.click(startIcon[0]);
    expect(handleAuditStartClick).not.toHaveBeenCalled();

    const resumeIcon = screen.getAllByTitle('Audit is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();

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

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/schedule/121314');
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule1 (Next due: over)',
    );

    const startIcon = screen.getAllByTitle('Start');
    fireEvent.click(startIcon[0]);
    expect(handleAuditStartClick).toHaveBeenCalledWith(audit7);

    const resumeIcon = screen.getAllByTitle('Audit is scheduled');
    fireEvent.click(resumeIcon[0]);
    expect(handleAuditResumeClick).not.toHaveBeenCalled();
  });
});
