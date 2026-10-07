/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import Policy from 'gmp/models/policy';
import {createSession} from 'gmp/testing';
import {useGetPolicy} from 'web/hooks/use-query/policy';

const policy = Policy.fromElement({
  _id: 'policy-1',
  name: 'Test Policy',
  comment: 'A test policy',
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

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
  policy: {
    get: testing.fn().mockResolvedValue({data: policy}),
  },
});

describe('useGetPolicy', () => {
  test('should fetch a single policy', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SinglePolicyComponent id="policy-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('policy-name')).toHaveTextContent(
        'Test Policy',
      );
    });

    expect(gmp.policy.get).toHaveBeenCalledWith({id: 'policy-1'});
    expect(screen.getByTestId('policy-id')).toHaveTextContent('policy-1');
  });

  test('should show loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    render(<SinglePolicyComponent id="policy-1" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should not fetch a policy when the ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<SinglePolicyComponent id="" />);

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(gmp.policy.get).not.toHaveBeenCalled();
  });

  test('should not fetch a policy without a session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    render(<SinglePolicyComponent id="policy-1" />);

    expect(gmp.policy.get).not.toHaveBeenCalled();
  });

  test('should show an error when fetching a policy fails', async () => {
    const gmp = createGmp();
    gmp.policy.get.mockRejectedValue(new Error('Request failed'));
    const {render} = rendererWith({gmp, router: true});

    render(<SinglePolicyComponent id="policy-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});
