/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import {pluralizeType} from 'gmp/utils/entitytype';
import useGmp from 'web/hooks/useGmp';

interface UseGetQueryParams<T> {
  cmd: string;
  filter?: Filter;
  name: string;
  parseEntity: (el: unknown) => T;
  select?: (data: unknown) => unknown;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useGetQuery<T = unknown>({
  cmd,
  filter = undefined,
  name,
  parseEntity,
  select,
  enabled = true,
  refetchInterval = undefined,
}: UseGetQueryParams<T>) {
  const gmp = useGmp();
  const {token} = gmp.settings;

  return useQuery({
    enabled: enabled && !!token,
    queryKey: [cmd, token, filter],
    queryFn: async () => {
      const entityKey = pluralizeType(name.replace(/^get_/, '')).replace(
        /_/g,
        '',
      );

      const gmpCommand = gmp[entityKey]?.get;

      if (!gmpCommand) {
        throw new Error(
          `GMP command for ${cmd} (entityKey: ${entityKey}) not found`,
        );
      }

      const responseData = await gmp[entityKey].get({filter});
      if (!responseData) {
        throw new Error(`No data returned for ${name}`);
      }
      const entities = responseData?._data ?? [];
      const entitiesCounts = new CollectionCounts(
        responseData?._meta?.counts ?? {},
      );
      const responseFilter = filter || responseData?._meta?.filter;
      return {
        entities,
        entitiesCounts,
        filter: responseFilter,
      };
    },
    select:
      select ??
      (data => ({
        entities: data.entities.map(parseEntity),
        entitiesCounts: data.entitiesCounts,
        filter: data.filter,
      })),
    refetchInterval,
  });
}
