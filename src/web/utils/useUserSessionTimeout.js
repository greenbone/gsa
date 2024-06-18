/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';

import {getSessionTimeout} from 'web/store/usersettings/selectors';
import {setSessionTimeout} from 'web/store/usersettings/actions';

const useUserSessionTimeout = () => {
  const dispatch = useDispatch();
  return [
    useSelector(getSessionTimeout),
    timeout => dispatch(setSessionTimeout(timeout)),
  ];
};

export default useUserSessionTimeout;
