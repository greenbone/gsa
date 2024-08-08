/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect} from 'react';

import {onLanguageChange, getLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import useLocale from 'web/hooks/useLocale';

/**
 * A component that observes the locale, puts it into the redux store and
 * re-renders its children whenever the locale changed
 */
const LocaleObserver = ({children}) => {
  const [locale, setLocale] = useLocale();

  useEffect(() => {
    const unsubscribeFromLanguageChange = onLanguageChange(setLocale);
    return unsubscribeFromLanguageChange;
  }, [setLocale]);

  const currentLocale = locale || getLocale();

  if (!isDefined(currentLocale)) {
    // don't render if no locale has been set yet
    return null;
  }

  return <React.Fragment key={currentLocale}>{children}</React.Fragment>;
};

export default LocaleObserver;
