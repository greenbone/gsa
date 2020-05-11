/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import {useSelector, useDispatch} from 'react-redux';

import gql from 'graphql-tag';

import {useMutation} from '@apollo/react-hooks';

import date from 'gmp/models/date';

import {getSessionTimeout} from 'web/store/usersettings/selectors';
import {setSessionTimeout} from 'web/store/usersettings/actions';

import useGmp from './useGmp';

const RENEW_SESSION = gql`
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
  return [
    useSelector(getSessionTimeout),
    () => {
      if (!gmp.settings.isHyperionOnly) {
        gmp.user.renewSession();
      }

      renewSession().then(({data}) =>
        dispatch(
          setSessionTimeout(date(data.renewSession.currentUser.sessionTimeout)),
        ),
      );
    },
    timeout => dispatch(setSessionTimeout(timeout)),
  ];
};

export default useUserSessionTimeout;
