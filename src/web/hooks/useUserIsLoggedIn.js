/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';

import {isLoggedIn} from 'web/store/usersettings/selectors';
import {setIsLoggedIn} from 'web/store/usersettings/actions';

const useUserIsLoggedIn = () => {
  const dispatch = useDispatch();
  return [
    useSelector(isLoggedIn),
    loggedIn => dispatch(setIsLoggedIn(loggedIn)),
  ];
};

export default useUserIsLoggedIn;
