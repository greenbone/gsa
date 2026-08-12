/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, render, screen, waitFor} from 'web/testing';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection';

interface TestProps {
  filter?: FilterType;
  onSelectFilterClick?: () => void;
  showFilterSelection?: boolean;
  value?: string;
}

const filtersFilter = QueryFilter.fromString('type=task');

const filters = [
  {id: 'f-1', name: 'Filter One'},
  {id: 'f-2', name: 'Filter Two'},
];

const createGmp = () => ({
  filters: {
    get: testing.fn().mockResolvedValue({
      data: filters,
      meta: {filter: 'type=task', counts: {}},
    }),
  },
});

const TestComponent = ({
  filter,
  onSelectFilterClick,
  showFilterSelection,
  value,
}: TestProps) => (
  <div>
    <span data-testid="filter">{filter?.name ?? 'none'}</span>
    <span data-testid="show-filter-selection">
      {String(showFilterSelection)}
    </span>
    <span data-testid="value">{value}</span>
    <button data-testid="select-filter" onClick={onSelectFilterClick} />
  </div>
);

const WrappedComponent = withFilterSelection({filtersFilter})(TestComponent);

describe('withFilterSelection tests', () => {
  test('should render the wrapped component without filter selection by default', () => {
    render(<WrappedComponent value="value" />);

    expect(screen.queryByTestId('filter-selection')).not.toBeInTheDocument();
    expect(screen.getByTestId('filter')).toHaveTextContent('none');
    expect(screen.getByTestId('show-filter-selection')).toHaveTextContent(
      'false',
    );
    expect(screen.getByTestId('value')).toHaveTextContent('value');
  });

  test('should render FilterSelection and passes its selected filter', () => {
    const gmp = createGmp();
    const {render: renderWithGmp} = rendererWith({gmp, store: true});

    renderWithGmp(<WrappedComponent showFilterSelection={true} />);

    expect(gmp.filters.get).toHaveBeenCalledWith({filter: filtersFilter});
    expect(screen.getByTestId('filter')).toHaveTextContent('none');
    expect(screen.getByTestId('show-filter-selection')).toHaveTextContent(
      'true',
    );
  });

  test('should pass FilterSelection callback to the wrapped component', () => {
    const receivedCallback = testing.fn();
    const SelectableComponent = ({onSelectFilterClick}: TestProps) => {
      receivedCallback(onSelectFilterClick);
      return null;
    };
    const WrappedSelectable = withFilterSelection({filtersFilter})(
      SelectableComponent,
    );

    const gmp = createGmp();
    const {render: renderWithGmp} = rendererWith({gmp, store: true});

    renderWithGmp(<WrappedSelectable showFilterSelection={true} />);

    expect(receivedCallback).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should open the real filter selection dialog through the injected callback', async () => {
    const gmp = createGmp();
    const {render: renderWithGmp} = rendererWith({gmp, store: true});

    renderWithGmp(<WrappedComponent showFilterSelection={true} />);

    fireEvent.click(screen.getByTestId('select-filter'));

    await waitFor(() => {
      expect(screen.getDialogTitle()).toHaveTextContent('Select Filter');
    });
  });

  test('should set a descriptive display name', () => {
    expect(WrappedComponent.displayName).toBe(
      'withFilterSelection(TestComponent)',
    );
  });
});
