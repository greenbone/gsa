/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useCallback} from 'react';

const ASC = 'asc';
const DESC = 'desc';

/**
 * Hook to get the sort by field and direction from a filter
 *
 * @param {Filter} filter The current filter
 * @param {Function} changeFilter Function to call when the filter changes
 * @returns Array of the sort by field, sort direction and a function to change the sort by field
 */
const useFilterSortBy = (filter, changeFilter) => {
  const reverseField = isDefined(filter)
    ? filter.get('sort-reverse')
    : undefined;
  const reverse = isDefined(reverseField);
  const sortBy =
    reverse || !isDefined(filter) ? reverseField : filter.get('sort');
  const sortDir = reverse ? DESC : ASC;

  const sortChange = useCallback(
    field => {
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
