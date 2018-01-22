/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/array/includes';
import 'core-js/fn/object/assign';
import 'core-js/fn/object/keys';
import 'core-js/fn/symbol';

export const is_array = Array.isArray;

export function is_defined(value) {
  return value !== undefined;
}

export function has_value(value) {
  return value !== null && is_defined(value);
}

export function is_object(value) {
  return value !== null && typeof value === 'object';
}

export function is_string(value) {
  return typeof value === 'string';
}

export function is_number(value) {
  return typeof value === 'number';
}

export function is_function(value) {
  return typeof value === 'function';
}

export function is_empty(value) {
  if (!has_value(value)) {
    return true;
  }
  if (is_string(value)) {
    return value.trim().length === 0;
  }

  if (is_defined(value.length)) {
    return value.length === 0;
  }
  return false;
}

export function is_date(value) {
  return Object.prototype.toString.call(value) === '[object Date]';
}

export const is_model_element = elem => is_defined(elem) && !is_empty(elem._id);

export function includes(array, value) {
  if (!Array.prototype.includes) {
    return array.indexOf(value) !== -1;
  }
  return array.includes(value);
}

export function for_each(array, func) {
  if (!has_value(array)) {
    return;
  }

  if (is_defined(array.forEach)) {
    array.forEach(func);
    return;
  }

  if (!is_array(array)) {
    array = [array];
  }
  array.forEach(func);
}

export function map(array, func, empty = []) {
  if (!has_value(array) || !is_defined(func)) {
    return empty;
  }

  if (is_defined(array.map)) {
    return array.map(func);
  }

  if (is_defined(array.forEach)) { // support array like objects e.g. Set and Map
    const result = [];

    array.forEach(entry => result.push(func(entry)));

    if (result.length === 0) {
      return empty;
    }
    return result;
  }

  if (!is_array(array)) {
    array = [array];
  }
  return array.map(func);
}

export function filter(array, func, empty = []) {
  if (!has_value(array) || !is_defined(func)) {
    return empty;
  }
  if (!is_defined(array.filter)) {
    array = [array];
  }
  return array.filter(func);
};

export const KeyCode = {
  ESC: 27,
  BACKSPACE: 8,
  COMMA: 188,
  DELETE: 46,
  DOWN: 40,
  END: 35,
  ENTER: 13,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  PERIOD: 190,
  RIGHT: 39,
  SPACE: 32,
  TAB: 9,
  UP: 38,
  SUBTRACT: 109,
  MINUS: 173,
};

export function classes(...args) {
  const css = [];
  for (const arg of args) {
    if (is_array(arg)) {
      css.push(classes(...arg));
    }
    else if (is_string(arg) || is_number(arg)) {
      css.push(arg);
    }
  }
  return css.join(' ');
}

export function first(array, non = {}) {
  if (is_empty(array)) {
    return non;
  }

  if (is_array(array)) {
    return array[0];
  }

  // support array like objects which have an iterator
  if (!is_defined(array[Symbol.iterator])) { // not an array like object
    return non;
  }

  return array[Symbol.iterator]().next().value; // returns array[0]
}

export function includes_id(list, id) {
  for (const value of list) {
    if (value.id === id) {
      return true;
    }
  }
  return false;
}

export function select_save_id(list, id, empty_default) {
  if (is_empty(id) || !includes_id(list, id)) {
    if (!is_defined(empty_default)) {
      return first(list).id;
    }
    return empty_default;
  }
  return id;
}

export function capitalize_first_letter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const pluralize_type = type => type[type.length - 1] === 's' ||
  type === 'info' || type === 'version' ? type : type + 's';

export function shorten(text, length = 60) {
  if (!is_defined(text)) {
    return '';
  }

  if (text.length < length) {
    return text;
  }

  return text.substr(0, length) + '...';

}

export function exclude(object, func) {
  return Object.keys(object)
    .filter(key => !func(key))
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
}

export const exclude_object_props = (object, exclude_array) =>
  exclude(object, key => includes(exclude_array, key));

export function split(string, seperator, limit) {
  // split('abc_def_hij', 1) => ['abc', 'def_hij']
  const splits = string.split(seperator, limit);

  const left = string.replace(splits.join(seperator), '');
  if (left.trim().length > 0) {
    splits.push(left.slice(1));
  }

  return splits;
}

export function debounce(func, wait, immediate = false) {
  let timeout;
  return function(...args) {
    const context = this;
    const later = () => {
      timeout = undefined;
      func.apply(context, args);
    };
    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Calculate the sum of an Array
 *
 * @param {Array}    array  Array to calculate sum from
 * @param {Function} getter Function for getting a value from array. Optional.
 *
 * @returns {Number} Sum of the array
 */
export const sum = (array = [], getter) =>
  array.reduce((total, value) => {
    const val = is_defined(getter) ? getter(value) : value;
    return total + (is_defined(val) ? val : 0);
  }, 0);

/**
 * Calculate the average of an Array
 *
 * @param {Array} array Array to calculate the average from
 * @param {Function} getter Function for getting a value from array. Optional.
 *
 * @returns {Number} Average of the array
 */
export const avg = (array = [], getter) => {
  if (array.length === 0) {
    return 0;
  }
  return sum(array, getter) / array.length;
};

export function arrays_equal(arr1, arr2) {
  if (Object.is(arr1, arr2)) {
    return true;
  }

  if (!is_array(arr1) || !is_array(arr2)) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

// vim: set ts=2 sw=2 tw=80:
