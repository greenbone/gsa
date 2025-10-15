/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import type Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import SortDirection, {type SortDirectionType} from 'web/utils/SortDirection';

type ChangeFilterFunc = (filter: Filter) => void;
type SortChangeFunc = (field: string) => void;

/**
 * Hook to get the sort by field and direction from a filter
 *
 * @param filter The current filter
 * @param changeFilter Function to call when the filter changes
 * @returns Array of the sort by field, sort direction and a function to change the sort by field
 */
const useFilterSortBy = (
  filter: Filter,
  changeFilter: ChangeFilterFunc,
): [string | undefined, SortDirectionType, SortChangeFunc] => {
  const reverseField = isDefined(filter)
    ? (filter.get('sort-reverse') as string)
    : undefined;
  const reverse = isDefined(reverseField);
  const sortBy =
    reverse || !isDefined(filter)
      ? reverseField
      : (filter.get('sort') as string);
  const sortDir = reverse ? SortDirection.DESC : SortDirection.ASC;

  const sortChange = useCallback(
    (field: string) => {
      let sort = 'sort';
      const newFilter = filter.copy().first();
      const sortField = filter.getSortBy();

      if (sortField && sortField === field) {
        sort = filter.getSortOrder() === 'sort' ? 'sort-reverse' : 'sort';
      }

      newFilter.set(sort, field);

      changeFilter(newFilter);
    },
    [changeFilter, filter],
  );

  return [sortBy, sortDir, sortChange];
};

export default useFilterSortBy;
