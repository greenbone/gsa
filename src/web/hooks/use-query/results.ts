/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type Result from 'gmp/models/result';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetResultsParams {
  filter?: Filter;
}

/**
 * Hook to fetch results using TanStack Query
 *
 * @param filter The filter to apply to the results query
 * @returns Query result with entities, entitiesCounts, and filter
 */
export const useGetResults = ({
  filter = undefined,
}: UseGetResultsParams = {}) => {
  const gmp = useGmp();

  return useGetEntities<Result>({
    // @ts-expect-error results command is dynamically added via getCommands()
    gmpMethod: gmp.results.get.bind(gmp.results),
    queryId: 'get_results',
    filter,
    keepPreviousData: true,
  });
};

export default useGetResults;
