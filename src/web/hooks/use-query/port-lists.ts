/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type PortList from 'gmp/models/port-list';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetPortListsParams {
  enabled?: boolean;
  filter?: FilterType;
  staleTime?: number;
}

export const useGetPortLists = ({
  enabled,
  filter,
  staleTime,
}: UseGetPortListsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<PortList>({
    gmpMethod: gmp.portlists.get.bind(gmp.portlists),
    queryId: 'get_port_lists',
    enabled,
    filter,
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
