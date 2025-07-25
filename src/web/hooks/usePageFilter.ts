/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useSearchParams} from 'react-router';
import {ROWS_PER_PAGE_SETTING_ID} from 'gmp/commands/users';
import Filter, {
  DEFAULT_FALLBACK_FILTER,
  DEFAULT_ROWS_PER_PAGE,
  RESET_FILTER,
} from 'gmp/models/filter';
import {isDefined, hasValue} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import {pageFilter as setPageFilter} from 'web/store/pages/actions';
import getPage from 'web/store/pages/selectors';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';
import {loadUserSettingDefault} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

/**
 * Hook to get the default filter of a page from the store
 *
 * @param pageName  Name of the page
 * @returns Array of the default filter and and error if the filter could not be loaded
 */
const useDefaultFilter = (pageName: string) =>
  useShallowEqualSelector(state => {
    const defaultFilterSel = getUserSettingsDefaultFilter(state, pageName);
    return [defaultFilterSel.getFilter(), defaultFilterSel.getError()];
  });

interface UsePageFilterOptions {
  fallbackFilter?: Filter;
}

interface UsePageFilterHandlers {
  changeFilter: (filter?: Filter) => void;
  removeFilter: () => void;
  resetFilter: () => void;
}

type UsePageFilterReturn = [Filter, boolean, UsePageFilterHandlers];

/**
 * Custom hook to manage and retrieve filters for a specific page in the application.
 * It integrates with global state, user settings, and URL query parameters to determine
 * the appropriate filter to use for the page.
 *
 * @param pageName - The name of the page for which the filter is being managed.
 * @param gmpName - The name of the GMP entity associated with the default filter.
 * @param options - Configuration options for the hook.
 * @param options.fallbackFilter - A fallback filter to use if no other filters are defined.
 *
 * @returns A tuple containing:
 * - `Filter`: The resolved filter for the page.
 * - `boolean`: A loading state indicating whether the filter is fully resolved.
 * - An object with utility functions:
 *   - `changeFilter(filter?: Filter): void` - Updates the filter for the page.
 *   - `removeFilter(): void` - Removes the current filter and applies only first=1.
 *   - `resetFilter(): void` - Resets the filter to the default settings filter and clears the filter query parameter from the URL.
 */
const usePageFilter = (
  pageName: string,
  gmpName: string,
  {fallbackFilter}: UsePageFilterOptions = {},
): UsePageFilterReturn => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [defaultSettingFilter, defaultSettingsFilterError] =
    useDefaultFilter(gmpName);

  let [rowsPerPage, rowsPerPageError] = useShallowEqualSelector(state => {
    const userSettingDefaultSel = getUserSettingsDefaults(state);
    return [
      userSettingDefaultSel.getValueByName('rowsperpage'),
      userSettingDefaultSel.getError(),
    ];
  });
  const pageFilter = useShallowEqualSelector(state =>
    getPage(state).getFilter(pageName),
  );

  const locationQueryFilterString = searchParams.get('filter');

  const [locationQueryFilter, setLocationQueryFilter] = useState(
    hasValue(locationQueryFilterString)
      ? Filter.fromString(locationQueryFilterString)
      : undefined,
  );

  useEffect(() => {
    if (
      !isDefined(defaultSettingFilter) &&
      !isDefined(defaultSettingsFilterError)
    ) {
      // @ts-expect-error
      dispatch(loadUserSettingsDefaultFilter(gmp)(gmpName));
    }
  }, [
    defaultSettingFilter,
    defaultSettingsFilterError,
    dispatch,
    gmp,
    gmpName,
  ]);

  let returnedFilter: Filter | undefined;

  useEffect(() => {
    if (!isDefined(rowsPerPage)) {
      // @ts-expect-error
      dispatch(loadUserSettingDefault(gmp)(ROWS_PER_PAGE_SETTING_ID));
    }
  }, [returnedFilter, rowsPerPage, gmp, dispatch]);

  useEffect(() => {
    if (hasValue(locationQueryFilterString)) {
      dispatch(
        setPageFilter(pageName, Filter.fromString(locationQueryFilterString)),
      );
    }
    setLocationQueryFilter(undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (hasValue(locationQueryFilter)) {
    returnedFilter = locationQueryFilter;
  } else if (isDefined(pageFilter)) {
    returnedFilter = pageFilter;
  } else if (
    isDefined(defaultSettingFilter) &&
    !isDefined(defaultSettingsFilterError) &&
    defaultSettingFilter !== null
  ) {
    returnedFilter = defaultSettingFilter;
  } else if (isDefined(fallbackFilter)) {
    returnedFilter = fallbackFilter;
  } else {
    returnedFilter = DEFAULT_FALLBACK_FILTER;
  }

  if (!isDefined(rowsPerPage) && isDefined(rowsPerPageError)) {
    rowsPerPage = DEFAULT_ROWS_PER_PAGE;
  }

  if (
    isDefined(returnedFilter) &&
    !returnedFilter.has('rows') &&
    isDefined(rowsPerPage)
  ) {
    returnedFilter = returnedFilter.copy().set('rows', rowsPerPage);
  }

  const finishedLoading =
    isDefined(returnedFilter) &&
    (isDefined(defaultSettingFilter) ||
      isDefined(defaultSettingsFilterError)) &&
    isDefined(rowsPerPage);

  const changeFilter = useCallback(
    (filter?: Filter) => {
      dispatch(setPageFilter(pageName, filter));
    },
    [dispatch, pageName],
  );

  const removeFilter = useCallback(() => {
    // remove all filter terms and just set first to 1
    changeFilter(RESET_FILTER);
  }, [changeFilter]);

  const resetFilter = useCallback(() => {
    const query = new URLSearchParams(searchParams);
    query.delete('filter');
    setSearchParams(query);

    // reset to default settings filter
    changeFilter();
  }, [changeFilter, setSearchParams, searchParams]);

  return [
    returnedFilter as Filter,
    !finishedLoading,
    {
      changeFilter,
      removeFilter,
      resetFilter,
    },
  ];
};

export default usePageFilter;
