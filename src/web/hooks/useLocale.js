/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useCallback} from 'react';
import {isDefined} from 'gmp/utils/identity';

import {useSelector, useDispatch} from 'react-redux';

import {
  setLocale as setGlobalLocale,
  getLocale as getGlobalLocal,
} from 'gmp/locale/lang';

import {setLocale} from 'web/store/usersettings/actions';
import {getLocale} from 'web/store/usersettings/selectors';

async function wait(ms = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
/**
 * Hook to get current locale and allow to change it
 *
 * @returns {[string, function]} Current locale and a function to change it.
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

  // Effect to initialize the locale if it's not already defined
  useEffect(() => {
    if (!isDefined(currentLocale)) {
      const locale = getGlobalLocal();
      changeLocale(locale);
    }
  }, [currentLocale, changeLocale]);

  return [currentLocale, changeLocale];
};

export default useLocale;
