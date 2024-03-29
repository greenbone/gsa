/* Copyright (C) 2020-2022 Greenbone AG
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

import Audit, {AUDIT_STATUS} from 'gmp/models/audit';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Event from 'gmp/models/event';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import StartIcon from '../starticon';

describe('Task StartIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Start');
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Permission to start task denied');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if wrong command level permissions for audit are given', () => {
    const caps = new Capabilities(['everything']);
    const audit = Audit.fromElement({
      status: AUDIT_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
      usage_type: 'audit',
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={audit} usageType="audit" />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(audit.userCapabilities.mayOp('start_task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute(
      'title',
      'Permission to start audit denied',
    );
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if task is scheduled with a duration limit', () => {
    const caps = new Capabilities(['everything']);
    const icalendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 8.0.0//EN
BEGIN:VEVENT
UID:c35f82f1-7798-4b84-b2c4-761a33068956
DTSTAMP:20190715T124352Z
DTSTART:20190716T040000
DTEND:20190716T050000
END:VEVENT
END:VCALENDAR
`;

    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
      schedule: {
        _id: 'schedule1',
        event: Event.fromIcal(icalendar, 'UTC'),
      },
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute(
      'title',
      'Task cannot be started manually because the assigned schedule has a duration limit',
    );
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if task is already active', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.requested,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is already active');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if task is queued', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.queued,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is already active');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should not be rendered if task is running', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);
    expect(element).toEqual(null);
  });

  test('should not be rendered if task is a container', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<StartIcon task={task} />);

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);
    expect(element).toEqual(null);
  });
});

// vim: set ts=2 sw=2 tw=80:
