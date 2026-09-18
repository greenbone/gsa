/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Task from 'gmp/models/task';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import EditIcon from 'web/entity/icon/EditIcon';

describe('Entity EditIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'modify_task'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
      gmp: {session: createSession({username: 'admin'})},
    });

    const {element} = render(
      <EditIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayEdit('task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).not.toHaveAttribute('disabled');
    expect(element).not.toHaveAttribute('data-disabled', 'true');
  });

  test('should deactivate if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'modify_task'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
      gmp: {session: createSession({username: 'admin'})},
    });

    const {element} = render(
      <EditIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayEdit('task')).toEqual(true);

    fireEvent.click(element);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  test('should deactivate if wrong resource level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'modify_schedule'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
      gmp: {session: createSession({username: 'admin'})},
    });

    const {element} = render(
      <EditIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayEdit('task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  test('should deactivate if set to disabled', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'modify_schedule'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({
      capabilities: caps,
      gmp: {session: createSession({username: 'admin'})},
    });

    const {element} = render(
      <EditIcon disabled={true} entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayEdit('schedule')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  test('should allow the current user to edit their own account', () => {
    const caps = new Capabilities(['modify_user']);
    const entity = User.fromElement({
      _id: 'user-id',
      name: 'admin-2',
    });
    const clickHandler = testing.fn();
    const gmp = {session: createSession({username: 'admin-2'})};

    const {render} = rendererWith({capabilities: caps, gmp});

    const {element} = render(
      <EditIcon entity={entity} name="user" onClick={clickHandler} />,
    );

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).not.toHaveAttribute('disabled');
  });
});
