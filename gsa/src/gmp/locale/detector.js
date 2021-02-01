/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {BROWSER_LANGUAGE} from './languages';

import logger from 'gmp/log';

import {isArray, isDefined} from 'gmp/utils/identity';

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
      if (this.services.languageUtils.isWhitelisted(cleaned)) {
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

// vim: set ts=2 sw=2 tw=80:
