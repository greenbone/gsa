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

import Task from 'gmp/models/task';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import TrashIcon from '../trashicon';

describe('Entity TrashIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'delete_task'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <TrashIcon entity={entity} onClick={clickHandler} />,
    );

    expect(caps.mayDelete('task')).toEqual(true);
    expect(entity.userCapabilities.mayDelete('task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should deactivate if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'delete_task'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <TrashIcon entity={entity} onClick={clickHandler} />,
    );

    expect(caps.mayDelete('task')).toEqual(false);
    expect(entity.userCapabilities.mayDelete('task')).toEqual(true);

    fireEvent.click(element);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should deactivate if wrong resource level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'delete_schedule'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <TrashIcon entity={entity} onClick={clickHandler} />,
    );

    expect(caps.mayDelete('task')).toEqual(true);
    expect(entity.userCapabilities.mayDelete('task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
