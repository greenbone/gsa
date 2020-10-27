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

import {isDefined, isString, isNumber, isArray} from './utils/identity';
import {isEmpty} from './utils/string';

import date, {duration} from './models/date';

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
    return text.__text;
  }
  return text;
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
  value === '1' || value === 1 || value === true ? YES_VALUE : NO_VALUE;

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

export const parseCvssV2BaseVector = ({
  accessComplexity,
  accessVector,
  authentication,
  availabilityImpact,
  confidentialityImpact,
  integrityImpact,
} = {}) => {
  if (
    !isDefined(accessVector) &&
    !isDefined(accessComplexity) &&
    !isDefined(authentication) &&
    !isDefined(confidentialityImpact) &&
    !isDefined(integrityImpact) &&
    !isDefined(availabilityImpact)
  ) {
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
    case 'SINGLE_INSTANCE':
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

export const parseCvssV3BaseVector = ({
  attackVector,
  attackComplexity,
  privilegesRequired,
  userInteraction,
  scope,
  confidentialityImpact,
  integrityImpact,
  availabilityImpact,
} = {}) => {
  if (
    !isDefined(attackVector) &&
    !isDefined(attackComplexity) &&
    !isDefined(privilegesRequired) &&
    !isDefined(userInteraction) &&
    !isDefined(scope) &&
    !isDefined(confidentialityImpact) &&
    !isDefined(integrityImpact) &&
    !isDefined(availabilityImpact)
  ) {
    return undefined;
  }

  let vector = 'AV:';

  switch (attackVector) {
    case 'LOCAL':
      vector += 'L';
      break;
    case 'NETWORK':
      vector += 'N';
      break;
    case 'ADJACENT_NETWORK':
      vector += 'A';
      break;
    case 'PHYSICAL':
      vector += 'P';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/AC:';
  switch (attackComplexity) {
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/PR:';
  switch (privilegesRequired) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/UI:';
  switch (userInteraction) {
    case 'NONE':
      vector += 'N';
      break;
    case 'REQUIRED':
      vector += 'R';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/S:';
  switch (scope) {
    case 'UNCHANGED':
      vector += 'U';
      break;
    case 'CHANGED':
      vector += 'C';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/C:';
  switch (confidentialityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/I:';
  switch (integrityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }

  vector += '/A:';
  switch (availabilityImpact) {
    case 'NONE':
      vector += 'N';
      break;
    case 'LOW':
      vector += 'L';
      break;
    case 'HIGH':
      vector += 'H';
      break;
    default:
      vector += 'ERROR';
  }
  return vector;
};

export const parseCvssV2BaseFromVector = vector => {
  if (!isDefined(vector) || vector.trim().length === 0) {
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
    value = isDefined(value) ? value.toLowerCase() : '';

    switch (metric) {
      case 'av':
        if (value === 'l') {
          av = 'LOCAL';
        } else if (value === 'a') {
          av = 'ADJACENT_NETWORK';
        } else if (value === 'n') {
          av = 'NETWORK';
        }
        break;
      case 'ac':
        if (value === 'h') {
          ac = 'HIGH';
        } else if (value === 'm') {
          ac = 'MEDIUM';
        } else if (value === 'l') {
          ac = 'LOW';
        }
        break;
      case 'au':
        if (value === 'm') {
          au = 'MULTIPLE_INSTANCES';
        } else if (value === 's') {
          au = 'SINGLE_INSTANCE';
        } else if (value === 'n') {
          au = 'NONE';
        }
        break;
      case 'c':
        if (value === 'c') {
          c = 'COMPLETE';
        } else if (value === 'p') {
          c = 'PARTIAL';
        } else if (value === 'n') {
          c = 'NONE';
        }
        break;
      case 'i':
        if (value === 'c') {
          i = 'COMPLETE';
        } else if (value === 'p') {
          i = 'PARTIAL';
        } else if (value === 'n') {
          i = 'NONE';
        }
        break;
      case 'a':
        if (value === 'c') {
          a = 'COMPLETE';
        } else if (value === 'p') {
          a = 'PARTIAL';
        } else if (value === 'n') {
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

export const parseCvssV3BaseFromVector = vector => {
  if (!isDefined(vector) || vector.trim().length === 0) {
    return {};
  }

  let av;
  let ac;
  let pr;
  let ui;
  let s;
  let c;
  let i;
  let a;

  const values = vector.split('/');

  for (const currentvalue of values) {
    let [metric, value] = currentvalue.split(':');

    metric = metric.toLowerCase();
    value = isDefined(value) ? value.toLowerCase() : '';

    switch (metric) {
      case 'av':
        if (value === 'l') {
          av = 'LOCAL';
        } else if (value === 'a') {
          av = 'ADJACENT_NETWORK';
        } else if (value === 'n') {
          av = 'NETWORK';
        } else if (value === 'p') {
          av = 'PHYSICAL';
        }
        break;
      case 'ac':
        if (value === 'h') {
          ac = 'HIGH';
        } else if (value === 'l') {
          ac = 'LOW';
        }
        break;
      case 'pr':
        if (value === 'h') {
          pr = 'HIGH';
        } else if (value === 'l') {
          pr = 'LOW';
        } else if (value === 'n') {
          pr = 'NONE';
        }
        break;
      case 'ui':
        if (value === 'r') {
          ui = 'REQUIRED';
        } else if (value === 'n') {
          ui = 'NONE';
        }
        break;
      case 's':
        if (value === 'u') {
          s = 'UNCHANGED';
        } else if (value === 'c') {
          s = 'CHANGED';
        }
        break;
      case 'c':
        if (value === 'h') {
          c = 'HIGH';
        } else if (value === 'l') {
          c = 'LOW';
        } else if (value === 'n') {
          c = 'NONE';
        }
        break;
      case 'i':
        if (value === 'h') {
          i = 'HIGH';
        } else if (value === 'l') {
          i = 'LOW';
        } else if (value === 'n') {
          i = 'NONE';
        }
        break;
      case 'a':
        if (value === 'h') {
          a = 'HIGH';
        } else if (value === 'l') {
          a = 'LOW';
        } else if (value === 'n') {
          a = 'NONE';
        }
        break;
      default:
        break;
    }
  }

  return {
    attackVector: av,
    attackComplexity: ac,
    privilegesRequired: pr,
    userInteraction: ui,
    scope: s,
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
