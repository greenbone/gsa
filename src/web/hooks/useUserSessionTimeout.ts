/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';
import {type Date} from 'gmp/models/date';
import useGmp from 'web/hooks/useGmp';
import {setSessionTimeout} from 'web/store/usersettings/actions';
import {getSessionTimeout} from 'web/store/usersettings/selectors';

/**
 * Custom hook to manage user session timeout.
 *
 * This hook provides the current session timeout, represented as a Date object, and a function to renew the session timeout through an API call.
 * The `renewSessionAndUpdateTimeout` function makes an API call to renew the session and updates the session timeout based on the response, also represented as a Date object.
 * This function does not require any parameters and will update the session timeout to the new value obtained from the API response.
 *
 * @returns An array containing the current `sessionTimeout` as a Date object and the `renewSessionAndUpdateTimeout` function.
 */

const useUserSessionTimeout = (): [Date, () => Promise<void>] => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const sessionTimeout = useSelector(getSessionTimeout);

  const renewSessionAndUpdateTimeout = async () => {
    const response = await gmp.user.renewSession();
    const data = response.data;

    // Extract timeout and jwt from response
    // data may be the timeout value directly, or an object with timeout and jwt properties
    const timeout = (data as Record<string, unknown>)?.timeout ?? data;
    const jwt = (data as Record<string, unknown>)?.jwt;

    if (jwt && typeof jwt === 'string') {
      try {
        gmp.settings.jwt = jwt;
      } catch (err) {
        console.warn('Could not set jwt returned by renewSession', err);
      }
    }

    dispatch(setSessionTimeout(timeout));
  };

  return [sessionTimeout, renewSessionAndUpdateTimeout];
};

export default useUserSessionTimeout;
