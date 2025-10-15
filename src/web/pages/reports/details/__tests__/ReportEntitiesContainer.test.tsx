/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, type Mock} from '@gsa/testing';
import {render, screen, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import ReportEntitiesContainer, {
  type ReportEntitiesContainerRenderProps,
} from 'web/pages/reports/details/ReportEntitiesContainer';
import {makeCompareString} from 'web/utils/Sort';
import SortDirection from 'web/utils/SortDirection';

const getRenderProps = (
  mockChildren: Mock,
  call: number = 1,
): ReportEntitiesContainerRenderProps => {
  return mockChildren.mock.calls[
    call - 1
  ][0] as ReportEntitiesContainerRenderProps;
};

describe('ReportEntitiesContainer tests', () => {
  test('should render loading indicator if entities are not defined', () => {
    render(
      <ReportEntitiesContainer sortField="name" sortReverse={false}>
        {() => <div>Mock Children</div>}
      </ReportEntitiesContainer>,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render children with correct props', () => {
    const mockChildren = testing.fn(() => <div>Mock Children</div>);
    const result1 = new Result({id: '1', name: 'foo'});
    const result2 = new Result({id: '2', name: 'bar'});
    const results = [result1, result2];
    const sortByName = makeCompareString((entity: Result) => entity.name);
    const sortFunctions = {
      name: sortByName,
    };
    const counts = new CollectionCounts({rows: 10, filtered: 20});
    const expectedCounts = new CollectionCounts({
      rows: 10,
      filtered: 20,
      first: 1,
      length: 2,
    });
    render(
      <ReportEntitiesContainer
        counts={counts}
        entities={results}
        sortField="name"
        sortFunctions={sortFunctions}
        sortReverse={false}
      >
        {mockChildren}
      </ReportEntitiesContainer>,
    );

    expect(mockChildren).toHaveBeenCalledWith({
      entities: [result2, result1], // Sorted by name
      entitiesCounts: expectedCounts,
      sortBy: 'name',
      sortDir: SortDirection.ASC,
      onFirstClick: expect.any(Function),
      onLastClick: expect.any(Function),
      onNextClick: expect.any(Function),
      onPreviousClick: expect.any(Function),
    });
  });

  test('should handle pagination correctly', async () => {
    const mockChildren = testing.fn(() => <div>Mock Children</div>);
    const mockEntities = Array.from(
      {length: 20}, // Create 20 mock Result entities
      (_, i) => new Result({id: String(i + 1)}),
    );
    const mockCounts = new CollectionCounts({rows: 5, filtered: 20});

    render(
      <ReportEntitiesContainer
        counts={mockCounts}
        entities={mockEntities}
        sortField="id"
        sortReverse={false}
      >
        {mockChildren}
      </ReportEntitiesContainer>,
    );

    const {onNextClick, onPreviousClick, onFirstClick, onLastClick} =
      getRenderProps(mockChildren);
    let {entitiesCounts} = getRenderProps(mockChildren);
    expect(mockChildren).toHaveBeenCalledTimes(1);
    expect(entitiesCounts).toEqual(
      new CollectionCounts({
        first: 1,
        filtered: 20,
        length: 5,
        rows: 5,
      }),
    );

    // Simulate clicking next page
    onNextClick();
    await wait();
    expect(mockChildren).toHaveBeenCalledTimes(2);
    entitiesCounts = getRenderProps(mockChildren, 2).entitiesCounts;
    expect(entitiesCounts).toEqual(
      new CollectionCounts({
        first: 6,
        filtered: 20,
        length: 5,
        rows: 5,
      }),
    );

    // Simulate clicking previous page
    onPreviousClick();
    await wait();
    expect(mockChildren).toHaveBeenCalledTimes(3);
    entitiesCounts = getRenderProps(mockChildren, 3).entitiesCounts;
    expect(entitiesCounts).toEqual(
      new CollectionCounts({
        first: 1,
        filtered: 20,
        length: 5,
        rows: 5,
      }),
    );

    // Simulate clicking last page
    onLastClick();
    await wait();
    expect(mockChildren).toHaveBeenCalledTimes(4);
    entitiesCounts = getRenderProps(mockChildren, 4).entitiesCounts;
    expect(entitiesCounts).toEqual(
      new CollectionCounts({
        first: 16,
        filtered: 20,
        length: 5,
        rows: 5,
      }),
    );

    // Simulate clicking first page
    onFirstClick();
    await wait();
    expect(mockChildren).toHaveBeenCalledTimes(5);
    entitiesCounts = getRenderProps(mockChildren, 5).entitiesCounts;
    expect(entitiesCounts).toEqual(
      new CollectionCounts({
        first: 1,
        filtered: 20,
        length: 5,
        rows: 5,
      }),
    );
  });

  test('should use rows from filter', () => {
    const mockChildren = testing.fn(() => <div>Mock Children</div>);
    const result1 = new Result({id: '1', name: 'foo'});
    const result2 = new Result({id: '2', name: 'bar'});
    const results = [result1, result2];
    const counts = new CollectionCounts({rows: 10, filtered: 20});
    const filter = Filter.fromString('rows=5');
    const expectedCounts = new CollectionCounts({
      rows: 5,
      filtered: 20,
      first: 1,
      length: 2,
    });
    render(
      <ReportEntitiesContainer
        counts={counts}
        entities={results}
        filter={filter}
        sortField="name"
        sortReverse={false}
      >
        {mockChildren}
      </ReportEntitiesContainer>,
    );

    expect(mockChildren).toHaveBeenCalledWith(
      expect.objectContaining({
        entities: results,
        entitiesCounts: expectedCounts,
      }),
    );
  });
});
