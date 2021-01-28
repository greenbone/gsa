/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import {isDefined, isString, isNumber, isArray} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import date, {duration} from 'gmp/models/date';

export const parseSeverity = value =>
  isEmpty(value) ? undefined : parseFloat(value);

export const parseProgressElement = value => {
  if (!isDefined(value)) {
    return 0;
  }

  if (isDefined(value.__text)) {
    value = value.__text;
  }

  const progress = parseFloat(value);
  return isDefined(progress) ? progress : 0;
};

export const parseText = text => {
  if (isDefined(text) && isDefined(text.__text)) {
    text = text.__text;
  }
  return text;
};

export const parseTextElement = (text = {}) => {
  if (isDefined(text.__text)) {
    return {
      text: text.__text,
      textExcerpt: text.__excerpt,
    };
  }

  return {
    text,
    textExcerpt: '0',
  };
};

export const parseInt = value => {
  if (!/^(-|\+)?([0-9.]+)$/.test(value)) {
    return undefined;
  }

  const val = global.parseInt(value, 10);

  if (isNaN(val)) {
    return undefined;
  }

  return val;
};

export const parseFloat = value => {
  if (!/^(-|\+)?([0-9.]+)$/.test(value)) {
    return undefined;
  }

  const val = global.parseFloat(value);

  if (isNaN(val)) {
    return undefined;
  }

  return val;
};

export const parseIntoArray = value => (isArray(value) ? value : [value]);

export const YES_VALUE = 1;
export const NO_VALUE = 0;

export const parseYesNo = value =>
  value === '1' || value === 1 ? YES_VALUE : NO_VALUE;

export function parseYes(value) {
  return value === 'yes' ? YES_VALUE : NO_VALUE;
}

export const parseCsv = (value = '') => {
  if (!isString(value)) {
    value = `${value}`;
  }

  return isEmpty(value.trim()) ? [] : value.split(',').map(val => val.trim());
};

export const parseQod = qod => ({
  type: qod.type,
  value: parseFloat(qod.value),
});

const ENVELOPE_PROPS = [
  ['version', 'version'],
  ['backend_operation', 'backendOperation'],
  ['vendor_version', 'vendorVersion'],
  ['i18n', 'i18n'],
  ['time', 'time'],
  ['timezone', 'timezone'],
];

export const parseEnvelopeMeta = envelope => {
  const meta = {};

  for (const [name, to] of ENVELOPE_PROPS) {
    meta[to] = envelope[name];
    delete envelope[name];
  }
  return meta;
};

const esc2xml = {
  '&quot;': `"`,
  '&apos;': `'`,
  '&amp;': `&`,
  '&lt;': `<`,
  '&gt;': `>`,
  '&#x2F;': `/`,
  '&#x5C;': `\\`,
};

export const parseXmlEncodedString = string =>
  string.replace(
    /(&quot;|&lt;|&gt;|&amp;|&apos;|&#x2F;|&#x5C;)/g,
    (str, symbol) => esc2xml[symbol],
  );

export const parseProperties = (element = {}, object = {}) => {
  const copy = {...object, ...element}; // create shallow copy

  if (isString(element._id) && element._id.length > 0) {
    // only set id if it id defined
    copy.id = element._id;
  }

  if (isDefined(element.creation_time)) {
    copy.creationTime = parseDate(element.creation_time);
    delete copy.creation_time;
  }
  if (isDefined(element.modification_time)) {
    copy.modificationTime = parseDate(element.modification_time);
    delete copy.modification_time;
  }

  if (isDefined(copy.type)) {
    // type should not be used directly
    copy._type = copy.type;
    delete copy.type;
  }

  return copy;
};

export const setProperties = (
  properties,
  object = {},
  {writable = false} = {},
) => {
  if (isDefined(properties)) {
    for (const [key, value] of Object.entries(properties)) {
      if (!key.startsWith('_')) {
        Object.defineProperty(object, key, {
          value,
          writable,
          enumerable: true,
        });
      }
    }
  }
  return object;
};

/**
 * Parse date(time) from string
 *
 * @param {String} value Date as string to be parsed
 *
 * @returns {date} A date instance (Not a js Date!)
 */
export const parseDate = value => (isDefined(value) ? date(value) : undefined);

/**
 * Parse duration from string or integer
 *
 * @param {String|int} value Duration as string or int in seconds.
 *
 * @returns duration A duration instance
 */
export const parseDuration = value => {
  if (isString(value)) {
    value = parseInt(value);
  }
  if (!isDefined(value)) {
    return undefined;
  }
  return duration(value, 'seconds');
};

/**
 * Parse Numbers, Number Strings and Boolean to Boolean
 *
 * Number Strings are converted to Numbers by using the parseInt function.
 * A Number is considered true if the value is not equal zero.
 * All other values are compared against true.
 *
 * @param {String, Number, Boolean} value Value to convert to boolean
 *
 * @returns true if value is considered true else false
 */
export const parseBoolean = value => {
  if (isString(value)) {
    value = parseInt(value);
  }
  if (isNumber(value)) {
    return value !== 0;
  }
  return value === true;
};

// vim: set ts=2 sw=2 tw=80:
