/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSelector, useDispatch} from 'react-redux';

import {setLocale} from 'web/store/usersettings/actions';
import {getLocale} from 'web/store/usersettings/selectors';

/**
 * Hook to get current locale from the store and change it
 *
 * @returns Array of the current locale and a function to change the locale
 */
const useLocale = () => {
  const dispatch = useDispatch();
  return [useSelector(getLocale), locale => dispatch(setLocale(locale))];
};

export default useLocale;
