/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useEffect, useState} from 'react';

import {useSelector, useDispatch, shallowEqual} from 'react-redux';

import {ROWS_PER_PAGE_SETTING_ID} from 'gmp/commands/users';

import Filter, {
  DEFAULT_FALLBACK_FILTER,
  DEFAULT_ROWS_PER_PAGE,
} from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import Loading from 'web/components/loading/loading';

import getPage from 'web/store/pages/selectors';
import {pageFilter as setPageFilter} from 'web/store/pages/actions';
import {loadUserSettingDefault} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';

const FilterProvider = ({
  children,
  fallbackFilter,
  gmpname,
  pageName = gmpname,
  locationQuery = {},
}) => {
  const gmp = useGmp();
  const dispatch = useDispatch();

  let returnedFilter;

  const defaultSettingFilter = useSelector(state => {
    const defaultFilterSel = getUserSettingsDefaultFilter(state, gmpname);
    return defaultFilterSel.getFilter();
  });

  const defaultSettingsFilterError = useSelector(state => {
    const defaultFilterSel = getUserSettingsDefaultFilter(state, gmpname);
    return defaultFilterSel.getError();
  });

  useEffect(() => {
    if (
      !isDefined(defaultSettingFilter) &&
      !isDefined(defaultSettingsFilterError)
    ) {
      dispatch(loadUserSettingsDefaultFilter(gmp)(gmpname));
    }
  }, [
    defaultSettingFilter,
    defaultSettingsFilterError,
    dispatch,
    gmp,
    gmpname,
  ]);

  let [rowsPerPage, rowsPerPageError] = useSelector(state => {
    const userSettingDefaultSel = getUserSettingsDefaults(state);
    return [
      userSettingDefaultSel.getValueByName('rowsperpage'),
      userSettingDefaultSel.getError(),
    ];
  }, shallowEqual);

  useEffect(() => {
    if (!isDefined(rowsPerPage)) {
      dispatch(loadUserSettingDefault(gmp)(ROWS_PER_PAGE_SETTING_ID));
    }
  }, [returnedFilter, rowsPerPage, gmp, dispatch]);

  const [locationQueryFilter, setLocationQueryFilter] = useState(
    isDefined(locationQuery.filter)
      ? Filter.fromString(locationQuery.filter)
      : undefined,
  );

  useEffect(() => {
    if (isDefined(locationQuery.filter)) {
      dispatch(
        setPageFilter(pageName, Filter.fromString(locationQuery.filter)),
      );
    }
    setLocationQueryFilter(undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pageFilter = useSelector(state => getPage(state).getFilter(pageName));

  if (isDefined(locationQueryFilter)) {
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

  const showChildren =
    isDefined(returnedFilter) &&
    (isDefined(defaultSettingFilter) ||
      isDefined(defaultSettingsFilterError)) &&
    isDefined(rowsPerPage);

  return (
    <React.Fragment>
      {showChildren ? children({filter: returnedFilter}) : <Loading />}
    </React.Fragment>
  );
};

FilterProvider.propTypes = {
  fallbackFilter: PropTypes.filter,
  gmpname: PropTypes.string,
  locationQuery: PropTypes.shape({
    filter: PropTypes.string,
  }),
  pageName: PropTypes.string,
};

export default FilterProvider;

// vim: set ts=2 sw=2 tw=80:
