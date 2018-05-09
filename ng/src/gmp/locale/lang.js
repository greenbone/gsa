/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import i18next from 'i18next';
import XHRBackend from 'i18next-xhr-backend';

import logger from '../log';

import {is_defined} from '../utils/identity';

import Detector from './detector';
import LanguageStore from './store';

const log = logger.getLogger('gmp.locale.lang');

i18next
  .use(XHRBackend) // use ajax backend
  .use(Detector) // use own detector for language detection
  .init({
    nsSeparator: false, // don't use a namespace separator in keys
    keySeparator: false, // don't use a key separator in keys
    fallbackLng: 'en',
    ns: ['gsa'], // use gsa as namespace
    defaultNS: 'gsa',
    fallbackNS: 'gsa',
    backend: {
      loadPath: '/locales/{{ns}}-{{lng}}.json', // e.g. /locales/gsa-en.json
    },
  }, function(err, t) { // eslint-disable-line

    /* keep quiet if translations have not be found.
     * errors can be debugged here */
  });

let listeners = [];

/**
 * Subscribe to get notified about language changes
 *
 * @param {Function} listener Function to get called when language changes
 *
 * @returns {Function} Unsubscribe function
 */
export const subscribe = listener => {
  listeners.push(listener);

  return () => listeners = listeners.filter(l => l !== listener);
};

/**
 * Get the current used language
 *
 * @returns {String} Language code of the current used language
 */
export const get_language = () => i18next.language;

/**
 * Change the current used language
 *
 * @param {String} lang Language (code) to be set. Pass undefined
 *                      to start automatic detection.
 * @returns undefined
 */
export const set_language = lang => i18next.changeLanguage(lang, err => {
  if (is_defined(err)) {
    log.error('Could not set language to', lang, err);
  }
  else {
    log.debug('Language changed to', get_language());

    if (is_defined(lang)) {
      // store set language
      LanguageStore.set(lang);
    }
    else {
      // auto detection case. delete previous value from store
      LanguageStore.delete();
    }

    for (const listener of listeners) {
      listener(lang);
    }
  }
});

export const translate = (key, options) => i18next.t(key, options);

// vim: set ts=2 sw=2 tw=80:
