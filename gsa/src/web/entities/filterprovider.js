/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React, {useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {ROWS_PER_PAGE_SETTING_ID} from 'gmp/commands/users';

import Filter, {DEFAULT_FALLBACK_FILTER} from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import Loading from 'web/components/loading/loading';

import getPage from 'web/store/pages/selectors';
import {loadUserSettingDefault} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {loadUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/actions';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const FilterProvider = ({
  children,
  fallbackFilter,
  gmp,
  gmpname,
  locationQuery = {},
}) => {
  const dispatch = useDispatch();

  let returnedFilter;

  let defaultSettingFilter = useSelector(state =>
    getUserSettingsDefaultFilter(state, gmpname).getFilter(),
  );

  useEffect(() => {
    if (!isDefined(defaultSettingFilter)) {
      dispatch(loadUserSettingsDefaultFilter(gmp)(gmpname));
    }
  }, [defaultSettingFilter, dispatch, gmp, gmpname]);

  const rowsPerPage = useSelector(state =>
    getUserSettingsDefaults(state).getValueByName('rowsperpage'),
  );

  useEffect(() => {
    if (!isDefined(rowsPerPage)) {
      dispatch(loadUserSettingDefault(gmp)(ROWS_PER_PAGE_SETTING_ID));
    }
  }, [returnedFilter, rowsPerPage, gmp, dispatch]);

  const pageFilter = useSelector(state => getPage(state).getFilter(gmpname));

  if (isDefined(locationQuery.filter)) {
    returnedFilter = Filter.fromString(locationQuery.filter);
  } else if (isDefined(pageFilter)) {
    returnedFilter = pageFilter;
  } else if (isDefined(defaultSettingFilter) && defaultSettingFilter !== null) {
    returnedFilter = defaultSettingFilter;
  } else if (isDefined(fallbackFilter)) {
    returnedFilter = fallbackFilter;
  } else {
    returnedFilter = DEFAULT_FALLBACK_FILTER;
  }

  // TODO remove the following line once the resultsfilter is working correctly
  if (gmpname === 'result') {
    defaultSettingFilter = null;
  }

  if (!returnedFilter.has('rows') && isDefined(rowsPerPage)) {
    returnedFilter.set('rows', rowsPerPage);
  }

  const showChildren =
    isDefined(returnedFilter) &&
    isDefined(defaultSettingFilter) &&
    isDefined(rowsPerPage);

  return (
    <React.Fragment>
      {showChildren ? (
        <React.Fragment>
          <span data-testid="awaiting-span" />
          {children({filter: returnedFilter})}
        </React.Fragment>
      ) : (
        <Loading />
      )}
    </React.Fragment>
  );
};

FilterProvider.propTypes = {
  fallbackFilter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  gmpname: PropTypes.string,
  locationQuery: PropTypes.shape({
    filter: PropTypes.string,
  }),
};

export default withGmp(FilterProvider);

// vim: set ts=2 sw=2 tw=80:
