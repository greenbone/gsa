/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Filter, type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetFiltersParams {
  enabled?: boolean;
  filter?: FilterType;
}

export const useGetFilters = ({enabled, filter}: UseGetFiltersParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Filter>({
    gmpMethod: data => gmp.filters.get(data),
    queryId: 'get_filters',
    enabled,
    filter,
  });
};
