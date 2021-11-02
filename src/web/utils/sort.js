/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {parseInt, parseFloat} from 'gmp/parser';

import {isDefined, isFunction} from 'gmp/utils/identity';

const genericCompareAsc = (a, b) => {
  if (a > b) {
    return +1;
  } else if (b > a) {
    return -1;
  }
  return 0;
};

const genericCompareDesc = (a, b) => {
  if (a < b) {
    return +1;
  } else if (b < a) {
    return -1;
  }
  return 0;
};

// export for testing only
export const getProperty = (object, property) => {
  try {
    if (isFunction(property)) {
      return property(object);
    }

    return object[property];
  } catch (err) {
    return undefined;
  }
};

// export for testing only
export const ipToNumber = original => {
  if (!isDefined(original)) {
    return undefined;
  }

  const split = original.split('.');
  if (split.length === 4) {
    // should be an ipv4 address
    let ret = 0;
    for (const item of split) {
      ret = ret * 256; // same as shift 8 bits left
      const number = parseInt(item);

      if (!isDefined(number)) {
        // wasn't a number. it's not an ip
        return original;
      }

      ret = ret + number;
    }
    return ret;
  }

  // TODO support ipv6

  return original; // use original value for comparison
};

// export for testing only
export const getValue = (convertFunc, value, property, undefinedVal) => {
  const val = convertFunc(getProperty(value, property));

  return isDefined(val) ? val : undefinedVal;
};

const makeCompare = convertFunc => (property, undefinedVal) => (
  reverse = false,
) => {
  const valCompare = reverse ? genericCompareDesc : genericCompareAsc;

  return (a, b) =>
    valCompare(
      getValue(convertFunc, a, property, undefinedVal),
      getValue(convertFunc, b, property, undefinedVal),
    );
};

export const makeCompareString = makeCompare((value = '') => '' + value);

export const makeCompareNumber = makeCompare(parseFloat);

export const makeCompareDate = makeCompare(value => value);

export const makeCompareIp = makeCompare(ipToNumber);

export const makeComparePort = name => makeCompare(parseInt)(name, -1);

export const makeCompareSeverity = (name = 'severity') =>
  makeCompareNumber(name, 0);

// vim: set ts=2 sw=2 tw=80:
