/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';

/**
 * Hook to to get the filter for the next, previous, last and first page for a
 * list of entities
 *
 * @example
 *
 * const gmp = useGmp();
 * const [filter, setFilter] = useState(new Filter());
 * const [entities, setEntities] = useState([]);
 * const [counts, setCounts] = useState({});
 * const updateFilter = useCallback(filter => {
 *   setFilter(filter);
 *   gmp.tasks.get(filter).then(response => {setEntities(response.data);setCounts(response.meta.counts)});
 * }, [gmp.tasks]);
 * const [first, last, next, previous] = usePagination(filter, counts, updateFilter)
 *
 * @param {Filter} filter Current applied filter
 * @param {Object} counts Current entities counts. Required for calculating the
 *   last page.
 * @param {Function} changeFilter Function to call when the new filter is applied
 * @returns {Array} Tuple of functions to update the filter for the first, last,
 *   next and previous page.
 */
const usePagination = (filter, counts, changeFilter) => {
  const getNext = useCallback(() => {
    changeFilter(filter.next());
  }, [filter, changeFilter]);

  const getPrevious = useCallback(() => {
    changeFilter(filter.previous());
  }, [filter, changeFilter]);

  const getFirst = useCallback(() => {
    changeFilter(filter.first());
  }, [filter, changeFilter]);

  const getLast = useCallback(() => {
    const last =
      Math.floor((counts.filtered - 1) / counts.rows) * counts.rows + 1;
    const newFilter = filter.first(last);
    changeFilter(newFilter);
  }, [filter, counts, changeFilter]);

  return [getFirst, getLast, getNext, getPrevious];
};

export default usePagination;
