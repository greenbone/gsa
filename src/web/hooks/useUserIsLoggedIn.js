/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';
import {setIsLoggedIn} from 'web/store/usersettings/actions';
import {isLoggedIn} from 'web/store/usersettings/selectors';

const useUserIsLoggedIn = () => {
  const dispatch = useDispatch();
  return [
    useSelector(isLoggedIn),
    loggedIn => dispatch(setIsLoggedIn(loggedIn)),
  ];
};

export default useUserIsLoggedIn;
