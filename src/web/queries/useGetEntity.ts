/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import type Response from 'gmp/http/response';
import type {XmlMeta} from 'gmp/http/transform/fast-xml';
import type Model from 'gmp/models/model';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import {
  resolveRefetchInterval,
  transformRefetchIntervalFn,
  type RefetchIntervalFn,
} from 'web/queries/helpers';

interface UseGetEntityParams<TModel extends Model> {
  gmpMethod: (params: {id: string}) => Promise<Response<TModel, XmlMeta>>;
  queryId: string;
  id: string;
  queryKeyParts?: unknown[];
  refetchInterval?: number | false | RefetchIntervalFn<TModel>;
}

const useGetEntity = <TModel extends Model>({
  gmpMethod,
  queryId,
  id,
  queryKeyParts,
  refetchInterval,
}: UseGetEntityParams<TModel>) => {
  const gmp = useGmp();
  const token = useSessionToken();

  const settings = gmp.settings;
  const resolvedRefetchInterval =
    typeof refetchInterval === 'function'
      ? transformRefetchIntervalFn(refetchInterval, settings)
      : resolveRefetchInterval(refetchInterval, settings);

  return useQuery<TModel>({
    enabled: Boolean(token) && Boolean(id),
    queryKey: [queryId, token, id, ...(queryKeyParts ?? [])],
    queryFn: async () => {
      const response = await gmpMethod({id});
      return response.data;
    },
    refetchInterval: resolvedRefetchInterval,
  });
};

export default useGetEntity;
