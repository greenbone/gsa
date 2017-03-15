/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import $ from 'jquery';
import i18next from 'i18next';
import moment from 'moment';
import XHRBackend from 'i18next-xhr-backend';
import BrowserDetector from 'i18next-browser-languagedetector';

import {is_defined, is_string, is_date, parse_int} from './utils.js';
import logger from './log.js';

const log = logger.getLogger('locale');

export class LanguageDetector extends BrowserDetector {

  detect(...options) {
    let lang = $('html').attr('lang');

    if (!lang) {
      lang = super.detect(...options);
    }

    log.debug('Detected language', lang);
    moment.locale(lang);
    return lang;
  }
}

LanguageDetector.type = 'languageDetector';

i18next
  .use(XHRBackend) // use ajax backend
  .use(LanguageDetector) // use own detector for language detection
  .init({
    nsSeparator: false, // don't use a namespace seperator in keys
    keySeperator: false, // don't use a key spererator in keys
    fallbackLng: 'en',
    ns: ['gsad'], // use gsad as namespace
    defaultNS: 'gsad',
    fallbackNS: 'gsad',
    backend: {
      loadPath: '/js/locales/{{ns}}-{{lng}}.json', // e.g. /js/locales/gsad-en.json
    },
    detection: {
      // only use url querystring and browser settings for language detection
      order: ['querystring', 'navigator'],
      // use url?lang=de as querystring
      lookupQuerystring: 'lang',
    },
  }, function(err, t) { // eslint-disable-line

    /* keep quiet if translations have not be found.
     * errors can be debugged here */
  });


export function translate(key, options) {
  return i18next.t(key, options);
}

function date_format(date, format) {
  if (!is_defined(date)) {
    return undefined;
  }

  if (!moment.isMoment(date)) {
    if (is_string(date) || is_date(date)) {
      date = moment(date);
    }
    else {
      log.error('Invalid date', date);
      return undefined;
    }
  }
  return date.format(format);
}

export function short_date(date) {
  return date_format(date, 'L');
}

export function datetime(date) {
  return date_format(date, 'llll');
}

export default translate;

// vim: set ts=2 sw=2 tw=80:
