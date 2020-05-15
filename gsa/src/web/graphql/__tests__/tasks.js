/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {useGetTasks} from '../tasks';
import {createGetTaskQueryMock} from '../__mocks__/tasks';

import {rendererWith, screen, wait} from 'web/utils/testing';

const TestComponent = () => {
  const {counts, loading, tasks} = useGetTasks();
  if (loading) {
    return <span>Loading</span>;
  }
  return (
    <div>
      <div data-testid="counts">
        <span data-testid="total">{counts.all}</span>
        <span data-testid="filtered">{counts.filtered}</span>
        <span data-testid="offset">{counts.first}</span>
        <span data-testid="limit">{counts.rows}</span>
        <span data-testid="length">{counts.length}</span>
      </div>
      {tasks.map(task => {
        return (
          <div key={task.id} data-testid="task">
            {task.name}
          </div>
        );
      })}
    </div>
  );
};

describe('useGetTask tests', () => {
  test('should query a task', async () => {
    const [mock, resultFunc] = createGetTaskQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    const {element} = render(<TestComponent />);

    expect(element).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const taskElements = screen.getAllByTestId('task');
    expect(taskElements).toHaveLength(1);

    expect(taskElements[0]).toHaveTextContent('foo');

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('offset')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});
