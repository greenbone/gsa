/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {setDateLocale} from 'gmp/locale/date';
import {
  getLocale,
  onLanguageChange,
  setLocale as changeGmpLocale,
} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import {createContext, useState, useEffect, useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

interface LanguageContextProps {
  language: string;
  setLanguage: (newLang: string) => void;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

interface UserSettingsState {
  userSettings?: {
    locale?: string;
  };
}

export const LanguageContext = createContext<LanguageContextProps>({
  language: '',
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [languageState, setLanguageState] = useState<string>(
    getLocale() || 'en',
  );

  const storeLocale = useSelector(
    (state: UserSettingsState) => state?.userSettings?.locale,
  );

  useEffect(() => {
    if (storeLocale && storeLocale !== languageState) {
      setLanguageState(storeLocale);
    }

    const unsubscribe = onLanguageChange((newLang: string) => {
      setLanguageState(newLang);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [storeLocale, languageState]);

  useEffect(() => {
    const currentLocale = languageState || getLocale();

    if (!isDefined(currentLocale)) {
      return;
    }

    setLanguageState(currentLocale);
  }, [languageState]);

  const setLanguage = useCallback((newLang: string) => {
    setLanguageState(newLang);
    changeGmpLocale(newLang);
    setDateLocale(newLang);
  }, []);

  const value = useMemo(
    () => ({
      language: languageState,
      setLanguage,
    }),
    [languageState, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
