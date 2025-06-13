/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import Filter from 'gmp/models/filter';
import useFilterSortBy from 'web/hooks/useFilterSortBy';

const TestComponent = ({filter: initialFilter, changeFilter}) => {
  const [filter, setFilter] = useState(initialFilter);
  const handleChangeFilter = (newFilter: Filter) => {
    setFilter(newFilter);
    changeFilter(newFilter);
  };
  const [sortBy, sortDir, sortChange] = useFilterSortBy(
    filter,
    handleChangeFilter,
  );
  return (
    <>
      <span data-testid="sortBy">{sortBy}</span>
      <span data-testid="sortDir">{sortDir}</span>
      <button data-testid="sortDirChange" onClick={() => sortChange('field')} />
      <button
        data-testid="sortFieldChange"
        onClick={() => sortChange('other-field')}
      />
    </>
  );
};

describe('useFilterSortBy', () => {
  test('should return the sort by field and direction', () => {
    const changeFilter = testing.fn();
    const filter = Filter.fromString('sort=field');

    render(<TestComponent changeFilter={changeFilter} filter={filter} />);

    expect(screen.getByTestId('sortBy')).toHaveTextContent('field');
    expect(screen.getByTestId('sortDir')).toHaveTextContent('asc');
  });

  test('should change the sort direction', () => {
    const filter = Filter.fromString('sort=field');
    let currentFilter = filter;
    const changeFilter = testing.fn().mockImplementation(filter => {
      currentFilter = filter;
    });

    const {rerender} = render(
      <TestComponent changeFilter={changeFilter} filter={currentFilter} />,
    );

    fireEvent.click(screen.getByTestId('sortDirChange'));

    expect(changeFilter).toHaveBeenCalledWith(
      Filter.fromString('first=1 sort-reverse=field'),
    );

    // the filter is not in the state. so a rerender with the new filter is needed
    rerender(
      <TestComponent changeFilter={changeFilter} filter={currentFilter} />,
    );

    expect(screen.getByTestId('sortBy')).toHaveTextContent('field');
    expect(screen.getByTestId('sortDir')).toHaveTextContent('desc');
  });

  test('should handle undefined sort field', async () => {
    const changeFilter = testing.fn();
    const filter = Filter.fromString();

    render(<TestComponent changeFilter={changeFilter} filter={filter} />);

    expect(screen.getByTestId('sortBy')).toHaveTextContent('');
    expect(screen.getByTestId('sortDir')).toHaveTextContent('asc');

    fireEvent.click(screen.getByTestId('sortFieldChange'));

    expect(changeFilter).toHaveBeenCalledWith(
      Filter.fromString('first=1 sort=other-field'),
    );
    expect(screen.getByTestId('sortBy')).toHaveTextContent('other-field');
  });
});
