/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {type Store} from 'redux';
import QueryFilter from 'gmp/models/filter/query-filter';
import FilterSelection from 'web/components/dashboard/display/FilterSelection';
import {types} from 'web/store/entities/utils/actions';
import {UNSET_VALUE} from 'web/utils/Render';

const filters = [
  {id: 'f-1', name: 'Filter One'},
  {id: 'f-2', name: 'Filter Two'},
];

const filtersFilter = QueryFilter.fromString('type=task');

const createGmp = ({
  getFilters = testing.fn().mockResolvedValue({
    data: filters,
    meta: {
      filter: 'type=task',
      counts: {},
    },
  }),
} = {}) => ({
  filters: {
    get: getFilters,
  },
});

const renderFilterSelection = (props = {}) => {
  const gmp = createGmp();
  const onFilterIdChanged = testing.fn();

  const {render, store} = rendererWith({gmp, store: true});

  const renderResult = render(
    <FilterSelection
      filtersFilter={filtersFilter}
      onFilterIdChanged={onFilterIdChanged}
      {...props}
    >
      {({filter, selectFilter}) => (
        <div>
          <span data-testid="selected-filter">{filter?.name ?? 'none'}</span>
          <button data-testid="open-filter-dialog" onClick={selectFilter}>
            Select Filter
          </button>
        </div>
      )}
    </FilterSelection>,
  );

  return {
    ...renderResult,
    gmp,
    store,
    onFilterIdChanged,
  };
};

const seedFiltersInStore = (store: Store) => {
  store.dispatch({
    type: types.ENTITIES_LOADING_SUCCESS,
    entityType: 'filter',
    filter: filtersFilter,
    data: filters,
    loadedFilter: filtersFilter,
    counts: {},
  });
};

describe('FilterSelection', () => {
  test('should load filters on mount', () => {
    const {gmp} = renderFilterSelection();

    expect(gmp.filters.get).toHaveBeenCalledWith({
      filter: filtersFilter,
    });
  });

  test('should pass matching filter to render function', async () => {
    const {store} = renderFilterSelection({filterId: 'f-2'});
    seedFiltersInStore(store);

    await waitFor(() => {
      expect(screen.getByTestId('selected-filter')).toHaveTextContent(
        'Filter Two',
      );
    });
  });

  test('should open select dialog from render function callback', () => {
    renderFilterSelection();

    fireEvent.click(screen.getByTestId('open-filter-dialog'));

    expect(screen.getDialogTitle()).toHaveTextContent('Select Filter');
  });

  test('should map unset value to undefined on save', () => {
    const {onFilterIdChanged} = renderFilterSelection();

    fireEvent.click(screen.getByTestId('open-filter-dialog'));
    fireEvent.click(screen.getDialogSaveButton());

    expect(onFilterIdChanged).toHaveBeenCalledWith(undefined);
    expect(onFilterIdChanged).not.toHaveBeenCalledWith(UNSET_VALUE);
  });

  test('should pass selected filter id on save', () => {
    const {onFilterIdChanged} = renderFilterSelection({filterId: 'f-1'});

    fireEvent.click(screen.getByTestId('open-filter-dialog'));
    fireEvent.click(screen.getDialogSaveButton());

    expect(onFilterIdChanged).toHaveBeenCalledWith('f-1');
  });
});
