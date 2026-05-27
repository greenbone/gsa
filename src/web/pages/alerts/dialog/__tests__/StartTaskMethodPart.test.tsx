/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
} from 'web/testing';
import Task from 'gmp/models/task';
import StartTaskMethodPart from 'web/pages/alerts/dialog/StartTaskMethodPart';

describe('StartTaskMethodPart tests', () => {
  test('should render StartTaskMethodPart component', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<StartTaskMethodPart onChange={onChange} />);

    const select = screen.getByName('start_task_task');
    expect(select).toBeInTheDocument();
  });

  test('should render with prefix', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(<StartTaskMethodPart prefix="test" onChange={onChange} />);

    const select = screen.getByName('test_start_task_task');
    expect(select).toBeInTheDocument();
  });

  test('should allow to change selected task', async () => {
    const onChange = testing.fn();
    const {render} = rendererWith({capabilities: true});
    const task1 = new Task({id: 'task1', name: 'Task 1'});
    const task2 = new Task({id: 'task2', name: 'Task 2'});
    render(
      <StartTaskMethodPart
        startTaskTask={task1.id}
        tasks={[task1, task2]}
        onChange={onChange}
      />,
    );

    const select = screen.getByRole<HTMLSelectElement>('textbox', {
      name: 'Start Task',
    });
    expect(select).toHaveValue(task1.name);
    const options = await getSelectItemElementsForSelect(select);
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Task 1');
    expect(options[1]).toHaveTextContent('Task 2');

    fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledWith(task2.id, 'start_task_task');
  });
});
