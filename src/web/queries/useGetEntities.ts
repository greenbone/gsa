/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import type CollectionCounts from 'gmp/collection/CollectionCounts';
import {type EntitiesMeta} from 'gmp/commands/entities';
import {type HttpCommandInputParams} from 'gmp/commands/http';
import type Response from 'gmp/http/response';
import type Filter from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import useGmp from 'web/hooks/useGmp';

type GmpMethodParams = HttpCommandInputParams;

export interface UseGetEntitiesReturn<T> {
  entities: T[];
  entitiesCounts: CollectionCounts;
  filter?: Filter;
}

interface UseGetEntitiesParams<
  TModel,
  TInput extends GmpMethodParams = GmpMethodParams,
> {
  gmpMethod: (input: TInput) => Promise<Response<TModel[], EntitiesMeta>>;
  queryId: string;
  filter?: Filter;
  enabled?: boolean;
  refetchInterval?: number;
}

const useGetEntities = <
  TModel extends Model,
  TInput extends GmpMethodParams = GmpMethodParams,
>({
  gmpMethod,
  queryId,
  filter = undefined,
  enabled = true,
  refetchInterval = undefined,
}: UseGetEntitiesParams<TModel, TInput>) => {
  const gmp = useGmp();
  const {token} = gmp.settings;
  return useQuery<UseGetEntitiesReturn<TModel>>({
    enabled: enabled && !!token,
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
    refetchInterval,
  });
};

export default useGetEntities;
