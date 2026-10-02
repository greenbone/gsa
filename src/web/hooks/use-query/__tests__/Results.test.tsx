/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import useGetResults from 'web/hooks/use-query/results';

const filter = QueryFilter.fromString('severity>5');

describe('useGetResults', () => {
  test('should fetch results with a filter', async () => {
    const get = testing.fn().mockResolvedValue({
      data: [{id: 'result-1', name: 'Result 1'}],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    });
    const gmp = {
      session: createSession({token: 'test-token'}),
      settings: {},
      results: {get},
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetResults({filter});
      return <div data-testid="result">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Result 1');
    });

    expect(get).toHaveBeenCalledWith({filter});
  });

  test('should not fetch results without a session token', () => {
    const get = testing.fn();
    const gmp = {
      session: createSession(),
      settings: {},
      results: {get},
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetResults();
      return <div />;
    };

    render(<TestComponent />);

    expect(get).not.toHaveBeenCalled();
  });
});
