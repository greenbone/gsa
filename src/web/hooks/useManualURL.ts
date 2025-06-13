/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DEFAULT_MANUAL_URL} from 'gmp/gmpsettings';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';

const DEFAULT_LANGUAGE_MAPPING = {
  de: 'de',
};

const DEFAULT_LANGUAGE_PATH = 'en';

const getLanguagePath = (
  locale: string | undefined,
  languageMapping: Record<string, string>,
) => {
  if (!isDefined(locale)) {
    return DEFAULT_LANGUAGE_PATH;
  }

  const code = locale.slice(0, 2);
  const path = languageMapping[code];

  return isDefined(path) ? path : DEFAULT_LANGUAGE_PATH;
};

const useManualURL = (locale?: string) => {
  const [language] = useLanguage();
  const gmp = useGmp();
  const {
    manualUrl = DEFAULT_MANUAL_URL,
    manualLanguageMapping = DEFAULT_LANGUAGE_MAPPING,
  } = gmp.settings;

  const baseUrl = manualUrl.endsWith('/') ? manualUrl : `${manualUrl}/`;
  const languagePath = getLanguagePath(
    locale || language,
    manualLanguageMapping,
  );

  return `${baseUrl}${languagePath}`;
};

export default useManualURL;
