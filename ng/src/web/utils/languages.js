/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import _ from 'gmp/locale';

/* TODO should be changed to use a better value.
   Requires changes in gsad and gvmd.
*/
export const BROWSER_LANGUAGE = 'Browser Language';

const Languages = {
  ar: {
    name: 'Arabic',
    native_name: 'العربية',
  },
  de: {
    name: 'German',
    native_name: 'Deutsch',
  },
  en: {
    name: 'English',
    native_name: 'English',
  },
  es: {
    name: 'Spanish',
    native_name: 'español',
  },
  fr: {
    name: 'French',
    native_name: 'français',
  },
  it: {
    name: 'Italian',
    native_name: 'italiano',
  },
  ja: {
    name: 'Japanese',
    native_name: '日本語',
  },
  pt_BR: {
    name: 'Portuguese (Brazil)',
    native_name: 'português (Brasil)',
  },
  ru: {
    name: 'Russian',
    native_name: 'ру́сский',
  },
  tr: {
    name: 'Turkish',
    native_name: 'Türkçe',
  },
  zh_CN: {
    name: 'Chinese (China)',
    native_name: '中文 (中国)',
  },

  [BROWSER_LANGUAGE]: {
    name: _('Browser Language'),
  },
};

export default Languages;

// vim: set ts=2 sw=2 tw=80:
