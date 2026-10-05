/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import type Target from 'gmp/models/target';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetTasksParams {
  enabled?: boolean;
  filter?: FilterType;
  staleTime?: number;
}

export const useGetTargets = ({
  enabled,
  filter,
  staleTime,
}: UseGetTasksParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Target>({
    gmpMethod: gmp.targets.get.bind(gmp.targets),
    queryId: 'get_targets',
    enabled,
    filter,
    staleTime,
  });
};

export const useGetAllTargets = ({
  enabled,
  filter,
  staleTime,
}: UseGetTasksParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Target>({
    gmpMethod: gmp.targets.getAll.bind(gmp.targets),
    queryId: 'get_targets',
    enabled,
    filter,
    staleTime,
  });
};
