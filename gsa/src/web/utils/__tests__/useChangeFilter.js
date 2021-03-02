/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

/* eslint-disable react/prop-types */

import React from 'react';

import Filter, {RESET_FILTER} from 'gmp/models/filter';

import {pageFilter} from 'web/store/pages/actions';
import getPage from 'web/store/pages/selectors';

import useChangeFilter from '../useChangeFilter';

import {rendererWith, screen, fireEvent} from '../testing';

const TestComponent = ({filter, newFilter, name}) => {
  const {change, nexPage, reset, remove} = useChangeFilter(name);
  return (
    <div>
      <button data-testid="reset" onClick={reset} />
      <button data-testid="remove" onClick={remove} />
      <button data-testid="next" onClick={nexPage} />
      <button data-testid="change" onClick={() => change(newFilter)} />
    </div>
  );
};

describe('useChangeFilterTests', () => {
  test('should allow to reset the filter', () => {
    const name = 'foo';
    const filter = Filter.fromString('first=10 rows=20 name~foo');

    const {store, render} = rendererWith({store: true, router: true});

    store.dispatch(pageFilter(name, filter));

    render(<TestComponent name={name} />);

    const button = screen.getByTestId('reset');

    fireEvent.click(button);

    const pageSelector = getPage(store.getState());
    const pFilter = pageSelector.getFilter(name);

    expect(pFilter).toBeUndefined();
  });

  test('should allow to remove the filter', () => {
    const name = 'foo';
    const filter = Filter.fromString('first=10 rows=20 name~foo');

    const {store, render} = rendererWith({store: true, router: true});

    store.dispatch(pageFilter(name, filter));

    render(<TestComponent name={name} />);

    const button = screen.getByTestId('remove');

    fireEvent.click(button);

    const pageSelector = getPage(store.getState());
    const pFilter = pageSelector.getFilter(name);

    expect(pFilter).toBeDefined();
    expect(pFilter.toFilterString()).toEqual(RESET_FILTER.toFilterString());
  });

  test('should allow to change the filter', () => {
    const name = 'foo';
    const filter = Filter.fromString('first=10 rows=20 name~foo');
    const newFilter = Filter.fromString('first=20 rows=20');

    const {store, render} = rendererWith({store: true, router: true});

    store.dispatch(pageFilter(name, filter));

    render(<TestComponent name={name} newFilter={newFilter} />);

    const button = screen.getByTestId('change');

    fireEvent.click(button);

    const pageSelector = getPage(store.getState());
    const pFilter = pageSelector.getFilter(name);

    expect(pFilter).toBeDefined();
    expect(pFilter.toFilterString()).toEqual(newFilter.toFilterString());
  });
});
