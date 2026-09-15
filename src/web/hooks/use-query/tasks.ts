/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type FilterType} from 'gmp/models/filter';
import {type default as Task} from 'gmp/models/task';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetTasksParams {
  enabled?: boolean;
  filter?: FilterType;
  staleTime?: number;
}

export const useGetTasks = ({
  enabled,
  filter,
  staleTime,
}: UseGetTasksParams = {}) => {
  const gmp = useGmp();

  return useGetEntities<Task>({
    gmpMethod: gmp.tasks.get.bind(gmp.tasks),
    queryId: 'get_tasks',
    enabled,
    filter,
    staleTime,
  });
};
