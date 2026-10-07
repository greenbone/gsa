/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import Policy from 'gmp/models/policy';
import {createSession} from 'gmp/testing';
import {useGetPolicies} from 'web/hooks/use-query/policies';

const policy = Policy.fromElement({
  _id: 'policy-1',
  name: 'Test Policy',
  comment: 'A test policy',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  permissions: {permission: [{name: 'everything'}]},
});

const policy2 = Policy.fromElement({
  _id: 'policy-2',
  name: 'Test Policy 2',
  comment: 'Another test policy',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  permissions: {permission: [{name: 'everything'}]},
});

const filter = QueryFilter.fromString('name~test');

const PolicyListComponent = ({filter}: {filter?: FilterType}) => {
  const {data, isLoading, isError} = useGetPolicies(
    filter ? {filter} : undefined,
  );

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="policies">
      {data.entities.map(p => (
        <div key={p.id} data-testid="policy-item">
          {p.name}
        </div>
      ))}
    </div>
  );
};

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
  policies: {
    get: testing.fn().mockResolvedValue({
      data: [policy, policy2],
      meta: {
        filter,
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    }),
  },
});

describe('useGetPolicies', () => {
  test('should fetch a list of policies', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<PolicyListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('policy-item')).toHaveLength(2);
    });

    expect(gmp.policies.get).toHaveBeenCalledWith({filter});
    expect(screen.getByText('Test Policy')).toBeInTheDocument();
    expect(screen.getByText('Test Policy 2')).toBeInTheDocument();
  });

  test('should fetch policies without a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<PolicyListComponent />);

    await waitFor(() => {
      expect(screen.getAllByTestId('policy-item')).toHaveLength(2);
    });

    expect(gmp.policies.get).toHaveBeenCalledWith({filter: undefined});
  });

  test('should not fetch policies without a session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    render(<PolicyListComponent filter={filter} />);

    expect(gmp.policies.get).not.toHaveBeenCalled();
  });

  test('should show an error when fetching policies fails', async () => {
    const gmp = createGmp();
    gmp.policies.get.mockRejectedValue(new Error('Request failed'));
    const {render} = rendererWith({gmp, router: true});

    render(<PolicyListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});
