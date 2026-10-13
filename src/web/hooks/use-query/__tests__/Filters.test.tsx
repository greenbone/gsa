/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {useGetFilters} from 'web/hooks/use-query/filters';

const filter = QueryFilter.fromString('name~filter');
const filters = [new Filter({id: 'filter-1', name: 'Filter 1'})];
const response = new Response(filters, {
  filter,
  counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
});

const createGmp = ({
  get = testing.fn().mockResolvedValue(response),
  getAll = testing.fn().mockResolvedValue(response),
} = {}) => {
  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    filters: {
      get,
      getAll,
    },
  };
};

describe('useGetFilters', () => {
  test('should fetch filters with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetFilters({filter});
      return <div data-testid="filter">{data?.entities.at(0)?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('filter')).toHaveTextContent('Filter 1');
    });

    expect(gmp.filters.get).toHaveBeenCalledWith({filter});
    expect(gmp.filters.getAll).not.toHaveBeenCalled();
  });

  test('should expose an error when fetching filters fails', async () => {
    const error = new Error('Failed to fetch filters');
    const gmp = createGmp({get: testing.fn().mockRejectedValue(error)});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {error: queryError} = useGetFilters({filter});
      return <div data-testid="error">{queryError?.message}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Failed to fetch filters',
      );
    });
  });
});
