/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

import useGmp from './useGmp';
import useLocale from './useLocale';

const DEFAULT_LANGUAGE_MAPPING = {
  de: 'de',
};

const DEFAULT_LANGUAGE_PATH = 'en';

const getLanguagePath = (locale, languageMapping) => {
  if (!isDefined(locale)) {
    return DEFAULT_LANGUAGE_PATH;
  }

  const code = locale.slice(0, 2);
  const path = languageMapping[code];

  return isDefined(path) ? path : DEFAULT_LANGUAGE_PATH;
};

const useManualURL = locale => {
  const [userLocale] = useLocale();
  const gmp = useGmp();
  const {manualUrl, manualLanguageMapping = DEFAULT_LANGUAGE_MAPPING} =
    gmp.settings;

  let url = manualUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url += getLanguagePath(locale || userLocale, manualLanguageMapping);
  return url;
};

export default useManualURL;
