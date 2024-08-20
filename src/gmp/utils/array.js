/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isDefined, isArray} from './identity';

export const forEach = (array, func) => {
  if (!hasValue(array) || !isDefined(func)) {
    return;
  }

  if (isDefined(array.forEach)) {
    array.forEach(func);
    return;
  }

  if (!isArray(array)) {
    array = [array];
  }
  array.forEach(func);
};

export function map(array, func, empty = []) {
  if (!hasValue(array) || !isDefined(func)) {
    return empty;
  }

  if (isDefined(array.map)) {
    return array.map(func);
  }

  if (isDefined(array.forEach)) {
    // support array like objects e.g. Set and Map
    const result = [];

    array.forEach(entry => result.push(func(entry)));

    if (result.length === 0) {
      return empty;
    }
    return result;
  }

  if (!isArray(array)) {
    array = [array];
  }
  return array.map(func);
}

export function filter(array, func, empty = []) {
  if (!hasValue(array) || !isDefined(func)) {
    return empty;
  }
  if (!isDefined(array.filter)) {
    array = [array];
  }
  return array.filter(func);
}

export function first(array, non = {}) {
  if (isArray(array)) {
    if (array.length === 0) {
      return non;
    }

    return array[0];
  }

  if (!isDefined(array)) {
    return non;
  }

  // support array like objects which have an iterator
  if (!isDefined(array[Symbol.iterator])) {
    // not an array like object
    return non;
  }

  const {value, done} = array[Symbol.iterator]().next(); // returns array[0]
  return done ? non : value; // done is true for empty iterables
}

export const arraysEqual = (arr1, arr2) => {
  if (Object.is(arr1, arr2)) {
    return true;
  }

  if (!isArray(arr1) || !isArray(arr2)) {
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
};

// vim: set ts=2 sw=2 tw=80:
