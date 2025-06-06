/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Task, {TASK_STATUS} from 'gmp/models/task';
import StopIcon from 'web/pages/tasks/icons/StopIcon';

describe('Task StopIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StopIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('stop_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Stop');
    expect(element).not.toHaveAttribute('disabled');
    expect(element).not.toHaveAttribute('data-disabled', 'true');
  });

  test('should render in active state with correct permissions if task queued', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.queued,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StopIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('stop_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Stop');
    expect(element).not.toHaveAttribute('disabled');
    expect(element).not.toHaveAttribute('data-disabled', 'true');
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StopIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('stop_task')).toEqual(false);
    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Permission to stop task denied');
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  test('should render in inactive state if wrong command level permissions are given for audit', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.running,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <StopIcon task={audit} usageType="audit" onClick={clickHandler} />,
    );

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(audit.userCapabilities.mayOp('stop_task')).toEqual(false);
    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Permission to stop audit denied');
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  test('should not be rendered if task is not running', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    render(<StopIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('stop_task')).toEqual(true);
    expect(screen.queryByTestId('stop-icon')).toEqual(null);
  });

  test('should not be rendered if task is a container', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    render(<StopIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('stop_task')).toEqual(true);
    expect(screen.queryByTestId('stop-icon')).toEqual(null);
  });
});
