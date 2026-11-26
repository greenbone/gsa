/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useId} from 'react';
import {type DirectoryBranchParams} from 'gmp/commands/active-directory';
import {type DirectoryOverview} from 'gmp/models/active-directory';
import {
  type default as Credential,
  ACTIVE_DIRECTORY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGetEntity from 'web/queries/useGetEntity';

const freshQueryOptions = {
  staleTime: 0,
  gcTime: 0,
  refetchInterval: false,
  keepPreviousData: false,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/** Scope each OR alternative so a user/saved filter cannot escape AD. */
export const activeDirectoryCredentialFilter = (
  filter: FilterType,
): QueryFilter => {
  const alternatives: string[][] = [[]];
  for (const term of QueryFilter.fromString(
    filter.toFilterCriteriaString(),
  ).getAllTerms()) {
    if (term.toString().toLowerCase() === 'or') alternatives.push([]);
    else alternatives[alternatives.length - 1].push(term.toString());
  }
  const criteria = alternatives
    .map(terms => `type=ad${terms.length ? ` and ${terms.join(' ')}` : ''}`)
    .join(' or ');
  // Materialize saved filters as terms; sending filter_id would bypass scope.
  return QueryFilter.fromString(`${criteria} ${filter.toFilterExtraString()}`);
};

export const useGetActiveDirectoryCredentials = (filter: FilterType) => {
  const gmp = useGmp();
  return useGetEntities<Credential>({
    ...freshQueryOptions,
    filter,
    queryId: 'get_ad_credentials',
    gmpMethod: () =>
      gmp.credentials.get({filter: activeDirectoryCredentialFilter(filter)}),
  });
};

export const useGetActiveDirectoryCredential = (id?: string) => {
  const gmp = useGmp();
  const opening = useId();
  return useGetEntity<Credential>({
    ...freshQueryOptions,
    id,
    queryId: 'get_ad_credential',
    queryKeyParts: [opening],
    gmpMethod: async ({id}) => {
      const response = await gmp.credential.get({id});
      if (
        response.data.id !== id ||
        response.data.credentialType !== ACTIVE_DIRECTORY_CREDENTIAL_TYPE
      ) {
        throw new Error('Active Directory credential is unavailable.');
      }
      return response;
    },
  });
};

export const useGetActiveDirectoryOverview = (
  sourceId: string,
  showContainers = false,
  listingVersion = 0,
) => {
  const gmp = useGmp();
  const scope = useId();
  return useGetEntity<DirectoryOverview>({
    ...freshQueryOptions,
    queryId: 'get_active_directory_overview',
    id: sourceId,
    queryKeyParts: [scope, listingVersion],
    gmpMethod: ({id}) =>
      gmp.activedirectory.getOverview({
        sourceId: id,
        ...(showContainers ? {showContainers} : {}),
      }),
  });
};

export const useGetActiveDirectoryChildren = ({
  sourceId,
  branchId,
  kind,
  showContainers,
}: DirectoryBranchParams) => {
  const gmp = useGmp();
  // Each opening gets a new key, including when a previous request has not
  // settled yet. Reopening cannot attach to that old in-flight request.
  const opening = useId();
  return useGetEntity<DirectoryOverview>({
    ...freshQueryOptions,
    queryId: 'get_active_directory_children',
    id: sourceId,
    queryKeyParts: [branchId, kind, opening],
    gmpMethod: ({id}) =>
      gmp.activedirectory.getChildren({
        sourceId: id,
        branchId,
        kind,
        ...(showContainers ? {showContainers} : {}),
      }),
  });
};
