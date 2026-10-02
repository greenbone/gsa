/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useEditCredentialStore,
  useGetCredentialStores,
  useVerifyCredentialStore,
} from 'web/hooks/use-query/credential-store';

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
  credentialstore: {
    edit: testing.fn().mockResolvedValue({data: {id: 'credential-1'}}),
    verify: testing.fn().mockResolvedValue({data: {id: 'credential-1'}}),
  },
});

describe('credential store query hooks', () => {
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

  test.each([
    [
      'edit',
      useEditCredentialStore,
      'edit',
      {id: 'credential-1', active: true},
    ],
    ['verify', useVerifyCredentialStore, 'verify', {id: 'credential-1'}],
  ])(
    'should %s a credential store',
    async (_name, useMutation, method, input) => {
      const gmp = createGmp();
      const {render} = rendererWith({gmp, router: true});

      const TestComponent = () => {
        const mutation = useMutation({});
        return <button onClick={() => mutation.mutate(input)}>Run</button>;
      };

      render(<TestComponent />);
      fireEvent.click(screen.getByRole('button', {name: 'Run'}));

      await waitFor(() => {
        expect(gmp.credentialstore[method].mock.calls[0][0]).toEqual(input);
      });
    },
  );
});
