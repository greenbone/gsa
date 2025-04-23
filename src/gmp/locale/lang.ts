/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {setDateLocale} from 'gmp/locale/date';
import Detector from 'gmp/locale/detector';
import {getLanguageCodes} from 'gmp/locale/languages';
import logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {split} from 'gmp/utils/string';
import i18next, {InitOptions, TFunction} from 'i18next';
import HttpBackend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

const log = logger.getLogger('gmp.locale.lang');

export interface TranslateOptions {
  [key: string]: string | number;
}

export interface LazyTranslate {
  toString(): string;
}

interface InitLocaleOptions {
  backend?: typeof HttpBackend;
  detector?: unknown;
  options?: InitOptions;
}

declare module 'i18next' {
  interface InitOptions {
    storage?: unknown;
  }
}

let languageChangeListeners: Array<(lang: string, initial?: boolean) => void> =
  [];
let currentLocale: string;

const notifyLanguageChangeListeners = (lang: string, initial = false): void => {
  for (const listener of languageChangeListeners) {
    listener(lang, initial);
  }
};

const fallbackLng = 'en';
const whitelist = getLanguageCodes();

// We need to use unknown type for the localStorage access since it's not properly typed in Node environment
const I18N_OPTIONS: InitOptions = {
  // @ts-ignore: using localStorage in Node environment
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  nsSeparator: false, // don't use a namespace separator in keys
  keySeparator: false as const, // don't use a key separator in keys
  fallbackLng,
  ns: ['gsa'], // use gsa as namespace
  defaultNS: 'gsa',
  fallbackNS: 'gsa',
  backend: {
    loadPath: '/locales/{{ns}}-{{lng}}.json', // e.g. /locales/gsa-en.json
  },
  supportedLngs: whitelist,
  nonExplicitSupportedLngs: false,
  returnEmptyString: false,
  interpolation: {
    skipOnVariables: false,
  },
};

i18next.on('languageChanged', (lang: string) => {
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
}: InitLocaleOptions = {}): Promise<TFunction> => {
  // @ts-ignore: detector typing issue
  return i18next.use(backend).use(detector).use(initReactI18next).init(options);
};

/**
 * Subscribe to get notified about locale changes
 *
 * @param listener - Function to get called when language changes
 * @returns Unsubscribe function
 */

export const onLanguageChange = (
  listener: (lang: string, initial?: boolean) => void,
): (() => void) => {
  languageChangeListeners.push(listener);

  return () =>
    (languageChangeListeners = languageChangeListeners.filter(
      l => l !== listener,
    ));
};

/**
 * Get the current used locale
 *
 * @returns Language code of the current used language
 */

export const getLocale = (): string => currentLocale;

/**
 * Change the current used locale
 *
 * @param lang - Language (code) to be set. Pass undefined
 *               to start automatic detection.
 */

export const setLocale = (lang?: string): void => {
  if (isDefined(lang)) {
    const code = lang.includes('-') ? split(lang, '-', 1)[0] : lang;

    if (!whitelist.includes(lang) && !whitelist.includes(code)) {
      log.warn(`Unknown locale ${lang}. Possible locales are ${whitelist}
        Falling back to ${fallbackLng}.`);
      lang = fallbackLng;
    }
  }

  void i18next.changeLanguage(lang, err => {
    if (isDefined(err)) {
      log.warn('Error while setting language to', lang, err);
    }
  });
};

class LazyTranslateImpl implements LazyTranslate {
  private readonly key: string;
  private readonly options?: TranslateOptions;

  constructor(key: string, options?: TranslateOptions) {
    this.key = key;
    this.options = options;
  }

  toString(): string {
    return i18next.t(this.key, this.options);
  }
}

/**
 * Localizes a given string key.
 * @param key - The key to be localized.
 * @param options - Optional parameters for the translation.
 * @returns The localized string.
 */

export const _ = (key: string, options?: TranslateOptions): string =>
  i18next.t(key, options);

/**
 * Localizes a given string lazily.
 *
 * When using this function, the key will be localized when the string is actually used.
 * That means it will be localized when the returned object is used in a string context.
 * For example when it is concatenated with another string or when used inside a template string.
 *
 * @param key - The key to be localized.
 * @param options - Optional parameters for the translation.
 * @returns The localized string.
 */

export const _l = (key: string, options?: TranslateOptions): LazyTranslate =>
  new LazyTranslateImpl(key, options);
