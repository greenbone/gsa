/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import EntitiesCommand from 'gmp/commands/entities';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';
import {EntityType, pluralizeType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';

export interface UseGetEntitiesReturn<T> {
  entities: T[];
  entitiesCounts: CollectionCounts;
  filter?: Filter;
}

interface UseGetEntitiesParams {
  queryId: string;
  filter?: Filter;
  entityType: EntityType;
  enabled?: boolean;
  refetchInterval?: number;
}

const useGetEntities = <
  TModel extends Model,
  TEntityCommand extends EntitiesCommand<TModel> = EntitiesCommand<TModel>,
>({
  queryId,
  filter = undefined,
  entityType,
  enabled = true,
  refetchInterval = undefined,
}: UseGetEntitiesParams) => {
  const gmp = useGmp();
  const {token} = gmp.settings;
  return useQuery<UseGetEntitiesReturn<TModel>>({
    enabled: enabled && !!token,
    queryKey: [queryId, token, filter?.toFilterString()],
    queryFn: async () => {
      const entityKey = pluralizeType(entityType);
      const gmpCommand = gmp[entityKey] as TEntityCommand | undefined;

      if (!isDefined(gmpCommand)) {
        throw new Error(`GMP command ${entityKey} not found`);
      }
      const response = await gmpCommand.get({filter});
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
