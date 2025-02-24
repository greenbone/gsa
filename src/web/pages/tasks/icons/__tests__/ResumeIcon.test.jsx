/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Task, {TASK_STATUS} from 'gmp/models/task';
import ResumeIcon from 'web/pages/tasks/icons/ResumeIcon';
import {rendererWith, fireEvent} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';


describe('Task ResumeIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Resume');
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute(
      'title',
      'Permission to resume task denied',
    );
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
  });

  test('should render in inactive state if task is not stopped', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is not stopped');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
  });

  test('should render in inactive state if wrong command level permissions are given for audit', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
      usage_type: 'audit',
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={audit} usageType="audit" />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(audit.userCapabilities.mayOp('resume_task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute(
      'title',
      'Permission to resume audit denied',
    );
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
    expect(element).toHaveStyleRule('color', Theme.inputBorderGray);
  });

  test('should render in inactive state if task is scheduled', () => {
    const caps = new Capabilities(['everything']);
    const elem = {
      status: TASK_STATUS.new,
      schedule: {
        _id: 'schedule1',
      },
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    };
    const task = Task.fromElement(elem);
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is scheduled');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
    expect(element).toHaveStyleRule('color', Theme.inputBorderGray);
  });

  test('should render in inactive state if task is a container', () => {
    const caps = new Capabilities(['everything']);
    const elem = {
      status: TASK_STATUS.new,
      permissions: {permission: [{name: 'everything'}]},
    };
    const task = Task.fromElement(elem);
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is a container');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
    expect(element).toHaveStyleRule('color', Theme.inputBorderGray);
  });

  test('should not be rendered if task is queued', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.queued,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    const {queryByTestId} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('stop_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('stop_task')).toEqual(true);

    expect(queryByTestId('resume-icon')).toEqual(null);
  });
});
