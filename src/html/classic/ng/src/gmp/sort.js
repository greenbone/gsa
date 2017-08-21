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

function expand_ip(original) {
  if (!is_defined(original)) {
    return original;
  }

  let split = original.split('.');
  if (split.length === 4) {
    let ret = '';
    for (let i = 0; i < split.length; i++) {
      let number = parse_int(split[i]);

      if (number.toString() !== split[i] || number < 0 || number > 255) {
        return original;
      }
      else if (number < 10) {
        ret += '00' + number;
      }
      else if (number < 100) {
        ret += '0' + number;
      }
      else {
        ret += number;
      }

      if (i < split.length - 1) {
        ret += '.';
      }
    }
    return ret;
  }

  return original;
}

const get_value = (convert_func, value, property) =>
  convert_func(get_property(value, property));

const make_compare = convert_func => property => reverse => {
  const val_compare = reverse ? generic_compare_desc : generic_compare_asc;

  return (a, b) => val_compare(
    get_value(convert_func, a, property),
    get_value(convert_func, b, property)
  );
};

export const make_compare_string = make_compare(value => '' + value);

export const make_compare_number = make_compare(value => parse_float(value));

export const make_compare_date = make_compare(value => value);

export const make_compare_ip = make_compare(value => expand_ip(value));

// vim: set ts=2 sw=2 tw=80:
