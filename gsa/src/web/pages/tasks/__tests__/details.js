/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';

import Task, {TASK_STATUS} from 'gmp/models/task';
import Schedule from 'gmp/models/schedule';
import ScanConfig, {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {entityLoadingActions as scanconfigActions} from 'web/store/entities/scanconfigs';
import {entityLoadingActions as scheduleActions} from 'web/store/entities/schedules';

import {rendererWith} from 'web/utils/testing';

import Details from '../details';

setLocale('en');

const scanConfig = {
  uuid: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', scannerType: 0},
  type: OPENVAS_SCAN_CONFIG_TYPE,
};

const parsedConfig = ScanConfig.fromObject(scanConfig);

const lastReport = {
  uuid: '1234',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
};

const schedule = {uuid: '121314', name: 'schedule1'};

const parsedSchedule = Schedule.fromObject(schedule);

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

const getConfig = jest.fn().mockReturnValue(
  Promise.resolve({
    data: parsedConfig,
  }),
);

const getSchedule = jest.fn().mockReturnValue(
  Promise.resolve({
    data: parsedSchedule,
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
    const task = Task.fromObject({
      uuid: '12345',
      owner: 'username',
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: 0,
      lastReport,
      permissions: [{name: 'everything'}],
      target: {uuid: '5678', name: 'target1'},
      alerts: [{uuid: '91011', name: 'alert1'}],
      scanner: {uuid: '1516', name: 'scanner1', type: 2},
      preferences: preferences,
      schedule: {uuid: '121314', name: 'schedule1'},
      scanConfig,
    });

    const caps = new Capabilities(['everything']);

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    store.dispatch(scanconfigActions.success('314', scanConfig));
    store.dispatch(scheduleActions.success('121314', parsedSchedule));

    const {element, getAllByTestId} = render(<Details entity={task} />);

    expect(element).toMatchSnapshot();

    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Target');
    expect(detailslinks[0]).toHaveAttribute('href', '/target/5678');
    expect(element).toHaveTextContent('target1');

    expect(headings[1]).toHaveTextContent('Alerts');
    expect(detailslinks[1]).toHaveAttribute('href', '/alert/91011');
    expect(element).toHaveTextContent('alert1');

    expect(headings[2]).toHaveTextContent('Scanner');
    expect(detailslinks[2]).toHaveAttribute('href', '/scanner/1516');
    expect(element).toHaveTextContent('scanner1');
    expect(element).toHaveTextContent('OpenVAS Scanner');

    expect(headings[3]).toHaveTextContent('Assets');
    expect(element).toMatchSnapshot();

    expect(detailslinks[3]).toHaveAttribute('href', '/scanconfig/314');

    expect(headings[4]).toHaveTextContent('Schedule');
    expect(detailslinks[4]).toHaveAttribute('href', '/schedule/121314');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
