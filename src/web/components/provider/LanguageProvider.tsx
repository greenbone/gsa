/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  getLocale,
  setLocale as changeGmpLocale,
  onLanguageChange,
} from 'gmp/locale/lang';
import {createContext, useState, useEffect, useCallback, useMemo} from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (newLang: string) => void;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageContext = createContext<LanguageContextProps>({
  language: '',
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [languageState, setLanguageState] = useState<string>(
    getLocale() ?? 'en',
  );

  useEffect(() => {
    const unsubscribe = onLanguageChange((newLang: string) => {
      setLanguageState(currentLang =>
        currentLang !== newLang ? newLang : currentLang,
      );
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const setLanguage = useCallback(
    (newLang: string) => {
      if (newLang !== languageState) {
        setLanguageState(newLang);
        changeGmpLocale(newLang);
      }
    },
    [languageState],
  );

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
