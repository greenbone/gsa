/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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

function genericCompareAsc(a_val, b_val) {
  if (a_val > b_val) {
    return +1;
  }
  else if (b_val > a_val) {
    return -1;
  }
  return 0;
}

function genericCompareDesc(a_val, b_val) {
  if (a_val < b_val) {
    return +1;
  }
  else if (b_val < a_val) {
    return -1;
  }
  return 0;
}

function getProperty(object, property) {
  if (property instanceof Array) {
    let ret = object;
    for (let i = 0; i < property.length; i++) {
      ret = ret[property[i]];
    }
    return ret;
  }

  return object[property];
}

function expand_ip(original) {
  let split = original.split('.');
  if (split.length === 4) {
    let ret = '';
    for (let i = 0; i < split.length; i++) {
      let number = Number(split[i]);

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

export function makeCompareSelection(makeCompareFunct, property) {
  return {
    'sort': makeCompareFunct(property, false),
    'sort-reverse': makeCompareFunct(property, true),
  };
}

export function makeCompareString(property, reverse) {
  var val_compare = reverse ? genericCompareDesc : genericCompareAsc;
  return function (a, b) {
    let a_val = getProperty(a, property).toString();
    let b_val = getProperty(b, property).toString();
    return val_compare(a_val, b_val);
  };
}

export function makeCompareNumber(property, reverse) {
  var val_compare = reverse ? genericCompareDesc : genericCompareAsc;
  return function (a, b) {
    let a_val = Number(getProperty(a, property));
    let b_val = Number(getProperty(b, property));
    return val_compare(a_val, b_val);
  };
}

export function makeCompareDate(property, reverse) {
  var val_compare = reverse ? genericCompareDesc : genericCompareAsc;
  return function (a, b) {
    let a_val = Date.parse(getProperty(a, property));
    let b_val = Date.parse(getProperty(b, property));
    return val_compare(a_val, b_val);
  };
}

export function makeCompareIP(property, reverse) {
  var val_compare = reverse ? genericCompareDesc : genericCompareAsc;
  return function (a, b) {
    let a_val = expand_ip(getProperty(a, property));
    let b_val = expand_ip(getProperty(b, property));
    return val_compare(a_val, b_val);
  };
}
