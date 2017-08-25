/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from './log.js';

import {is_defined, is_function} from './utils.js';

import {parse_int, parse_float} from './parser.js';

const log = logger.getLogger('gmp.sort');

function generic_compare_asc(a_val, b_val) {
  if (a_val > b_val) {
    return +1;
  }
  else if (b_val > a_val) {
    return -1;
  }
  return 0;
}

function generic_compare_desc(a_val, b_val) {
  if (a_val < b_val) {
    return +1;
  }
  else if (b_val < a_val) {
    return -1;
  }
  return 0;
}

function get_property(object, property) {
  try {
    if (is_function(property)) {
      return property(object);
    }

    return object[property];
  }
  catch (err) {
    log.error('Could not get property', property, object);
    return undefined;
  }
}

const ip_to_number = original => {
  if (!is_defined(original)) {
    return undefined;
  }

  const split = original.split('.');
  if (split.length === 4) { // should be an ipv4 address
    let ret = 0;
    for (const item of split) {
      ret = ret << 8; // eslint-disable-line no-bitwise
      const number = parse_int(item);

      if (!is_defined(number)) { // wasn't a number. it's not an ip
        return original;
      }

      ret = ret | number; // eslint-disable-line no-bitwise
    }
    return ret;
  }

  // TODO support ipv6

  return original; // use original value for comparision
};

const get_value = (convert_func, value, property, undefined_val) => {
  const val = convert_func(get_property(value, property));

  return is_defined(val) ? val : undefined_val;
};

const make_compare = convert_func => (property, undefined_val) => reverse => {
  const val_compare = reverse ? generic_compare_desc : generic_compare_asc;

  return (a, b) => val_compare(
    get_value(convert_func, a, property, undefined_val),
    get_value(convert_func, b, property, undefined_val),
  );
};

export const make_compare_plain = make_compare(value => value);

export const make_compare_string = make_compare(value => '' + value);

export const make_compare_number = make_compare(parse_float);

export const make_compare_date = make_compare_plain;

export const make_compare_ip = make_compare(ip_to_number);

// vim: set ts=2 sw=2 tw=80:
