/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import Task, {TASK_STATUS} from 'gmp/models/task';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import ResumeIcon from '../resumeicon';

describe('Task ResumeIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} onClick={clickHandler} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Resume');
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.stopped,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });
    const clickHandler = jest.fn();

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
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if task is not stopped', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is not stopped');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
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
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is scheduled');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if task is a container', () => {
    const caps = new Capabilities(['everything']);
    const elem = {
      status: TASK_STATUS.new,
      permissions: {permission: [{name: 'everything'}]},
    };
    const task = Task.fromElement(elem);
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(<ResumeIcon task={task} />);

    expect(caps.mayOp('resume_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('resume_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is a container');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });
});
