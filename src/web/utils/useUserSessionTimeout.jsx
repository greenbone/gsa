/* Copyright (C) 2019-2022 Greenbone AG
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

import {getSessionTimeout} from 'web/store/usersettings/selectors';
import {setSessionTimeout} from 'web/store/usersettings/actions';
import useGmp from 'web/utils/useGmp';

/**
 * Custom hook to manage user session timeout.
 *
 * This hook provides the current session timeout, represented as a moment object, and a function to renew the session timeout through an API call.
 * The `renewSessionAndUpdateTimeout` function makes an API call to renew the session and updates the session timeout based on the response, also represented as a moment object.
 * This function does not require any parameters and will update the session timeout to the new value obtained from the API response.
 *
 * @returns {Array} An array containing the current `sessionTimeout` as a moment object and the `renewSessionAndUpdateTimeout` function.
 */

const useUserSessionTimeout = () => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const sessionTimeout = useSelector(getSessionTimeout);

  const renewSessionAndUpdateTimeout = async () => {
    const response = await gmp.user.renewSession();
    dispatch(setSessionTimeout(response.data));
  };

  return [sessionTimeout, renewSessionAndUpdateTimeout];
};

export default useUserSessionTimeout;
