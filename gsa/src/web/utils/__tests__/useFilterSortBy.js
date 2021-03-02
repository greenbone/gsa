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

import Filter from 'gmp/models/filter';

import useFilterSortBy from '../useFilterSortby';

import {rendererWith, screen, fireEvent} from '../testing';

const TestComponent = ({filter, onFilterChange}) => {
  const [sortBy, sortDir, sortChange] = useFilterSortBy(filter, onFilterChange);
  return (
    <div>
      <div data-testid="sort-dir">{sortDir}</div>
      <div data-testid="sort-by">{sortBy}</div>
      <button
        data-testid="button-sort-by-name"
        onClick={() => sortChange('name')}
      />
      <button
        data-testid="button-sort-by-id"
        onClick={() => sortChange('id')}
      />
    </div>
  );
};
describe('useFilterSortBy tests', () => {
  test('should change sort by', () => {
    let filter = Filter.fromString('sort=name');

    const onFilterChange = jest
      .fn()
      .mockImplementation(newFilter => (filter = newFilter));

    const {render} = rendererWith();

    const {rerender} = render(
      <TestComponent filter={filter} onFilterChange={onFilterChange} />,
    );

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    fireEvent.click(screen.getByTestId('button-sort-by-id'));

    expect(onFilterChange).toHaveBeenCalled();
    expect(filter.toFilterString()).toEqual('sort=id first=1');

    // component hasn't re-rendered with new filter yet
    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    rerender(<TestComponent filter={filter} onFilterChange={onFilterChange} />);

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('id');
  });

  test('should change sort direction', () => {
    let filter = Filter.fromString('sort=name');

    const onFilterChange = jest
      .fn()
      .mockImplementation(newFilter => (filter = newFilter));

    const {render} = rendererWith();

    const {rerender} = render(
      <TestComponent filter={filter} onFilterChange={onFilterChange} />,
    );

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    fireEvent.click(screen.getByTestId('button-sort-by-name'));

    expect(onFilterChange).toHaveBeenCalled();
    expect(filter.toFilterString()).toEqual('first=1 sort-reverse=name');

    // component hasn't re-rendered with new filter yet
    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    rerender(<TestComponent filter={filter} onFilterChange={onFilterChange} />);

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('desc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');
  });

  test('should always use asc sorting if sort by changes', () => {
    let filter = Filter.fromString('sort-reverse=name');

    const onFilterChange = jest
      .fn()
      .mockImplementation(newFilter => (filter = newFilter));

    const {render} = rendererWith();

    const {rerender} = render(
      <TestComponent filter={filter} onFilterChange={onFilterChange} />,
    );

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('desc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    fireEvent.click(screen.getByTestId('button-sort-by-id'));

    expect(onFilterChange).toHaveBeenCalled();
    expect(filter.toFilterString()).toEqual('first=1 sort=id');

    // component hasn't re-rendered with new filter yet
    expect(screen.getByTestId('sort-dir')).toHaveTextContent('desc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    rerender(<TestComponent filter={filter} onFilterChange={onFilterChange} />);

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('id');
  });

  test('should always show first page if sort by changes', () => {
    let filter = Filter.fromString('sort=name first=20');

    const onFilterChange = jest
      .fn()
      .mockImplementation(newFilter => (filter = newFilter));

    const {render} = rendererWith();

    const {rerender} = render(
      <TestComponent filter={filter} onFilterChange={onFilterChange} />,
    );

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    fireEvent.click(screen.getByTestId('button-sort-by-id'));

    expect(onFilterChange).toHaveBeenCalled();
    expect(filter.toFilterString()).toEqual('sort=id first=1');

    // component hasn't re-rendered with new filter yet
    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('name');

    rerender(<TestComponent filter={filter} onFilterChange={onFilterChange} />);

    expect(screen.getByTestId('sort-dir')).toHaveTextContent('asc');
    expect(screen.getByTestId('sort-by')).toHaveTextContent('id');
  });
});
