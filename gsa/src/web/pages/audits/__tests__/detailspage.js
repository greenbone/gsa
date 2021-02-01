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

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Policy from 'gmp/models/policy';
import Schedule from 'gmp/models/schedule';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {entityLoadingActions} from 'web/store/entities/audits';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, act} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

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

const schedule = Schedule.fromElement({
  _id: '121314',
  name: 'schedule1',
  permissions: {permission: [{name: 'everything'}]},
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

const audit5Id = {
  id: '12345',
};

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
let getPolicy;
let getSchedule;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getPolicy = jest.fn().mockResolvedValue({
    data: policy,
  });

  getSchedule = jest.fn().mockResolvedValue({
    data: schedule,
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
  test('should render full Detailspage', () => {
    const getAudit = jest.fn().mockResolvedValue({
      data: audit,
    });

    const gmp = {
      audit: {
        get: getAudit,
      },
      policy: {
        get: getPolicy,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', audit));

    const {baseElement, element, getAllByTestId} = render(
      <Detailspage id="12345" />,
    );

    expect(element).toMatchSnapshot();

    expect(element).toHaveTextContent('Audit: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Audits');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-audits',
    );

    expect(icons[1]).toHaveAttribute('title', 'Audit List');
    expect(links[1]).toHaveAttribute('href', '/audits');

    expect(element).toHaveTextContent('12345');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(element).toHaveTextContent('admin');

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('bar');

    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Done');
    expect(progressBars[0]).toHaveTextContent('Done');

    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailslinks[2]).toHaveAttribute('href', '/target/5678');
    expect(element).toHaveTextContent('target1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailslinks[3]).toHaveAttribute('href', '/alert/91011');
    expect(element).toHaveTextContent('alert1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailslinks[4]).toHaveAttribute('href', '/scanner/1516');
    expect(element).toHaveTextContent('scanner1');
    expect(element).toHaveTextContent('OpenVAS Scanner');

    expect(headings[4]).toHaveTextContent('Assets');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });

  test('should render permissions tab', () => {
    const getAudit = jest.fn().mockResolvedValue({
      data: audit2,
    });

    const gmp = {
      audit: {
        get: getAudit,
      },
      policy: {
        get: getPolicy,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', audit2));

    const {baseElement, element} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[16]);

    expect(element).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getAudit = jest.fn().mockResolvedValue({
      data: audit5,
    });

    const clone = jest.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const start = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const resume = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      audit: {
        get: getAudit,
        clone,
        delete: deleteFunc,
        export: exportFunc,
        start,
        resume,
      },
      policy: {
        get: getPolicy,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };
    const [renewQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [renewQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', audit5));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      fireEvent.click(icons[2]);
      expect(clone).toHaveBeenCalledWith(audit5);
      expect(icons[2]).toHaveAttribute('title', 'Clone Audit');

      fireEvent.click(icons[4]);
      expect(deleteFunc).toHaveBeenCalledWith(audit5Id);
      expect(icons[4]).toHaveAttribute('title', 'Move Audit to trashcan');

      fireEvent.click(icons[5]);
      expect(exportFunc).toHaveBeenCalledWith(audit5);
      expect(icons[5]).toHaveAttribute('title', 'Export Audit as XML');

      fireEvent.click(icons[6]);
      expect(start).toHaveBeenCalledWith(audit5);
      expect(icons[6]).toHaveAttribute('title', 'Start');

      fireEvent.click(icons[7]);
      expect(resume).toHaveBeenCalledWith(audit5);
      expect(icons[7]).toHaveAttribute('title', 'Resume');
    });
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
