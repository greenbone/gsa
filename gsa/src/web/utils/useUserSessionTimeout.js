/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {useSelector, useDispatch} from 'react-redux';

import {gql, useMutation} from '@apollo/client';

import date from 'gmp/models/date';

import {getSessionTimeout} from 'web/store/usersettings/selectors';
import {setSessionTimeout} from 'web/store/usersettings/actions';

import useGmp from './useGmp';

export const RENEW_SESSION = gql`
  mutation renewSession {
    renewSession {
      currentUser {
        sessionTimeout
      }
    }
  }
`;

const useUserSessionTimeout = () => {
  const dispatch = useDispatch();
  const gmp = useGmp();
  const [renewSession] = useMutation(RENEW_SESSION);
  const {enableHyperionOnly = false} = gmp.settings;
  return [
    useSelector(getSessionTimeout),
    useCallback(() => {
      if (!enableHyperionOnly) {
        gmp.user.renewSession();
      }

      renewSession().then(({data}) =>
        dispatch(
          setSessionTimeout(date(data.renewSession.currentUser.sessionTimeout)),
        ),
      );
    }, [renewSession, dispatch, enableHyperionOnly, gmp.user]),
    timeout => dispatch(setSessionTimeout(timeout)),
  ];
};

export default useUserSessionTimeout;
