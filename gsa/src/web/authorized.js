/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import React, {useEffect, useCallback} from 'react';

import {useHistory, useLocation} from 'react-router-dom';

import {useDispatch} from 'react-redux';

import {hasValue} from 'gmp/utils/identity';

import Loading from 'web/components/loading/loading';

import {useIsAuthenticated} from 'web/graphql/auth';

import {setIsLoggedIn} from 'web/store/usersettings/actions';

import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const Authorized = ({children}) => {
  const {isAuthenticated, loading: isLoading, error} = useIsAuthenticated();
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
  }, [isAuthenticated, toLoginPage, dispatch, renewSession]);

  useEffect(() => {
    // redirect to login page if an error has occurred when requesting the
    // authentication status. this should be a general issue with the setup and
    // therefore we should avoid rendering anything then the login page.

    if (hasValue(error)) {
      toLoginPage();
    }
  }, [toLoginPage, error]);

  if (isLoading) {
    return <Loading />;
  }

  // don't render children if user is not authenticated. this can happen for one
  // render cycle after the data has loaded and the effect has not fired yet.
  return isAuthenticated ? children : null;
};

export default Authorized;

// vim: set ts=2 sw=2 tw=80:
