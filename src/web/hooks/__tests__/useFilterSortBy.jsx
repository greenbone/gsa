/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable react/prop-types */

import {describe, test, expect, testing} from '@gsa/testing';

import {fireEvent, render, screen} from 'web/utils/testing';

import Filter from 'gmp/models/filter';

import useFilterSortBy from '../useFilterSortBy';

const TestComponent = ({filter, changeFilter}) => {
  const [sortBy, sortDir, sortChange] = useFilterSortBy(filter, changeFilter);
  return (
    <>
      <span data-testid="sortBy">{sortBy}</span>
      <span data-testid="sortDir">{sortDir}</span>
      <button onClick={() => sortChange('field')} data-testid="sortDirChange" />
      <button
        onClick={() => sortChange('other-field')}
        data-testid="sortFieldChange"
      />
    </>
  );
};

describe('useFilterSortBy', () => {
  test('should return the sort by field and direction', () => {
    const changeFilter = testing.fn();
    const filter = Filter.fromString('sort=field');

    render(<TestComponent filter={filter} changeFilter={changeFilter} />);

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
      <TestComponent filter={currentFilter} changeFilter={changeFilter} />,
    );

    fireEvent.click(screen.getByTestId('sortDirChange'));

    expect(changeFilter).toHaveBeenCalledWith(
      Filter.fromString('first=1 sort-reverse=field'),
    );

    // the filter is not in the state. so a rerender with the new filter is needed
    rerender(
      <TestComponent filter={currentFilter} changeFilter={changeFilter} />,
    );

    expect(screen.getByTestId('sortBy')).toHaveTextContent('field');
    expect(screen.getByTestId('sortDir')).toHaveTextContent('desc');
  });
});
