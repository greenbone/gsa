/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ScanConfig from 'gmp/models/scanconfig';
import Schedule from 'gmp/models/schedule';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Details from 'web/pages/tasks/Details';
import {entityLoadingActions as scanconfigActions} from 'web/store/entities/scanconfigs';
import {entityLoadingActions as scheduleActions} from 'web/store/entities/schedules';
import {rendererWith} from 'web/utils/Testing';


const config = ScanConfig.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  tasks: {
    task: [
      {id: '12345', name: 'foo'},
      {id: '678910', name: 'task2'},
    ],
  },
});

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
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
      name: 'Apply Overrides when adding Assets',
      scanner_name: 'assets_apply_overrides',
      value: 'yes',
    },
    {
      name: 'Min QOD when adding Assets',
      scanner_name: 'assets_min_qod',
      value: '70',
    },
    {
      name: 'Auto Delete Reports',
      scanner_name: 'auto_delete',
      value: 'no',
    },
    {
      name: 'Auto Delete Reports Data',
      scanner_name: 'auto_delete_data',
      value: '5',
    },
  ],
};

const schedule = Schedule.fromElement({_id: '121314', name: 'schedule1'});

const getConfig = testing.fn().mockReturnValue(
  Promise.resolve({
    data: config,
  }),
);

const getSchedule = testing.fn().mockReturnValue(
  Promise.resolve({
    data: schedule,
  }),
);

const gmp = {
  scanconfig: {
    get: getConfig,
  },
  schedule: {
    get: getSchedule,
  },
};

describe('Task Details tests', () => {
  test('should render full task details', () => {
    const task = Task.fromElement({
      _id: '12345',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target1'},
      alert: {_id: '91011', name: 'alert1'},
      scanner: {_id: '1516', name: 'scanner1', type: '2'},
      preferences: preferences,
      schedule: schedule,
      config: config,
    });
    const caps = new Capabilities(['everything']);

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    store.dispatch(scanconfigActions.success('314', config));
    store.dispatch(scheduleActions.success('121314', schedule));

    const {element, getAllByTestId} = render(<Details entity={task} />);

    const headings = element.querySelectorAll('h2');
    const detailsLinks = getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Target');
    expect(detailsLinks[0]).toHaveAttribute('href', '/target/5678');
    expect(element).toHaveTextContent('target1');

    expect(headings[1]).toHaveTextContent('Alerts');
    expect(detailsLinks[1]).toHaveAttribute('href', '/alert/91011');
    expect(element).toHaveTextContent('alert1');

    expect(headings[2]).toHaveTextContent('Scanner');
    expect(detailsLinks[2]).toHaveAttribute('href', '/scanner/1516');
    expect(element).toHaveTextContent('scanner1');
    expect(element).toHaveTextContent('OpenVAS Scanner');

    expect(headings[3]).toHaveTextContent('Assets');

    expect(headings[4]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
