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
import React, {useEffect, useState} from 'react';

import {useHistory, useLocation} from 'react-router-dom';

import {useDispatch} from 'react-redux';

import {useQuery} from '@apollo/react-hooks';

import gql from 'graphql-tag';

import {hasValue} from 'gmp/utils/identity';

import Loading from 'web/components/loading/loading';

import {setIsLoggedIn} from 'web/store/usersettings/actions';

import useGmp from 'web/utils/useGmp';

const GET_CURRENT_USER = gql`
  query {
    currentUser {
      isAuthenticated
    }
  }
`;

const useQueryCurrentUser = () =>
  useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'no-cache',
  });

const Authorized = ({children}) => {
  const {data, loading} = useQueryCurrentUser();
  const [isLoading, setIsLoading] = useState(loading);

  const gmp = useGmp();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const toLoginPage = () => {
    if (location.pathname === '/login') {
      // already at login page
      return;
    }

    history.replace('/login', {
      next: location.pathname,
    });
  };

  useEffect(() => {
    const unsubscribe = gmp.subscribeToLogout(() => toLoginPage());
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasValue(data)) {
      const {isAuthenticated} = data.currentUser;

      dispatch(setIsLoggedIn(isAuthenticated));

      if (!isAuthenticated) {
        toLoginPage();
      }
    }
    setIsLoading(loading);
  }, [loading, data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    // to prevent infinite loading if there is an error
    // upon error Authorized will run
    // Likely hyperion is down. In which case trying to login
    // will return the error on loginpage.
    return <Loading />;
  }

  return children;
};

export default Authorized;

// vim: set ts=2 sw=2 tw=80:
