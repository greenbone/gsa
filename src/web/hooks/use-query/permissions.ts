/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type Permission from 'gmp/models/permission';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetPermissionsParams {
  filter?: FilterType;
  enabled?: boolean;
}

export const useGetPermissions = ({
  filter,
  enabled = true,
}: UseGetPermissionsParams) => {
  const gmp = useGmp();
  return useGetEntities<Permission>({
    gmpMethod: gmp.permissions.get.bind(gmp.permissions),
    queryId: 'get_permissions',
    filter,
    enabled,
  });
};
