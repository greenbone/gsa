/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';

import {getUsername} from 'web/store/usersettings/selectors';
import {setUsername} from 'web/store/usersettings/actions';

const useUserName = () => {
  const dispatch = useDispatch();
  return [
    useSelector(getUsername),
    username => dispatch(setUsername(username)),
  ];
};

export default useUserName;
