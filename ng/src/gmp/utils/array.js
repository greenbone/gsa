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
import 'core-js/fn/symbol';

import {has_value, is_defined, is_array} from './identity';

export function for_each(array, func) {
  if (!has_value(array) || !is_defined(func)) {
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

export const is_empty = array => !is_defined(array) || array.length === 0;

export function first(array, non = {}) {
  if (is_array(array)) {

    if (array.length === 0) {
      return non;
    }

    return array[0];
  }

  // support array like objects which have an iterator
  if (!is_defined(array[Symbol.iterator])) { // not an array like object
    return non;
  }

  const {value, done} = array[Symbol.iterator]().next(); // returns array[0]
  return done ? non : value; // done is true for empty iterables
}

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
