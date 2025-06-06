/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';

/**
 * React hook for handling filter dialog state
 *
 * @param {Filter} initialFilter
 * @returns Object
 */
const useFilterDialog = initialFilter => {
  const [originalFilter] = useState(initialFilter);
  const [filter, setFilter] = useState(() =>
    isDefined(initialFilter) ? initialFilter.copy() : new Filter(),
  );
  const [filterDialogState, setFilterDialogState] = useState({});

  const [filterString, setFilterString] = useState(() =>
    isDefined(initialFilter) ? initialFilter.toFilterCriteriaString() : '',
  );

  const handleFilterChange = useCallback(filter => {
    setFilter(filter);
  }, []);

  const handleFilterValueChange = useCallback((value, name, relation = '=') => {
    setFilter(filter => filter.copy().set(name, value, relation));
  }, []);

  const handleSearchTermChange = useCallback((value, name, relation = '~') => {
    setFilter(filter => filter.copy().set(name, `"${value}"`, relation));
  }, []);

  const handleFilterStringChange = useCallback(value => {
    setFilterString(value);
  }, []);

  const handleSortByChange = useCallback(value => {
    setFilter(filter => filter.copy().setSortBy(value));
  }, []);

  const handleSortOrderChange = useCallback(value => {
    setFilter(filter => filter.copy().setSortOrder(value));
  }, []);

  const handleChange = useCallback((value, name) => {
    setFilterDialogState(state => ({...state, [name]: value}));
  }, []);

  const {filterName, saveNamedFilter, ...other} = filterDialogState;

  return {
    ...other,
    filter,
    filterString,
    filterName,
    originalFilter,
    saveNamedFilter,
    handleFilterChange,
    handleFilterValueChange,
    handleSearchTermChange,
    handleFilterStringChange,
    handleSortByChange,
    handleSortOrderChange,
    handleChange,
    // provide old names
    filterstring: filterString,
    onFilterChange: handleFilterChange,
    onFilterValueChange: handleFilterValueChange,
    onSearchTermChange: handleSearchTermChange,
    onFilterStringChange: handleFilterStringChange,
    onSortOrderChange: handleSortOrderChange,
    onSortByChange: handleSortByChange,
    onValueChange: handleChange,
  };
};

export default useFilterDialog;
