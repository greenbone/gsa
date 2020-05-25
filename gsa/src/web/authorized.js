/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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
import React, {useEffect, useState, useCallback} from 'react';

import {useHistory, useLocation} from 'react-router-dom';

import {useDispatch} from 'react-redux';

import {hasValue} from 'gmp/utils/identity';

import Loading from 'web/components/loading/loading';

import {useIsAuthenticated} from 'web/graphql/auth';

import {setIsLoggedIn} from 'web/store/usersettings/actions';

import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const Authorized = ({children}) => {
  const {isAuthenticated, loading} = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(loading);
  const [, renewSession] = useUserSessionTimeout();

  const gmp = useGmp();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const toLoginPage = useCallback(() => {
    if (location.pathname === '/login') {
      // already at login page. not sure if that can happen anymore.
      return;
    }

    history.replace('/login', {
      next: location.pathname,
    });
  }, [location, history]);

  useEffect(() => {
    const unsubscribe = gmp.subscribeToLogout(() => toLoginPage());
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasValue(isAuthenticated)) {
      dispatch(setIsLoggedIn(isAuthenticated));

      if (isAuthenticated) {
        renewSession();
      } else {
        toLoginPage();
      }
    }
    setIsLoading(loading);
  }, [loading, isAuthenticated, toLoginPage, dispatch, renewSession]);

  if (isLoading) {
    return <Loading />;
  }

  return children;
};

export default Authorized;

// vim: set ts=2 sw=2 tw=80:
