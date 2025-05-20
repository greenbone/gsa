/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {BROWSER_LANGUAGE} from 'gmp/locale/languages';
import logger from 'gmp/log';
import {isArray, isDefined} from 'gmp/utils/identity';

const log = logger.getLogger('gmp.locale.detector');

const detectLanguageFromStorage = (options: {
  storage: {locale: string | undefined};
}) => options.storage.locale;

const detectLanguageFromNavigator = ({navigator = global.navigator}) => {
  if (navigator) {
    if (navigator.languages) {
      return [...navigator.languages];
    }
    if (navigator.language) {
      return navigator.language;
    }
    // @ts-expect-error
    if (navigator.userLanguage) {
      // @ts-expect-error
      return navigator.userLanguage;
    }
  }

  return undefined;
};

class LanguageDetector {
  static type = 'languageDetector';

  private services;
  private options;

  init(services, options = {}, i18nOptions = {}) {
    this.services = services;
    this.options = {
      ...i18nOptions,
      ...options,
    };
  }

  detect() {
    const detectors = [detectLanguageFromStorage, detectLanguageFromNavigator];
    let detected: string[] = [];

    for (const detector of detectors) {
      const lookup: string | string[] = detector(this.options);
      if (isArray(lookup)) {
        detected = [...detected, ...lookup];
      } else {
        detected.push(lookup);
      }
    }

    detected = detected.filter(l => isDefined(l) && l !== BROWSER_LANGUAGE);

    let lang: string | undefined;
    for (const l of detected) {
      const cleaned = this.services.languageUtils.formatLanguageCode(l);
      if (this.services.languageUtils.isSupportedCode(cleaned)) {
        lang = cleaned;
        break;
      }
    }

    if (!isDefined(lang)) {
      const {fallbackLng} = this.options;
      lang = isArray(fallbackLng) ? fallbackLng[0] : fallbackLng;
    }

    log.debug('Detected language', lang);
    return lang;
  }

  cacheUserLanguage() {
    // don't cache anything
  }
}

export default LanguageDetector;
