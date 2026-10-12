/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type PortList from 'gmp/models/port-list';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useGetEntities, {
  type UseGetEntitiesRefetchInterval,
} from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetPortListsParams {
  enabled?: boolean;
  filter?: FilterType;
  staleTime?: number;
  refetchInterval?: UseGetEntitiesRefetchInterval<PortList>;
}

type PortListBulkInput = PortList[] | FilterType;

interface UseModifyPortListParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGetPortLists = ({
  enabled,
  filter,
  staleTime,
  refetchInterval,
}: UseGetPortListsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<PortList>({
    gmpMethod: gmp.portlists.get.bind(gmp.portlists),
    queryId: 'get_port_lists',
    enabled,
    filter,
    refetchInterval,
    staleTime,
  });
};

export const useGetAllPortLists = ({
  enabled,
  filter,
  staleTime,
}: UseGetPortListsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<PortList>({
    gmpMethod: gmp.portlists.getAll.bind(gmp.portlists),
    queryId: 'get_port_lists',
    enabled,
    filter,
    staleTime,
  });
};

export const useBulkDeletePortLists = ({
  onError,
  onSuccess,
}: UseModifyPortListParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<PortListBulkInput, void, Error>({
    gmpMethod: async (input: PortListBulkInput) => {
      isFilterType(input)
        ? await gmp.portlists.deleteByFilter(input)
        : await gmp.portlists.delete(input);
    },
    invalidateQueryIds: ['get_port_lists'],
    successMessage: _('Port Lists successfully deleted'),
    onSuccess,
    onError,
  });
};

export const useBulkExportPortLists = ({
  onError,
  onSuccess,
}: UseModifyPortListParams) => {
  const gmp = useGmp();
  return useGmpMutation<PortListBulkInput, string, Error>({
    gmpMethod: async (input: PortListBulkInput) => {
      const response = isFilterType(input)
        ? await gmp.portlists.exportByFilter(input)
        : await gmp.portlists.export(input);
      return response.data;
    },
    onSuccess,
    onError,
  });
};
