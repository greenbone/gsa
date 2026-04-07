/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {useGetPolicy, useGetPolicies} from 'web/hooks/use-query/policies';

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

const SinglePolicyComponent = ({id}: {id: string}) => {
  const {data, isLoading, isError} = useGetPolicy({id});

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
    <div data-testid="policy">
      <span data-testid="policy-name">{data.name}</span>
      <span data-testid="policy-id">{data.id}</span>
    </div>
  );
};

const PolicyListComponent = ({filter}: {filter?: Filter}) => {
  const {data, isLoading, isError} = useGetPolicies({filter});

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

describe('useGetPolicy', () => {
  test('should fetch a single policy', async () => {
    const mockGet = testing.fn().mockResolvedValue({data: policy});

    const gmp = {
      policy: {
        get: mockGet,
      },
      settings: {token: 'test-token'},
    };

    const {render} = rendererWith({gmp, router: true});
    render(<SinglePolicyComponent id="policy-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-name')).toHaveTextContent(
        'Test Policy',
      );
    });

    expect(mockGet).toHaveBeenCalledWith({id: 'policy-1'});
    expect(screen.getByTestId('policy-id')).toHaveTextContent('policy-1');
  });

  test('should show loading state initially', () => {
    const mockGet = testing.fn().mockReturnValue(new Promise(() => {}));

    const gmp = {
      policy: {
        get: mockGet,
      },
      settings: {token: 'test-token'},
    };

    const {render} = rendererWith({gmp, router: true});
    render(<SinglePolicyComponent id="policy-1" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

describe('useGetPolicies', () => {
  test('should fetch a list of policies', async () => {
    const filter = Filter.fromString('name~test');
    const mockGet = testing.fn().mockResolvedValue({
      data: [policy, policy2],
      meta: {
        filter: Filter.fromString('name~test'),
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    });

    const gmp = {
      policies: {
        get: mockGet,
      },
      settings: {token: 'test-token'},
    };

    const {render} = rendererWith({gmp, router: true});
    render(<PolicyListComponent filter={filter} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('policy-item')).toHaveLength(2);
    });

    expect(mockGet).toHaveBeenCalled();
    expect(screen.getByText('Test Policy')).toBeInTheDocument();
    expect(screen.getByText('Test Policy 2')).toBeInTheDocument();
  });
});
