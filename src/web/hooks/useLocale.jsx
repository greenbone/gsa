/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {setLocale as setGlobalLocale} from 'gmp/locale/lang';

import {setLocale} from 'web/store/usersettings/actions';
import {getLocale} from 'web/store/usersettings/selectors';

async function wait(ms = 0) {
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
/**
 * Hook to get current locale and allow to change it
 *
 * @returns Array of the current locale and a function to change the locale
 */
const useLocale = () => {
  const dispatch = useDispatch();
  const currentLocale = useSelector(getLocale);

  const changeLocale = useCallback(
    async newLocale => {
      if (currentLocale !== newLocale) {
        dispatch(setLocale(newLocale));

        // allow the locale to be set in the store before the next render
        await wait();

        setGlobalLocale(newLocale);
      }
    },
    [currentLocale, dispatch],
  );
  return [currentLocale, changeLocale];
};

export default useLocale;
