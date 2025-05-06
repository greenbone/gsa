/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import usePagination from 'web/hooks/usePagination';
import {fireEvent, render, screen} from 'web/utils/Testing';

const TestComponent = ({filter, counts, changeFilter}) => {
  const [first, last, next, previous] = usePagination(
    filter,
    counts,
    changeFilter,
  );
  return (
    <>
      <button data-testid="first" onClick={first} />
      <button data-testid="last" onClick={last} />
      <button data-testid="next" onClick={next} />
      <button data-testid="previous" onClick={previous} />
    </>
  );
};

describe('usePageFilter', () => {
  test('should change the filter for the first page', () => {
    const filter = Filter.fromString('first=10');
    const counts = {filtered: 100, rows: 10};
    const changeFilter = testing.fn();

    render(
      <TestComponent
        changeFilter={changeFilter}
        counts={counts}
        filter={filter}
      />,
    );

    fireEvent.click(screen.getByTestId('first'));

    expect(changeFilter).toHaveBeenCalledWith(Filter.fromString('first=1'));
  });

  test('should change the filter for the last page', () => {
    const filter = Filter.fromString('first=10');
    const counts = {filtered: 100, rows: 10};
    const changeFilter = testing.fn();

    render(
      <TestComponent
        changeFilter={changeFilter}
        counts={counts}
        filter={filter}
      />,
    );

    fireEvent.click(screen.getByTestId('last'));

    expect(changeFilter).toHaveBeenCalledWith(Filter.fromString('first=91'));
  });

  test('should change the filter for the next page', () => {
    const filter = Filter.fromString('first=10');
    const counts = {filtered: 100, rows: 10};
    const changeFilter = testing.fn();

    render(
      <TestComponent
        changeFilter={changeFilter}
        counts={counts}
        filter={filter}
      />,
    );

    fireEvent.click(screen.getByTestId('next'));

    expect(changeFilter).toHaveBeenCalledWith(
      Filter.fromString('first=20 rows=10'),
    );
  });

  test('should change the filter for the previous page', () => {
    const filter = Filter.fromString('first=10');
    const counts = {filtered: 100, rows: 10};
    const changeFilter = testing.fn();

    render(
      <TestComponent
        changeFilter={changeFilter}
        counts={counts}
        filter={filter}
      />,
    );

    fireEvent.click(screen.getByTestId('previous'));

    expect(changeFilter).toHaveBeenCalledWith(
      Filter.fromString('first=1 rows=10'),
    );
  });
});
