/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Task from 'gmp/models/task';
import ObserverIcon from 'web/entity/icon/ObserverIcon';
import {screen, render} from 'web/testing';

describe('Entity ObserverIcon component tests', () => {
  test('should render if the owner is not the current user', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});
    const {element} = render(<ObserverIcon entity={entity} userName={'bar'} />);
    expect(element).toBeInTheDocument();
  });

  test('should not render if the owner is the current user', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});
    render(<ObserverIcon entity={entity} userName={'foo'} />);
    expect(screen.queryByTestId('observer-icon')).toEqual(null);
  });

  test('should render with default data-testid', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});
    const {element} = render(<ObserverIcon entity={entity} userName={'bar'} />);
    expect(element).toHaveAttribute('data-testid', 'observer-icon');
  });

  test('should render with custom data-testid', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});
    const {element} = render(
      <ObserverIcon
        data-testid="custom-observer-icon"
        entity={entity}
        userName={'bar'}
      />,
    );
    expect(element).toHaveAttribute('data-testid', 'custom-observer-icon');
  });
});
