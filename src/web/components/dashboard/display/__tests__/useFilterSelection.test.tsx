/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  act,
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  waitFor,
} from 'web/testing';
import {type Store} from 'redux';
import Filter from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import useFilterSelection, {
  type UseFilterSelectionProps,
} from 'web/components/dashboard/display/useFilterSelection';
import {types} from 'web/store/entities/utils/actions';

const filters = [
  new Filter({id: 'f-1', name: 'Filter One'}),
  new Filter({id: 'f-2', name: 'Filter Two'}),
];

const filtersFilter = QueryFilter.fromString('type=task');

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: filters,
      meta: {filter: 'type=task', counts: {}},
    }),
  },
});

const seedFilters = (store: Store) => {
  store.dispatch({
    type: types.ENTITIES_LOADING_SUCCESS,
    entityType: 'filter',
    filter: filtersFilter,
    data: filters,
    loadedFilter: filtersFilter,
    counts: {},
  });
};

const TestComponent = ({
  filterId,
  onFilterIdChanged,
}: Pick<UseFilterSelectionProps, 'filterId' | 'onFilterIdChanged'>) => {
  const {filter, selectFilter, filterSelectionDialog} = useFilterSelection({
    filterId,
    filtersFilter,
    onFilterIdChanged,
  });

  return (
    <>
      <span data-testid="selected-filter">{filter?.name ?? 'none'}</span>
      <button data-testid="open-dialog" onClick={selectFilter} />
      {filterSelectionDialog}
    </>
  );
};

describe('useFilterSelection tests', () => {
  test('should load filters and returns the selected filter', async () => {
    const gmp = createGmp();
    const {renderHook, store} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useFilterSelection({filterId: 'f-2', filtersFilter}),
    );

    expect(gmp.filters.get).toHaveBeenCalledWith({filter: filtersFilter});

    act(() => {
      seedFilters(store);
    });

    await waitFor(() => {
      expect(result.current.filter?.name).toBe('Filter Two');
    });
  });

  test('should open the filter selection dialog', () => {
    const gmp = createGmp();
    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() => useFilterSelection({filtersFilter}));

    expect(result.current.filterSelectionDialog).toBeNull();

    act(() => {
      result.current.selectFilter();
    });

    expect(result.current.filterSelectionDialog).not.toBeNull();
  });

  test('should call onFilterIdChanged and close after saving a filter', async () => {
    const gmp = createGmp();
    const onFilterIdChanged = testing.fn();
    const {render, store} = rendererWith({gmp, store: true});

    render(
      <TestComponent filterId="f-2" onFilterIdChanged={onFilterIdChanged} />,
    );

    seedFilters(store);
    fireEvent.click(screen.getByTestId('open-dialog'));

    const items = await getSelectItemElementsForSelect(
      screen.getSelectElement(),
    );
    fireEvent.click(items[1]);
    fireEvent.click(screen.getByTestId('dialog-save-button'));

    expect(onFilterIdChanged).toHaveBeenCalledWith('f-1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should return undefined if filter is not set', async () => {
    const gmp = createGmp();
    const onFilterIdChanged = testing.fn();
    const {render} = rendererWith({gmp, store: true});

    render(<TestComponent onFilterIdChanged={onFilterIdChanged} />);
    fireEvent.click(screen.getByTestId('open-dialog'));

    fireEvent.click(screen.getByTestId('dialog-save-button'));

    expect(onFilterIdChanged).toHaveBeenCalledWith(undefined);
  });
});
