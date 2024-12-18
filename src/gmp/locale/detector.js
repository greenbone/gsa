/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import {isArray, isDefined} from 'gmp/utils/identity';

import {BROWSER_LANGUAGE} from './languages';

const log = logger.getLogger('gmp.locale.detector');

const detectLanguageFromStorage = options => options.storage.locale;

const detectLanguageFromNavigator = ({navigator = global.navigator}) => {
  if (navigator) {
    if (navigator.languages) {
      return [...navigator.languages];
    }
    if (navigator.language) {
      return navigator.language;
    }
    if (navigator.userLanguage) {
      return navigator.userLanguage;
    }
  }

  return undefined;
};

class LanguageDetector {
  static type = 'languageDetector';

  init(services, options = {}, i18nOptions = {}) {
    this.services = services;
    this.options = {
      ...i18nOptions,
      ...options,
    };
  }

  detect(...options) {
    const detectors = [detectLanguageFromStorage, detectLanguageFromNavigator];
    let detected = [];

    for (const detector of detectors) {
      const lookup = detector(this.options);
      if (isArray(lookup)) {
        detected = [...detected, ...lookup];
      } else {
        detected.push(lookup);
      }
    }

    detected = detected.filter(l => isDefined(l) && l !== BROWSER_LANGUAGE);

    let lang;
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
