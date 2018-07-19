/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';
import 'core-js/fn/string/starts-with';

import {is_defined, isString} from './utils/identity';
import {isEmpty} from './utils/string';

import date, {duration} from './models/date';

export function parseSeverity(value) {
  return isEmpty(value) ? undefined : parseFloat(value);
}

export function parseProgress(value) {
  if (!is_defined(value)) {
    return 0;
  }
  if (is_defined(value.__text)) {
    value = value.__text;
  }
  return parseFloat(value);
}

export function parseText(text) {
  if (is_defined(text.__text)) {
    return {
      text: text.__text,
      text_excerpt: text.__excerpt,
    };
  }

  return {
    text,
    text_excerpt: '0',
  };
}

export function parseInt(value) {
  if (!(/^(-|\+)?([0-9.]+)$/).test(value)) {
    return undefined;
  }

  const val = global.parseInt(value, 10);

  if (isNaN(val)) {
    return undefined;
  }

  return val;
}

export function parseFloat(value) {
  const val = global.parseFloat(value);

  if (isNaN(val)) {
    return undefined;
  }

  return val;
}

export const YES_VALUE = 1;
export const NO_VALUE = 0;

export function parseYesNo(value) {
  return value === '1' || value === 1 ? YES_VALUE : NO_VALUE;
}


export function parseCsv(value) {
  if (isEmpty(value)) {
    return [];
  }
  return value.split(',').map(val => val.trim());
}

export const parseQod = qod => ({
  type: qod.type,
  value: parseFloat(qod.value),
});

export function parseEnvelopeMeta(envelope) {
  const meta = {};

  const props = [
    'version',
    'backend_operation',
    'vendor_version',
    'i18n',
    'time',
    'timezone',
  ];

  for (const name of props) {
    meta[name] = envelope[name];
  }
  return meta;
}

export const parseProperties = (element, object = {}) => {
  const copy = {...object, ...element}; // create shallow copy

  if (isString(element._id) && element._id.length > 0) {
    // only set id if it id defined
    copy.id = element._id;
  }

  if (is_defined(element.creation_time)) {
    copy.creationTime = parseDate(element.creation_time);
    delete copy.creation_time;
  }
  if (is_defined(element.modification_time)) {
    copy.modificationTime = parseDate(element.modification_time);
    delete copy.modification_time;
  }

  if (is_defined(copy.type)) {
    // type should not be used directly
    copy._type = copy.type;
    delete copy.type;
  }

  return copy;
};

export const setProperties = (properties, object = {}) => {
  if (is_defined(properties)) {
    for (const [key, value] of Object.entries(properties)) {
      if (!key.startsWith('_')) {
        Object.defineProperty(object, key, {
          value,
          writable: false,
          enumerable: true,
        });
      }
    }
  }
  return object;
};

export const parseCvssBaseVector = ({
  accessComplexity,
  accessVector,
  authentication,
  availabilityImpact,
  confidentialityImpact,
  integrityImpact,
}) => {
  if (!is_defined(accessVector) &&
    !is_defined(accessComplexity) &&
    !is_defined(authentication) &&
    !is_defined(confidentialityImpact) &&
    !is_defined(integrityImpact) &&
    !is_defined(availabilityImpact)) {
    return undefined;
  }

  let vector = 'AV:';

  switch (accessVector) {
    case 'LOCAL':
      vector += 'L';
      break;
    case 'NETWORK':
      vector += 'N';
      break;
    case 'ADJACENT_NETWORK':
      vector += 'A';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/AC:';
  switch (accessComplexity) {
    case 'LOW':
      vector += 'L';
      break;
    case 'MEDIUM':
      vector += 'M';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/Au:';
  switch (authentication) {
    case 'NONE':
      vector += 'N';
      break;
    case 'MULTIPLE_INSTANCES':
      vector += 'M';
      break;
    case 'SINGLE_INSTANCES':
      vector += 'S';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/C:';
  switch (confidentialityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'PARTIAL':
      vector += 'P';
      break;
    case 'COMPLETE':
      vector += 'C';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/I:';
  switch (integrityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'PARTIAL':
      vector += 'P';
      break;
    case 'COMPLETE':
      vector += 'C';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/A:';
  switch (availabilityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'PARTIAL':
      vector += 'P';
      break;
    case 'COMPLETE':
      vector += 'C';
      break;
    default:
      vector += 'ERROR';
  }
  return vector;

};

export const parseCvssBaseFromVector = vector => {
  if (!is_defined(vector)) {
    return {};
  }

  let av;
  let ac;
  let au;
  let c;
  let i;
  let a;

  const values = vector.split('/');

  for (const currentvalue of values) {
    let [metric, value] = currentvalue.split(':');

    metric = metric.toLowerCase();
    value = value.toLowerCase();

    switch (metric) {
      case 'av':
        if (value === 'l') {
          av = 'LOCAL';
        }
        else if (value === 'a') {
          av = 'ADJACENT_NETWORK';
        }
        else if (value === 'n') {
          av = 'NETWORK';
        }
        break;
      case 'ac':
        if (value === 'h') {
          ac = 'HIGH';
        }
        else if (value === 'm') {
          ac = 'MEDIUM';
        }
        else if (value === 'l') {
          ac = 'LOW';
        }
        break;
      case 'au':
        if (value === 'm') {
          au = 'MULTIPLE_INSTANCES';
        }
        else if (value === 's') {
          au = 'SINGLE_INSTANCES';
        }
        else if (value === 'n') {
          au = 'NONE';
        }
        break;
      case 'c':
        if (value === 'c') {
          c = 'COMPLETE';
        }
        else if (value === 'p') {
          c = 'PARTIAL';
        }
        else if (value === 'n') {
          c = 'NONE';
        }
        break;
      case 'i':
        if (value === 'c') {
          i = 'COMPLETE';
        }
        else if (value === 'p') {
          i = 'PARTIAL';
        }
        else if (value === 'n') {
          i = 'NONE';
        }
        break;
      case 'a':
        if (value === 'c') {
          a = 'COMPLETE';
        }
        else if (value === 'p') {
          a = 'PARTIAL';
        }
        else if (value === 'n') {
          a = 'NONE';
        }
        break;
      default:
        break;
    }
  }

  return {
    accessVector: av,
    accessComplexity: ac,
    authentication: au,
    confidentialityImpact: c,
    integrityImpact: i,
    availabilityImpact: a,
  };
};

/**
 * Parse date(time) from string
 *
 * @param {String} value Date as string to be parsed
 *
 * @returns {date} A date instance (Not a js Date!)
 */
export const parseDate = value => is_defined(value) ?
  date(value) : undefined;

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
  if (!is_defined(value)) {
    return undefined;
  }
  return duration(value, 'seconds');
};

// vim: set ts=2 sw=2 tw=80:
