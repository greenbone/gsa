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

/**
 * Hook to to fetch the next, previous, last and first page for a list of
 * entities gathered from a GraphQL query.
 *
 * @param {Filter} filter Current applied filter
 * @param {Object} pageInfo Current information about the page with cursors (keyword relay)
 * @param {Function} refetch Function to refetch the current data. Will be
 *                           called with to fetch next, previous, last or first page.
 * @param {Filter} simpleFilter Simplified filter without rows and first (Optional)
 *
 * @returns {Array} Tuple of functions to query data for the first, last, next
 *                  and page.
 */
const usePagination = ({filter, pageInfo, refetch, simpleFilter}) => {
  if (!isDefined(simpleFilter)) {
    simpleFilter = filter.withoutView();
  }

  const getNext = useCallback(() => {
    refetch({
      filterString: simpleFilter.toFilterString(),
      after: pageInfo.endCursor,
      before: undefined,
      first: filter.get('rows'),
      last: undefined,
    });
  }, [filter, simpleFilter, pageInfo, refetch]);

  const getPrevious = useCallback(() => {
    refetch({
      filterString: simpleFilter.toFilterString(),
      after: undefined,
      before: pageInfo.startCursor,
      first: undefined,
      last: filter.get('rows'),
    });
  }, [filter, simpleFilter, pageInfo, refetch]);

  const getFirst = useCallback(() => {
    refetch({
      filterString: simpleFilter.toFilterString(),
      after: undefined,
      before: undefined,
      first: filter.get('rows'),
      last: undefined,
    });
  }, [filter, simpleFilter, refetch]);

  const getLast = useCallback(() => {
    refetch({
      filterString: simpleFilter.toFilterString(),
      after: pageInfo.lastPageCursor,
      before: undefined,
      first: filter.get('rows'),
      last: undefined,
    });
  }, [filter, simpleFilter, pageInfo, refetch]);

  return [getFirst, getLast, getNext, getPrevious];
};

export default usePagination;
