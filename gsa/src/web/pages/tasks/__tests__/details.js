/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import Capabilities from 'gmp/capabilities/capabilities';

import Schedule from 'gmp/models/schedule';
import ScanConfig, {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {entityLoadingActions as scanconfigActions} from 'web/store/entities/scanconfigs';
import {entityLoadingActions as scheduleActions} from 'web/store/entities/schedules';

import {rendererWith} from 'web/utils/testing';

import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

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

const schedule = {uuid: '121314', name: 'schedule1'};
const parsedSchedule = Schedule.fromObject(schedule);

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
    const {detailsMockTask: task} = getMockTasks();

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
    expect(detailslinks[0]).toHaveAttribute('href', '/target/159');
    expect(element).toHaveTextContent('target 1');

    expect(headings[1]).toHaveTextContent('Alerts');
    expect(detailslinks[1]).toHaveAttribute('href', '/alert/151617');
    expect(element).toHaveTextContent('alert 1');

    expect(headings[2]).toHaveTextContent('Scanner');
    expect(detailslinks[2]).toHaveAttribute('href', '/scanner/212223');
    expect(element).toHaveTextContent('scanner 1');
    expect(element).toHaveTextContent('OpenVAS Scanner');
    expect(element).toHaveTextContent('Scan Configfoo');
    expect(detailslinks[3]).toHaveAttribute('href', '/scanconfig/314');

    expect(headings[3]).toHaveTextContent('Assets');
    expect(element).toHaveTextContent('Add to AssetsYes');
    expect(element).toHaveTextContent('Apply OverridesYes');
    expect(element).toHaveTextContent('Min QoD70 %');

    expect(headings[4]).toHaveTextContent('Schedule');
    expect(detailslinks[4]).toHaveAttribute('href', '/schedule/121314');
    expect(element).toHaveTextContent('schedule 1');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
