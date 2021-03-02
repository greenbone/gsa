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

import {rendererWith} from 'web/utils/testing';

import {TASK_STATUS} from 'gmp/models/task';

import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

import Status from '../status';

setLocale('en');

const caps = new Capabilities(['everything']);

describe('Task Status tests', () => {
  test('should render', () => {
    const {newTask} = getMockTasks();

    const {render} = rendererWith({capabilities: caps});
    const {element, getByTestId, queryByTestId} = render(
      <Status task={newTask} />,
    );

    expect(element).toMatchSnapshot();

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.new);
    expect(bar).toHaveTextContent(TASK_STATUS.new);

    const detailslink = queryByTestId('details-link');
    expect(detailslink).not.toHaveAttribute('href');
  });

  test('should render with last report', () => {
    const {finishedTask} = getMockTasks();

    const {render} = rendererWith({capabilities: caps, router: true});
    const {getByTestId, queryByTestId} = render(<Status task={finishedTask} />);

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.done);
    expect(bar).toHaveTextContent(TASK_STATUS.done);

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Done');
    expect(detailslink).toHaveAttribute('href', '/report/1234');
  });

  test('should render with current report', () => {
    const {runningTask} = getMockTasks();

    const {render} = rendererWith({capabilities: caps, router: true});
    const {getByTestId, queryByTestId} = render(<Status task={runningTask} />);

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.running);
    expect(bar).toHaveTextContent('0 %');

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('0 %');
    expect(detailslink).toHaveAttribute('href', '/report/5678');
  });

  test('should render container', () => {
    const {containerTask} = getMockTasks();

    const {render} = rendererWith({capabilities: caps, router: true});
    const {getByTestId, queryByTestId} = render(
      <Status task={containerTask} />,
    );

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', 'Container');
    expect(bar).toHaveTextContent('Container');

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Container');
    expect(detailslink).toHaveAttribute('href', '/report/1234');
  });
});
