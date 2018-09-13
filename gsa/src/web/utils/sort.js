/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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
import logger from 'gmp/log';

import {parseInt, parseFloat} from 'gmp/parser';

import {isDefined, isFunction} from 'gmp/utils/identity';

const log = logger.getLogger('web.utils.sort');

const genericCompareAsc = (a, b) => {
  if (a > b) {
    return +1;
  }
  else if (b > a) {
    return -1;
  }
  return 0;
};

const genericCompareDesc = (a, b) => {
  if (a < b) {
    return +1;
  }
  else if (b < a) {
    return -1;
  }
  return 0;
};

const getProperty = (object, property) => {
  try {
    if (isFunction(property)) {
      return property(object);
    }

    return object[property];
  }
  catch (err) {
    log.error('Could not get property', property, object);
    return undefined;
  }
};

export const ipToNumber = original => {
  if (!isDefined(original)) {
    return undefined;
  }

  const split = original.split('.');
  if (split.length === 4) { // should be an ipv4 address
    let ret = 0;
    for (const item of split) {
      ret = ret << 8; // eslint-disable-line no-bitwise
      const number = parseInt(item);

      if (!isDefined(number)) { // wasn't a number. it's not an ip
        return original;
      }

      ret = ret | number; // eslint-disable-line no-bitwise
    }
    return ret;
  }

  // TODO support ipv6

  return original; // use original value for comparison
};

const getValue = (convertFunc, value, property, undefinedVal) => {
  const val = convertFunc(getProperty(value, property));

  return isDefined(val) ? val : undefinedVal;
};

const makeCompare = convertFunc => (property, undefinedVal) => reverse => {
  const valCompare = reverse ? genericCompareDesc : genericCompareAsc;

  return (a, b) => valCompare(
    getValue(convertFunc, a, property, undefinedVal),
    getValue(convertFunc, b, property, undefinedVal),
  );
};

export const makeCompareString = makeCompare(value => '' + value);

export const makeCompareNumber = makeCompare(parseFloat);

export const makeCompareDate = makeCompare(value => value);

export const makeCompareIp = makeCompare(ipToNumber);

export const makeCompareSeverity = (name = 'severity') =>
  makeCompareNumber(name, 0);

// vim: set ts=2 sw=2 tw=80:
