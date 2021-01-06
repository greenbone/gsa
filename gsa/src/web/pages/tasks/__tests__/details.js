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

import {setLocale} from 'gmp/locale/lang';

import {createGetScanConfigQueryMock} from 'web/graphql/__mocks__/scanconfigs';
import {createGetScheduleQueryMock} from 'web/graphql/__mocks__/schedules';

import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

import {rendererWith, screen, wait} from 'web/utils/testing';

import Details from '../details';

setLocale('en');

describe('Task Details tests', () => {
  test('should render full task details', async () => {
    const {detailsMockTask: task} = getMockTasks();

    const caps = new Capabilities(['everything']);
    const [scheduleMock, resultFunc] = createGetScheduleQueryMock('foo');
    const [scanConfigMock, scanConfigResult] = createGetScanConfigQueryMock();

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
      queryMocks: [scheduleMock, scanConfigMock],
    });

    const {element, getAllByTestId} = render(<Details entity={task} />);

    await wait();
    expect(element).toMatchSnapshot();
    expect(resultFunc).toHaveBeenCalled();
    expect(scanConfigResult).toHaveBeenCalled();

    const headings = screen.getAllByRole('heading');
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
    expect(element).toHaveTextContent('Scan Config');
    expect(detailslinks[3]).toHaveAttribute('href', '/scanconfig/314');
    expect(element).toHaveTextContent('Order for target hostssequential');
    expect(element).toHaveTextContent('Network Source Interface');
    expect(element).toHaveTextContent(
      'Maximum concurrently executed NVTs per host4',
    );
    expect(element).toHaveTextContent('Maximum concurrently scanned hosts20');

    expect(headings[3]).toHaveTextContent('Assets');
    expect(element).toHaveTextContent('Add to AssetsYes');
    expect(element).toHaveTextContent('Apply OverridesYes');
    expect(element).toHaveTextContent('Min QoD70 %');

    expect(headings[4]).toHaveTextContent('Schedule');
    expect(detailslinks[4]).toHaveAttribute('href', '/schedule/foo');
    expect(element).toHaveTextContent('schedule 1');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
