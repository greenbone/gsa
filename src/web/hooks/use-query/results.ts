/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type Result from 'gmp/models/result';
import useGmp from 'web/hooks/useGmp';
import type {RefetchIntervalFn} from 'web/queries/helpers';
import useGetEntities, {
  type UseGetEntitiesReturn,
} from 'web/queries/useGetEntities';

interface UseGetResultsParams {
  filter?: Filter;
  refetchInterval?:
    | number
    | false
    | RefetchIntervalFn<UseGetEntitiesReturn<Result>>;
}

/**
 * Hook to fetch results using TanStack Query
 *
 * @param filter The filter to apply to the results query
 * @param refetchInterval Override the refetch interval (supports NO_RELOAD, USE_DEFAULT_RELOAD_INTERVAL_ACTIVE, etc.)
 * @returns Query result with entities, entitiesCounts, and filter
 */
export const useGetResults = ({
  filter = undefined,
  refetchInterval = undefined,
}: UseGetResultsParams = {}) => {
  const gmp = useGmp();

  return useGetEntities<Result>({
    gmpMethod: gmp.results.get.bind(gmp.results),
    queryId: 'get_results',
    filter,
    keepPreviousData: true,
    refetchInterval,
  });
};

export default useGetResults;
