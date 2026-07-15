/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type EntitiesMeta} from 'gmp/commands/entities';
import {type HttpCommandInputParams} from 'gmp/commands/http';
import type Response from 'gmp/http/response';
import {type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import {
  resolveRefetchInterval,
  transformRefetchIntervalFn,
  type RefetchIntervalFn,
} from 'web/queries/helpers';

type GmpMethodParams = HttpCommandInputParams;

export interface UseGetEntitiesReturn<T> {
  entities: T[];
  entitiesCounts: CollectionCounts;
  filterType?: FilterType;
}

interface UseGetEntitiesParams<
  TModel,
  TInput extends GmpMethodParams = GmpMethodParams,
> {
  gmpMethod: (input: TInput) => Promise<Response<TModel[], EntitiesMeta>>;
  queryId: string;
  filter?: FilterType;
  enabled?: boolean;
  refetchInterval?:
    | number
    | false
    | RefetchIntervalFn<UseGetEntitiesReturn<TModel>>;
  keepPreviousData?: boolean;
}

const useGetEntities = <
  TModel,
  TInput extends GmpMethodParams = GmpMethodParams,
>({
  gmpMethod,
  queryId,
  filter = undefined,
  enabled = true,
  refetchInterval = undefined,
  keepPreviousData = false,
}: UseGetEntitiesParams<TModel, TInput>) => {
  const gmp = useGmp();
  const token = useSessionToken();

  const settings = gmp.settings;
  const resolvedRefetchInterval =
    typeof refetchInterval === 'function'
      ? transformRefetchIntervalFn(refetchInterval, settings)
      : resolveRefetchInterval(refetchInterval, settings);

  return useQuery<UseGetEntitiesReturn<TModel>>({
    enabled: enabled && Boolean(token),
    queryKey: [queryId, token, filter?.toFilterString()],
    queryFn: async () => {
      const response = await gmpMethod({filter} as TInput);
      const entities = response.data;
      const entitiesCounts = response.meta.counts;
      const responseFilter = response.meta.filter;
      return {
        entities,
        entitiesCounts,
        filter: responseFilter,
      };
    },
    refetchInterval: resolvedRefetchInterval,
    placeholderData: keepPreviousData
      ? previousData => previousData
      : undefined,
  });
};

export default useGetEntities;
