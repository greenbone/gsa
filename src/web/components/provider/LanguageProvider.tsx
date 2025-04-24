/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  getLocale,
  setLocale as changeGmpLocale,
  onLanguageChange,
  DEFAULT_LANGUAGE,
} from 'gmp/locale/lang';
import {createContext, useState, useEffect, useCallback, useMemo} from 'react';
import useGmp from 'web/hooks/useGmp';

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

const SETTING_ID_LOCALE = '6765549a-934e-11e3-b358-406186ea4fc5';

export const LanguageContext = createContext<LanguageContextProps>({
  language: '',
  setLanguage: async () => {},
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const gmp = useGmp();
  const [languageState, setLanguageState] = useState<string>(
    getLocale() ?? DEFAULT_LANGUAGE,
  );

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      setLanguageState(currentLang => {
        if (currentLang !== newLang) {
          // store language in the session
          gmp.settings.locale = newLang;

          void (async () => {
            try {
              // @ts-expect-error
              await gmp.user.saveSetting(SETTING_ID_LOCALE, newLang);
            } catch (error) {
              console.error('Error saving languagte setting:', error);
            }
          })();

          return newLang;
        }
        return currentLang;
      });
    },
    [gmp],
  );

  useEffect(() => {
    const unsubscribe = onLanguageChange(handleLanguageChange);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [handleLanguageChange]);

  const setLanguage = useCallback(
    async (newLang: string) => {
      if (newLang !== languageState) {
        // Set locale in gmp
        changeGmpLocale(newLang);
        // store language in the session
        gmp.settings.locale = newLang;

        // Save the setting permanently
        // @ts-expect-error
        await gmp.user.saveSetting(SETTING_ID_LOCALE, newLang);
      }
    },
    [gmp, languageState],
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
