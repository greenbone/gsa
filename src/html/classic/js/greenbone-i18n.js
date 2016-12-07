/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Dialog JavaScript for GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Benoît Allard <benoit.allard@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2015 - 2016 Greenbone Networks GmbH
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

(function(global, document, $, console, localStorage, location) {
  'use strict';

  /*
  * GSA base object
  */
  if (global.gsa === undefined) {
    global.gsa = {};
  }

  var gsa = global.gsa;

  gsa.init_i18n = init_i18n;

  function LanguageDetector() {
    global.i18nextBrowserLanguageDetector.call(this);
  }

  function init_i18n() {

    gsa.derive(LanguageDetector, global.i18nextBrowserLanguageDetector);

    LanguageDetector.prototype.detect = function() {
        var lang = $('html').attr('lang');

        if (lang) {
        return lang;
        }

        return global.i18nextBrowserLanguageDetector.prototype.detect.call(this);
    };

    LanguageDetector.type = 'languageDetector';

    global.i18next
        .use(global.i18nextXHRBackend) // use ajax backend
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
              /* only use url querystring and browser settings for language detection */
              order: ['querystring', 'navigator'],
              /* use url?lang=de as querystring */
              lookupQuerystring: 'lang',
          },
          }, function(err, t) {
          /* keep quiet if translations have not be found.
          * errors can be debugged here */
        });

    /* Use an own function for translations
    *
    * This may allow to switch the i18n backend easily without having to adjust
    * all function calls.
    * */
    gsa._ = function(key, options) {
        return global.i18next.t(key, options);
    };
  }
})(window, window.document, window.$, window.console, window.localStorage,
  window.location);

// vim: set ts=2 sw=2 tw=80:
