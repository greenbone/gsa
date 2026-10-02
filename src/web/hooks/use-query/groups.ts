/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type Group from 'gmp/models/group';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetGroupsParams {
  enabled?: boolean;
  filter?: FilterType;
}

export const useGetGroups = ({filter, enabled}: UseGetGroupsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Group>({
    gmpMethod: gmp.groups.get.bind(gmp.groups),
    enabled,
    queryId: 'get_groups',
    filter,
    keepPreviousData: true,
  });
};

export const useGetAllGroups = ({filter, enabled}: UseGetGroupsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Group>({
    gmpMethod: gmp.groups.getAll.bind(gmp.groups),
    enabled,
    queryId: 'get_groups',
    filter,
    keepPreviousData: true,
  });
};
