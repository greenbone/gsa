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

import {gql, useQuery, useLazyQuery, useMutation} from '@apollo/client';

export const GET_CURRENT_USER_IS_AUTHENTICATED = gql`
  query {
    currentUser {
      isAuthenticated
    }
  }
`;

export const useIsAuthenticated = () => {
  const {data, ...other} = useQuery(GET_CURRENT_USER_IS_AUTHENTICATED, {
    fetchPolicy: 'no-cache', // never cache the query!
  });
  const isAuthenticated = data?.currentUser?.isAuthenticated;
  return {isAuthenticated, ...other};
};

export const useLazyIsAuthenticated = () => {
  const [getCurrentUser, {data, ...other}] = useLazyQuery(
    GET_CURRENT_USER_IS_AUTHENTICATED,
    {
      fetchPolicy: 'no-cache',
    },
  );
  const isAuthenticated = data?.currentUser?.isAuthenticated;
  return [getCurrentUser, {isAuthenticated, ...other}];
};

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ok
      locale
      sessionTimeout
      timezone
    }
  }
`;

export const useLogin = () => {
  const [loginMutation, {data, ...other}] = useMutation(LOGIN);
  const login = useCallback(
    ({username, password}) => {
      return loginMutation({variables: {username, password}});
    },
    [loginMutation],
  );
  const loginData = data?.login;
  return [login, {...other, ...loginData}];
};
