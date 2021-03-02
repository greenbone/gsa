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

import {useLocation, useHistory} from 'react-router-dom';

import {useDispatch} from 'react-redux';

import {RESET_FILTER} from 'gmp/models/filter';

import {pageFilter} from 'web/store/pages/actions';

const useChangeFilter = pageName => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const changeFilter = useCallback(
    filter => {
      dispatch(pageFilter(pageName, filter));
    },
    [dispatch, pageName],
  );

  const handleFilterRemove = useCallback(() => {
    changeFilter(RESET_FILTER);
  }, [changeFilter]);

  const handleFilterReset = useCallback(() => {
    const query = {...location.query};

    // remove filter param from url
    delete query.filter;

    history.push({pathname: location.pathname, query});

    changeFilter();
  }, [changeFilter, history, location]);

  return {
    reset: handleFilterReset,
    remove: handleFilterRemove,
    change: changeFilter,
  };
};

export default useChangeFilter;
