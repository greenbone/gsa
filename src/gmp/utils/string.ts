/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isString} from 'gmp/utils/identity';

/**
 * Capitalizes the first letter of a given string.
 *
 * @param value - The string to capitalize.
 * @returns The string with the first letter capitalized.
 */
export const capitalizeFirstLetter = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Shortens a given text to a specified length, appending '...' if the text exceeds the length.
 *
 * @param text - The text to be shortened.
 * @param length - The maximum length of the shortened text.
 * @returns The shortened text.
 */
export const shorten = (text: string = '', length: number = 60): string => {
  if (!isString(text)) {
    text = String(text);
  }

  if (text.length < length) {
    return text;
  }

  return text.substring(0, length) + '...';
};

/**
 * Split a string into several terms
 *
 * Example usage: split('abc_def_hij', '_', 1) => ['abc', 'def_hij']
 *
 * @param string     String to split
 * @param separator  String to search for splitting
 * @param limit      Split only limit times
 *
 * @returns Split String as an array
 */
export const split = (
  string: string,
  separator: string,
  limit?: number,
): string[] => {
  if (isDefined(limit) && limit <= 0) {
    return [string];
  }

  const splits = string.split(separator, limit);

  const left = string.replace(splits.join(separator), '');
  if (left.trim().length > 0) {
    splits.push(left.slice(1));
  }

  return splits;
};

/**
 * Checks if a given value is empty.
 *
 * A value is considered empty if it is either undefined or it is a string and
 * has a length of 0.
 *
 * @param value - The value to check.
 * @returns - Returns true if the value is empty, otherwise false.
 */
export const isEmpty = (value?: string | number): boolean =>
  !isDefined(value) || (isString(value) && value.length === 0);
