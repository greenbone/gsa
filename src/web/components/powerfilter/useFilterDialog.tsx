/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import {
  type default as FilterType,
  type FilterSortOrder,
} from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';

export interface FilterDialogState {
  filterName?: string;
  saveNamedFilter?: boolean;
}

/**
 * React hook for handling filter dialog state
 *
 * @param initialFilter Optional initial filter to be used in the dialog
 * @returns Object
 */
const useFilterDialog = <TFilterDialogState extends FilterDialogState>(
  initialFilter?: FilterType,
  initialFilterString?: string,
) => {
  const [originalFilter] = useState(initialFilter);
  const [filter, setFilter] = useState<FilterType>(() =>
    isDefined(initialFilter) ? initialFilter : new QueryFilter(),
  );
  const [filterDialogState, setFilterDialogState] =
    useState<TFilterDialogState>({} as TFilterDialogState);

  const [filterString, setFilterString] = useState(() => {
    if (isDefined(initialFilterString)) {
      return initialFilterString;
    }
    return isDefined(initialFilter)
      ? initialFilter.toFilterCriteriaString()
      : '';
  });

  const handleFilterChange = useCallback((filter: FilterType) => {
    setFilter(filter);
  }, []);

  const handleFilterValueChange = useCallback(
    (value: string | number, name: string, relation: string = '=') => {
      setFilter(filter => filter.set(name, value, relation));
    },
    [],
  );

  const handleSearchTermChange = useCallback(
    (value: string, name: string, relation: string = '~') => {
      setFilter(filter => filter.set(name, `"${value}"`, relation));
    },
    [],
  );

  const handleFilterStringChange = useCallback((value: string) => {
    setFilterString(value);
  }, []);

  const handleSortByChange = useCallback((value: string) => {
    setFilter(filter => filter.setSortBy(value));
  }, []);

  const handleSortOrderChange = useCallback((value: FilterSortOrder) => {
    setFilter(filter => filter.setSortOrder(value));
  }, []);

  const handleChange = useCallback(
    (value: TFilterDialogState[keyof TFilterDialogState], name: string) => {
      setFilterDialogState(state => ({...state, [name]: value}));
    },
    [],
  );

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
    // provide handlers for DefaultFilterDialog
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
