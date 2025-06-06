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
 * @param {String} pageName
 * @returns Array of the default filter and and error if the filter could not be loaded
 */
const useDefaultFilter = pageName =>
  useShallowEqualSelector(state => {
    const defaultFilterSel = getUserSettingsDefaultFilter(state, pageName);
    return [defaultFilterSel.getFilter(), defaultFilterSel.getError()];
  });

/**
 * Hook to get and update the filter of a page
 *
 * @param {String} pageName Name of the page
 * @param {Object} options Options object
 * @param {String} gmpName GMP name for filtering
 * @returns Array of the applied filter, boolean indicating if the filter is
 *          still loading, function to change the filter, function to remove the
 *          filter and function to reset the filter
 */

const usePageFilter = (pageName, gmpName, {fallbackFilter} = {}) => {
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

  // use null as value for not set at all
  let returnedFilter;
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
      dispatch(loadUserSettingsDefaultFilter(gmp)(gmpName));
    }
  }, [
    defaultSettingFilter,
    defaultSettingsFilterError,
    dispatch,
    gmp,
    gmpName,
  ]);

  useEffect(() => {
    if (!isDefined(rowsPerPage)) {
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

  if (!returnedFilter.has('rows') && isDefined(rowsPerPage)) {
    returnedFilter = returnedFilter.copy().set('rows', rowsPerPage);
  }

  const finishedLoading =
    isDefined(returnedFilter) &&
    (isDefined(defaultSettingFilter) ||
      isDefined(defaultSettingsFilterError)) &&
    isDefined(rowsPerPage);

  const changeFilter = useCallback(
    filter => {
      dispatch(setPageFilter(pageName, filter));
    },
    [dispatch, pageName],
  );

  const removeFilter = useCallback(() => {
    // remove filter from store by setting it to the default filter with first=1 only
    changeFilter(RESET_FILTER);
  }, [changeFilter]);

  const resetFilter = useCallback(() => {
    const query = new URLSearchParams(searchParams);
    query.delete('filter');

    setSearchParams(query);

    changeFilter();
  }, [changeFilter, setSearchParams, searchParams]);

  return [
    returnedFilter,
    !finishedLoading,
    changeFilter,
    removeFilter,
    resetFilter,
  ];
};

export default usePageFilter;
