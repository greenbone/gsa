/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';

import {useLocation} from 'react-router-dom';

import {useSelector, useDispatch} from 'react-redux';

import {ROWS_PER_PAGE_SETTING_ID} from 'gmp/commands/users';

import Filter, {
  DEFAULT_FALLBACK_FILTER,
  DEFAULT_ROWS_PER_PAGE,
} from 'gmp/models/filter';

import {isDefined, hasValue} from 'gmp/utils/identity';

import getPage from 'web/store/pages/selectors';
import {pageFilter as setPageFilter} from 'web/store/pages/actions';
import {loadUserSettingDefault} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

import useGmp from 'web/utils/useGmp';

/**
 * Hook to get the default filter of a page from the store
 *
 * @param {String} pageName
 * @returns Array of the default filter and and error if the filter could not be loaded
 */
const useDefaultFilter = pageName =>
  useSelector(state => {
    const defaultFilterSel = getUserSettingsDefaultFilter(state, pageName);
    return [defaultFilterSel.getFilter(), defaultFilterSel.getError()];
  });

/**
 * Hook to get the filter of a page
 *
 * @param {String} pageName Name of the page
 * @param {Object} options Options object
 * @returns Array of the applied filter and boolean indicating if the filter is still loading
 */
const usePageFilter = (
  pageName,
  {fallbackFilter, locationQueryFilterString} = {},
) => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const location = useLocation();

  // only use location directly if locationQueryFilterString is undefined
  // use null as value for not set at all
  if (!isDefined(locationQueryFilterString)) {
    locationQueryFilterString = location?.query?.filter;
  }

  let returnedFilter;

  const [defaultSettingFilter, defaultSettingsFilterError] =
    useDefaultFilter(pageName);

  useEffect(() => {
    if (
      !isDefined(defaultSettingFilter) &&
      !isDefined(defaultSettingsFilterError)
    ) {
      dispatch(loadUserSettingsDefaultFilter(gmp)(pageName));
    }
  }, [
    defaultSettingFilter,
    defaultSettingsFilterError,
    dispatch,
    gmp,
    pageName,
  ]);

  let [rowsPerPage, rowsPerPageError] = useSelector(state => {
    const userSettingDefaultSel = getUserSettingsDefaults(state);
    return [
      userSettingDefaultSel.getValueByName('rowsperpage'),
      userSettingDefaultSel.getError(),
    ];
  });

  useEffect(() => {
    if (!isDefined(rowsPerPage)) {
      dispatch(loadUserSettingDefault(gmp)(ROWS_PER_PAGE_SETTING_ID));
    }
  }, [returnedFilter, rowsPerPage, gmp, dispatch]);

  const [locationQueryFilter, setLocationQueryFilter] = useState(
    hasValue(locationQueryFilterString)
      ? Filter.fromString(locationQueryFilterString)
      : undefined,
  );

  useEffect(() => {
    if (hasValue(locationQueryFilterString)) {
      dispatch(
        setPageFilter(pageName, Filter.fromString(locationQueryFilterString)),
      );
    }
    setLocationQueryFilter(undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pageFilter = useSelector(state => getPage(state).getFilter(pageName));

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
    returnedFilter = returnedFilter.set('rows', rowsPerPage);
  }

  const finishedLoading =
    isDefined(returnedFilter) &&
    (isDefined(defaultSettingFilter) ||
      isDefined(defaultSettingsFilterError)) &&
    isDefined(rowsPerPage);

  return [returnedFilter, !finishedLoading];
};

export default usePageFilter;
