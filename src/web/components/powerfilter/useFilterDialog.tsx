/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import Filter, {FilterSortOrder} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';

export interface FilterDialogState {
  filterName?: string;
  saveNamedFilter?: boolean;
}

/**
 * React hook for handling filter dialog state
 *
 * @param {Filter} initialFilter
 * @returns Object
 */
const useFilterDialog = <TFilterDialogState extends FilterDialogState>(
  initialFilter?: Filter,
) => {
  const [originalFilter] = useState(initialFilter);
  const [filter, setFilter] = useState<Filter>(() =>
    isDefined(initialFilter) ? initialFilter.copy() : new Filter(),
  );
  const [filterDialogState, setFilterDialogState] =
    useState<TFilterDialogState>({} as TFilterDialogState);

  const [filterString, setFilterString] = useState(() =>
    isDefined(initialFilter) ? initialFilter.toFilterCriteriaString() : '',
  );

  const handleFilterChange = useCallback((filter: Filter) => {
    setFilter(filter);
  }, []);

  const handleFilterValueChange = useCallback(
    (value: string, name: string, relation: string = '=') => {
      setFilter(filter => filter.copy().set(name, value, relation));
    },
    [],
  );

  const handleSearchTermChange = useCallback(
    (value: string, name: string, relation: string = '~') => {
      setFilter(filter => filter.copy().set(name, `"${value}"`, relation));
    },
    [],
  );

  const handleFilterStringChange = useCallback((value: string) => {
    setFilterString(value);
  }, []);

  const handleSortByChange = useCallback((value: string) => {
    setFilter(filter => filter.copy().setSortBy(value));
  }, []);

  const handleSortOrderChange = useCallback((value: FilterSortOrder) => {
    setFilter(filter => filter.copy().setSortOrder(value));
  }, []);

  const handleChange = useCallback((value: unknown, name: string) => {
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
