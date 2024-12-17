/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {split} from 'gmp/utils/string';
import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

import {setLocale as setDateLocale} from './date';
import Detector from './detector';
import {getLanguageCodes} from './languages';

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
  supportedLngs: whitelist,
  nonExplicitSupportedLngs: false,
  interpolation: {
    skipOnVariables: false,
  },
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
  backend = HttpBackend,
  detector = Detector,
  options = I18N_OPTIONS,
} = {}) =>
  i18next.use(backend).use(detector).use(initReactI18next).init(options);

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
    /* i18next-extract-disable-next-line */
    return i18next.t(this.key, this.options);
  }
}

/* i18next-extract-disable-next-line */
const translate = (key, options) => i18next.t(key, options);
const translateLazy = (key, options) => new LazyTranslate(key, options);

export {translate as _};
export {translateLazy as _l};

// vim: set ts=2 sw=2 tw=80:
