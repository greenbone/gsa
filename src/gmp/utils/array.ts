/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isDefined, isArray} from 'gmp/utils/identity';

export const forEach = <T>(
  array?: T[],
  func?: (value: T, index: number, array: T[]) => void,
) => {
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

export function map<T, U>(
  array: T | T[] | null | undefined,
  func: (value: T, index: number, array: T[]) => U,
  empty: U[] = [],
): U[] {
  if (!hasValue(array) || !isDefined(func)) {
    return empty;
  }

  if (isDefined(array.map)) {
    return array.map(func);
  }

  if (isDefined(array.forEach)) {
    // support array like objects e.g. Set and Map
    const result: U[] = [];

    array.forEach((entry: T, index: number, values: T[]) =>
      result.push(func(entry, index, values)),
    );

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

export function filter<T extends {}>(
  array: T | T[] | null | undefined,
  func: (value: T, index: number, array: T[]) => boolean,
  empty: T[] = [],
): T[] {
  if (!hasValue(array) || !isDefined(func)) {
    return empty;
  }
  if (!isDefined((array as T[]).filter)) {
    array = [array as T];
  }
  return (array as T[]).filter(func);
}

export function first<T extends {}, U extends {}>(
  array: T[] | undefined,
  // @ts-expect-error
  non: U = {},
): T | U {
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

  // @ts-expect-error
  const {value, done} = array[Symbol.iterator]().next(); // returns array[0]
  return done ? non : value; // done is true for empty iterables
}

export const arraysEqual = <T, U>(arr1: T[], arr2: U[]) => {
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
    // @ts-expect-error
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};
