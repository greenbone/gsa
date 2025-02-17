/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Task from 'gmp/models/task';
import {render} from 'web/utils/testing';

import ObserverIcon from '../observericon';

describe('Entity ObserverIcon component tests', () => {
  test('should render if the owner is not the current user', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});

    const {element} = render(<ObserverIcon entity={entity} userName={'bar'} />);

    expect(element).toBeInTheDocument();
  });

  test('should not render if the owner is the current user', () => {
    const entity = Task.fromElement({owner: {name: 'foo'}});

    const {queryByTestId} = render(
      <ObserverIcon entity={entity} userName={'foo'} />,
    );

    expect(queryByTestId('observer-icon')).toEqual(null);
  });
});
