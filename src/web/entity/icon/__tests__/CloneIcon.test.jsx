/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Task from 'gmp/models/task';
import CloneIcon from 'web/entity/icon/CloneIcon';
import {rendererWith, fireEvent} from 'web/utils/Testing';

describe('Entity CloneIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'get_tasks'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <CloneIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayAccess('task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).not.toHaveAttribute('disabled');
    expect(element).not.toHaveAttribute('data-disabled', 'true');
  });

  test('should deactivate if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'get_tasks'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <CloneIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayAccess('task')).toEqual(true);

    fireEvent.click(element);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  test('should deactivate if wrong resource level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({
      permissions: {permission: [{name: 'get_schedule'}]},
    });
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <CloneIcon entity={entity} onClick={clickHandler} />,
    );

    expect(entity.userCapabilities.mayAccess('task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('disabled');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });
});
