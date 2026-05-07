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
 * @returns A tuple containing the current language and a function to update it.
 * The update function accepts a language code as a parameter and returns a
 * promise that resolves when the language has been updated.
 */
const useLanguage = (): LanguageHook => {
  const {language, setLanguage} = useContext(LanguageContext);
  return [language, setLanguage];
};

export default useLanguage;
