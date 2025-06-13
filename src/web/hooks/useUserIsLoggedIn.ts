/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';
import {setIsLoggedIn} from 'web/store/usersettings/actions';
import {isLoggedIn} from 'web/store/usersettings/selectors';

/**
 * Custom hook to manage the user's logged-in state.
 *
 * This hook provides a boolean value indicating whether the user is logged in
 * and a function to update the logged-in state.
 *
 * @returns A tuple containing:
 * - `boolean`: The current logged-in state of the user.
 * - `(loggedIn: boolean) => void`: A function to update the logged-in state.
 *
 * @example
 * const [isLoggedIn, setLoggedIn] = useUserIsLoggedIn();
 */
const useUserIsLoggedIn = (): [boolean, (loggedIn: boolean) => void] => {
  const dispatch = useDispatch();
  return [
    useSelector(isLoggedIn),
    loggedIn => dispatch(setIsLoggedIn(loggedIn)),
  ];
};

export default useUserIsLoggedIn;
