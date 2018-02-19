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

const log = logger.getLogger('gmp.locale.lang');

i18next
  .use(XHRBackend) // use ajax backend
  .use(Detector) // use own detector for language detection
  .init({
    nsSeparator: false, // don't use a namespace seperator in keys
    keySeperator: false, // don't use a key spererator in keys
    fallbackLng: 'en',
    ns: ['gsad'], // use gsad as namespace
    defaultNS: 'gsad',
    fallbackNS: 'gsad',
    backend: {
      loadPath: '/locales/{{ns}}-{{lng}}.json', // e.g. /locales/gsad-en.json
    },
  }, function(err, t) { // eslint-disable-line

    /* keep quiet if translations have not be found.
     * errors can be debugged here */
  });

export const get_language = () => i18next.language;
export const set_language = lang => i18next.changeLanguage(lang, err => {
  if (is_defined(err)) {
    log.error('Could not set language to', lang, err);
  }
  else {
    log.debug('Language changed to', lang);
  }
});

export const translate = (key, options) => i18next.t(key, options);

// vim: set ts=2 sw=2 tw=80:
