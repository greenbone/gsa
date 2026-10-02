/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type Role from 'gmp/models/role';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetRolesParams {
  enabled?: boolean;
  filter?: FilterType;
}

export const useGetRoles = ({filter, enabled}: UseGetRolesParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Role>({
    gmpMethod: gmp.roles.get.bind(gmp.roles),
    enabled,
    queryId: 'get_roles',
    filter,
    keepPreviousData: true,
  });
};

export const useGetAllRoles = ({filter, enabled}: UseGetRolesParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Role>({
    gmpMethod: gmp.roles.getAll.bind(gmp.roles),
    enabled,
    queryId: 'get_roles',
    filter,
    keepPreviousData: true,
  });
};
