/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {useCallback} from 'react';

import {isDefined} from 'gmp/utils/identity';

import SortBy from 'web/components/sortby/sortby';

const useFilterSortBy = (filter, changeFilter) => {
  const reverseField = isDefined(filter)
    ? filter.get('sort-reverse')
    : undefined;
  const reverse = isDefined(reverseField);
  const sortBy =
    reverse || !isDefined(filter) ? reverseField : filter.get('sort');
  const sortDir = reverse ? SortBy.DESC : SortBy.ASC;

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
