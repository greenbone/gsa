/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Task, {TASK_STATUS} from 'gmp/models/task';
import ResumeIcon from 'web/pages/tasks/icons/TaskResumeIcon';
import Theme from 'web/utils/theme';

describe('Task ResumeIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={task} onClick={clickHandler} />);

    const resumeIcon = screen.getByTitle('Resume');

    fireEvent.click(resumeIcon);

    expect(clickHandler).toHaveBeenCalled();
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    expect(resumeIcon).not.toHaveComputedStyle('fill', Theme.inputBorderGray);
  });

  test('should render in active state if a stopped task has a schedule', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.stopped,
      schedule: {_id: 'schedule1'},
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={task} />);

    const resumeIcon = screen.getByTitle('Resume');

    fireEvent.click(resumeIcon);

    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    expect(resumeIcon).not.toHaveAttribute('disabled');
  });

  test('should render in active state for a stopped task with a real schedule', () => {
    const caps = new Capabilities(['everything']);
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 22.4//EN
BEGIN:VEVENT
DTSTART:20260727T163200Z
DURATION:PT0S
END:VEVENT
END:VCALENDAR
`;
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
      schedule: {_id: 'schedule1', icalendar, timezone: 'UTC'},
    });

    const {render} = rendererWith({capabilities: caps});
    render(<ResumeIcon task={task} />);

    const resumeIcon = screen.getByTitle('Resume');

    fireEvent.click(resumeIcon);

    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    expect(resumeIcon).not.toHaveAttribute('disabled');
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={task} />);

    const resumeIcon = screen.getByTitle('Permission to resume task denied');

    expect(resumeIcon).toHaveAttribute('disabled');
    expect(resumeIcon).toHaveAttribute('data-disabled', 'true');
  });

  test('should render in inactive state if task is not stopped', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={task} />);

    const resumeIcon = screen.getByTitle('Task is not stopped');

    expect(resumeIcon).toHaveAttribute('disabled');
    expect(resumeIcon).toHaveAttribute('data-disabled', 'true');
  });

  test('should render in inactive state if wrong command level permissions are given for audit', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({
      _id: 'test-id',
      status: AUDIT_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
      usage_type: 'audit',
    });

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={audit} />);

    const resumeIcon = screen.getByTitle('Permission to resume audit denied');

    expect(resumeIcon).toHaveAttribute('disabled');
    expect(resumeIcon).toHaveAttribute('data-disabled', 'true');
  });

  test('should render in inactive state if task is scheduled', () => {
    const caps = new Capabilities(['everything']);
    const elem = {
      _id: 'test-id',
      status: TASK_STATUS.new,
      schedule: {
        _id: 'schedule1',
      },
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    };
    const task = Task.fromElement(elem);

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={task} />);

    const resumeIcon = screen.getByTitle('Task is scheduled');

    expect(resumeIcon).toHaveAttribute('disabled');
    expect(resumeIcon).toHaveAttribute('data-disabled', 'true');
  });

  test('should render in inactive state if task is a import task', () => {
    const elem = {
      _id: 'test-id',
      status: TASK_STATUS.new,
      permissions: {permission: [{name: 'everything'}]},
    };
    const task = Task.fromElement(elem);

    const {render} = rendererWith({capabilities: true});

    render(<ResumeIcon task={task} />);

    const resumeIcon = screen.getByTitle('Task is for import only');

    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    expect(resumeIcon).toHaveAttribute('disabled');
    expect(resumeIcon).toHaveAttribute('data-disabled', 'true');
  });

  test('should not be rendered if task is queued', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      _id: 'test-id',
      status: TASK_STATUS.queued,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    render(<ResumeIcon task={task} />);

    expect(screen.queryByTestId('resume-icon')).toEqual(null);
  });
});
