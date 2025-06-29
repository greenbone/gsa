/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';
import {setUsername} from 'web/store/usersettings/actions';
import {getUsername} from 'web/store/usersettings/selectors';

/**
 * Custom hook to get and set the username.
 *
 * @returns An array containing the current username and a function to set the username.
 */
const useUserName = (): [string, (username: string) => void] => {
  const dispatch = useDispatch();
  return [
    useSelector(getUsername),
    (username: string) => dispatch(setUsername(username)),
  ];
};

export default useUserName;
