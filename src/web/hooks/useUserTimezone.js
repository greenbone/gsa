/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';

import {getTimezone} from 'web/store/usersettings/selectors';
import {setTimezone} from 'web/store/usersettings/actions';

const useUserTimezone = () => {
  const dispatch = useDispatch();
  return [
    useSelector(getTimezone),
    timezone => dispatch(setTimezone(timezone)),
  ];
};

export default useUserTimezone;
