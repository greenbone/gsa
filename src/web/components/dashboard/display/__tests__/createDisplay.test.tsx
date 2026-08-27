/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  waitFor,
} from 'web/testing';
import Filter from 'gmp/models/filter';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {types} from 'web/store/entities/utils/actions';

interface TestDisplayProps {
  children?: (props: Record<string, unknown>) => React.ReactNode;
  data?: string;
  filter?: FilterType;
  filterTerm?: string;
  isLoading?: boolean;
  onSelectFilterClick?: () => void;
  showFilterSelection?: boolean;
  showToggleLegend?: boolean;
}

interface TestLoaderProps {
  children?: (props: {data: string; isLoading: boolean}) => React.ReactNode;
  filter?: FilterType;
}

const filtersFilter = QueryFilter.fromString('type=task');

const filters = [
  new Filter({id: 'f-1', name: 'Filter One'}),
  new Filter({id: 'f-2', name: 'Filter Two'}),
];

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: filters,
      meta: {filter: 'type=task', counts: {}},
    }),
  },
});

const TestLoader = ({children, filter}: TestLoaderProps) => (
  <>
    <span data-testid="loader-filter">{filter?.name ?? 'none'}</span>
    {children?.({data: 'test data', isLoading: false})}
  </>
);

const TestDisplay = ({
  children,
  data,
  filter,
  filterTerm,
  isLoading,
  onSelectFilterClick,
  showFilterSelection,
  showToggleLegend,
}: TestDisplayProps) => (
  <div>
    <span data-testid="data">{data}</span>
    <span data-testid="filter">{filter?.name ?? 'none'}</span>
    <span data-testid="filter-term">{filterTerm}</span>
    <span data-testid="is-loading">{String(isLoading)}</span>
    <span data-testid="show-filter-selection">
      {String(showFilterSelection)}
    </span>
    <span data-testid="show-toggle-legend">{String(showToggleLegend)}</span>
    <button data-testid="select-filter" onClick={onSelectFilterClick} />
    {children?.({})}
  </div>
);

const Display = createDisplay({
  displayComponent: TestDisplay,
  displayId: 'test-display',
  displayName: 'TestDisplay',
  filterTerm: 'severity',
  filtersFilter,
  loaderComponent: TestLoader,
  showToggleLegend: false,
} as Parameters<typeof createDisplay>[0]);

describe('createDisplay tests', () => {
  test('should render the display and configured props', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(<Display />);

    expect(screen.getByTestId('filter')).toHaveTextContent('none');
    expect(screen.getByTestId('filter-term')).toHaveTextContent('severity');
    expect(screen.getByTestId('show-filter-selection')).toHaveTextContent(
      'false',
    );
    expect(screen.getByTestId('show-toggle-legend')).toHaveTextContent('false');
    expect(Display.displayId).toBe('test-display');
    expect(Display.displayName).toBe('TestDisplay');
  });

  test('should use the provided filter when filter selection is disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});
    const fallbackFilter = new Filter({id: 'fallback', name: 'Fallback'});

    render(<Display filter={fallbackFilter} />);

    expect(screen.getByTestId('filter')).toHaveTextContent('Fallback');
    expect(screen.getByTestId('loader-filter')).toHaveTextContent('Fallback');
  });

  test('should pass loader props to the display', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(<Display />);

    expect(screen.getByTestId('data')).toHaveTextContent('test data');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  test('should open filter selection through the display callback', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(<Display showFilterSelection />);

    fireEvent.click(screen.getByTestId('select-filter'));

    await waitFor(() => {
      expect(screen.getDialogTitle()).toHaveTextContent('Select Filter');
    });
  });

  test('should call onFilterIdChanged after saving filter selection', async () => {
    const gmp = createGmp();
    const onFilterIdChanged = testing.fn();
    const {render, store} = rendererWith({gmp, store: true});

    render(
      <Display
        showFilterSelection
        filterId="f-2"
        onFilterIdChanged={onFilterIdChanged}
      />,
    );

    store.dispatch({
      type: types.ENTITIES_LOADING_SUCCESS,
      entityType: 'filter',
      filter: filtersFilter,
      data: filters,
      loadedFilter: filtersFilter,
      counts: {},
    });

    fireEvent.click(screen.getByTestId('select-filter'));
    const items = await getSelectItemElementsForSelect(
      screen.getSelectElement(),
    );
    fireEvent.click(items[1]);
    fireEvent.click(screen.getDialogSaveButton());

    expect(onFilterIdChanged).toHaveBeenCalledWith('f-1');
    expect(screen.queryDialog()).not.toBeInTheDocument();
  });

  test('should not render filter selection when disabled', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, store: true});

    render(<Display />);

    expect(screen.queryDialog()).not.toBeInTheDocument();
  });

  test('should prefer the filter from filter selection', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({gmp, store: true});
    const fallbackFilter = new Filter({id: 'fallback', name: 'Fallback'});

    render(
      <Display showFilterSelection filter={fallbackFilter} filterId="f-2" />,
    );

    store.dispatch({
      type: types.ENTITIES_LOADING_SUCCESS,
      entityType: 'filter',
      filter: filtersFilter,
      data: filters,
      loadedFilter: filtersFilter,
      counts: {},
    });

    await waitFor(() => {
      expect(screen.getByTestId('filter')).toHaveTextContent('Filter Two');
      expect(screen.getByTestId('loader-filter')).toHaveTextContent(
        'Filter Two',
      );
    });
  });
});
