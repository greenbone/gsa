/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {useGetCredentialStores} from 'web/hooks/use-query/credential-stores';

const filter = QueryFilter.fromString('name~credential');

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  credentialstores: {
    get: testing.fn().mockResolvedValue({
      data: [{id: 'credential-1', name: 'Credential 1'}],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
  },
});

describe('useGetCredentialStores', () => {
  test('should fetch credential stores with a filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const {data} = useGetCredentialStores({filter});
      return <div data-testid="credential">{data?.entities[0]?.name}</div>;
    };

    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId('credential')).toHaveTextContent(
        'Credential 1',
      );
    });
    expect(gmp.credentialstores.get).toHaveBeenCalledWith({filter});
  });
});
