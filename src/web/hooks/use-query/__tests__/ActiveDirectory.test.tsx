/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import {useQueryClient} from '@tanstack/react-query';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import CredentialCommand from 'gmp/commands/credential';
import CredentialsCommand from 'gmp/commands/credentials';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useGetActiveDirectoryCredentials,
  activeDirectoryCredentialFilter,
} from 'web/hooks/use-query/active-directory';

const createGmp = (token?: string) => {
  const http = createDirectoryHttp();
  const command = new ActiveDirectoryCommand(http);
  const credentials = new CredentialsCommand(http);
  const credential = new CredentialCommand(http);
  return {
    settings: {reloadInterval: 10},
    session: createSession({token}),
    credentials: {get: testing.fn(credentials.get.bind(credentials))},
    credential: {get: testing.fn(credential.get.bind(credential))},
    activedirectory: {
      getOverview: testing.fn(command.getOverview.bind(command)),
      getChildren: testing.fn(command.getChildren.bind(command)),
      getComputerDetails: testing.fn(command.getComputerDetails.bind(command)),
      resolveSubtree: testing.fn(command.resolveSubtree.bind(command)),
    },
  };
};

describe('Active Directory GMP hooks', () => {
  test('loads sources using the shared collection hook and clears inactive data', async () => {
    const gmp = createGmp('token');
    const {renderHook} = rendererWith({gmp});
    const {result, unmount} = renderHook(() => ({
      query: useGetActiveDirectoryCredentials(
        QueryFilter.fromString('rows=2 first=1 sort=name'),
      ),
      client: useQueryClient(),
    }));
    await waitFor(() =>
      expect(result.current.query.data?.entities).toHaveLength(2),
    );
    expect(result.current.query.data?.entitiesCounts.all).toBe(52);
    expect(gmp.credentials.get).toHaveBeenCalledTimes(1);
    const client = result.current.client;
    expect(client.getQueryCache().getAll()[0].queryKey).toEqual([
      'get_ad_credentials',
      'token',
      'rows=2 first=1 sort=name',
    ]);
    unmount();
    await waitFor(() => expect(client.getQueryCache().getAll()).toEqual([]));
  });

  test('does not fetch connections without a session', () => {
    const gmp = createGmp();
    const {renderHook} = rendererWith({gmp});
    renderHook(() =>
      useGetActiveDirectoryCredentials(QueryFilter.fromString()),
    );
    expect(gmp.credentials.get).not.toHaveBeenCalled();
  });

  test('scopes every OR alternative and materializes saved filters', () => {
    const filter = QueryFilter.fromString('name~Office or not type=ad rows=5');
    expect(activeDirectoryCredentialFilter(filter).toFilterString()).toBe(
      'type=ad and name~Office or type=ad and not type=ad rows=5',
    );
    expect(
      activeDirectoryCredentialFilter(
        new QueryFilter({id: 'saved', terms: filter.getAllTerms().slice()}),
      ).id,
    ).toBeUndefined();
    expect(
      activeDirectoryCredentialFilter(
        QueryFilter.fromString('type=ssh'),
      ).toFilterString(),
    ).toBe('type=ad and type=ssh');
  });
});
