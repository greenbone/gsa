/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/string/includes';
import 'core-js/fn/array/includes';

import i18next from 'i18next';
import XHRBackend from 'i18next-xhr-backend';

import logger from '../log';

import {isDefined} from '../utils/identity';

import {setLocale as setDateLocale} from './date';
import Detector from './detector';
import {getLanguageCodes} from './languages';
import {split} from 'gmp/utils/string';

const log = logger.getLogger('gmp.locale.lang');

let languageChangelisteners = [];
let currentLocale;

const notifyLanguageChangeListeners = (lang, initial = false) => {
  for (const listener of languageChangelisteners) {
    listener(lang, initial);
  }
};

const fallbackLng = 'en';
const whitelist = getLanguageCodes();

const I18N_OPTIONS = {
  storage: global.localStorage,
  nsSeparator: false, // don't use a namespace separator in keys
  keySeparator: false, // don't use a key separator in keys
  fallbackLng,
  ns: ['gsa'], // use gsa as namespace
  defaultNS: 'gsa',
  fallbackNS: 'gsa',
  backend: {
    loadPath: '/locales/{{ns}}-{{lng}}.json', // e.g. /locales/gsa-en.json
  },
  whitelist,
  nonExplicitWhitelist: true,
};

i18next.on('languageChanged', lang => {
  if (currentLocale !== lang) {
    log.debug('Language changed to', lang);

    currentLocale = lang;

    setDateLocale(lang);

    notifyLanguageChangeListeners(lang);
  }
});

export const initLocale = ({
  backend = XHRBackend,
  detector = Detector,
  options = I18N_OPTIONS,
} = {}) =>
  i18next
    .use(backend)
    .use(detector)
    .init(options);

/**
 * Subscribe to get notified about locale changes
 *
 * @param {Function} listener Function to get called when language changes
 *
 * @returns {Function} Unsubscribe function
 */
export const onLanguageChange = listener => {
  languageChangelisteners.push(listener);

  return () =>
    (languageChangelisteners = languageChangelisteners.filter(
      l => l !== listener,
    ));
};

/**
 * Get the current used locale
 *
 * @returns {String} Language code of the current used language
 */
export const getLocale = () => currentLocale;

/**
 * Change the current used locale
 *
 * @param {String} lang Language (code) to be set. Pass undefined
 *                      to start automatic detection.
 */
export const setLocale = lang => {
  if (isDefined(lang)) {
    const code = lang.includes('-') ? split(lang, '-', 1)[0] : lang;

    if (!whitelist.includes(lang) && !whitelist.includes(code)) {
      log.warn(`Unknown locale ${lang}. Possible locales are ${whitelist}
        Falling back to ${fallbackLng}.`);
      lang = fallbackLng;
    }
  }

  i18next.changeLanguage(lang, err => {
    if (isDefined(err)) {
      log.warn('Error while setting language to', lang, err);
    }
  });
};

class LazyTranslate {
  constructor(key, options) {
    this.key = key;
    this.options = options;
  }

  toString() {
    return i18next.t(this.key, this.options);
  }
}

const translate = (key, options) => i18next.t(key, options);
const translateLazy = (key, options) => new LazyTranslate(key, options);

export {translate as _};
export {translateLazy as _l};

// vim: set ts=2 sw=2 tw=80:
