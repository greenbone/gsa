/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import {LanguageContext} from 'web/components/provider/LanguageProvider';

type LanguageHook = [string, (lang: string) => Promise<void>];

/**
 * Hook to access and update the current language
 *
 * @returns {Array} [language, setLanguage] Array with current language and setter function
 */
const useLanguage = (): LanguageHook => {
  const {language, setLanguage} = useContext(LanguageContext);
  return [language, setLanguage];
};

export default useLanguage;
