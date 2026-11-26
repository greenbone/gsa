/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Credential} from 'gmp/models/credential';
import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

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
