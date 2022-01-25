/* Copyright (C) 2019-2022 Greenbone Networks GmbH
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

import Task, {TASK_STATUS} from 'gmp/models/task';

import Status from '../status';

setLocale('en');

const caps = new Capabilities(['everything']);

describe('Task Status tests', () => {
  test('should render', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const {render} = rendererWith({capabilities: caps});
    const {element, getByTestId, queryByTestId} = render(
      <Status task={task} />,
    );

    expect(element).toMatchSnapshot();

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.new);
    expect(bar).toHaveTextContent(TASK_STATUS.new);

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toBe(null);
  });

  test('should render with last report', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.done,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      last_report: {report: {_id: '42'}},
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    const {getByTestId, queryByTestId} = render(<Status task={task} />);

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.done);
    expect(bar).toHaveTextContent(TASK_STATUS.done);

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Done');
    expect(detailslink).toHaveAttribute('href', '/report/42');
  });

  test('should render with current report', () => {
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      last_report: {report: {_id: '42'}},
      current_report: {report: {_id: '1234'}},
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    const {getByTestId, queryByTestId} = render(<Status task={task} />);

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', TASK_STATUS.running);
    expect(bar).toHaveTextContent('0 %');

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('0 %');
    expect(detailslink).toHaveAttribute('href', '/report/1234');
  });

  test('should render container', () => {
    const task = Task.fromElement({
      permissions: {permission: [{name: 'everything'}]},
      last_report: {report: {_id: '42'}},
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    const {getByTestId, queryByTestId} = render(<Status task={task} />);

    const bar = getByTestId('progressbar-box');
    expect(bar).toHaveAttribute('title', 'Container');
    expect(bar).toHaveTextContent('Container');

    const detailslink = queryByTestId('details-link');
    expect(detailslink).toHaveTextContent('Container');
    expect(detailslink).toHaveAttribute('href', '/report/42');
  });
});
