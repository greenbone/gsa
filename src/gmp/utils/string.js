/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isString} from './identity';

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} string - The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
export const capitalizeFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Shortens a given text to a specified length, appending '...' if the text exceeds the length.
 *
 * @param {string} [text=''] - The text to be shortened.
 * @param {number} [length=60] - The maximum length of the shortened text.
 * @returns {string} - The shortened text.
 */
export const shorten = (text = '', length = 60) => {
  if (!isString(text)) {
    text = `${text}`;
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
 * @param {String} string     String to split
 * @param {String} separator  String to search for splitting
 * @param {Number} limit      Split only limit times
 *
 * @returns {Array} Split String as an array
 */
export const split = (string, separator, limit) => {
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
 * Checks if a given string is empty.
 *
 * A string is considered empty if it is either undefined or has a length of 0.
 *
 * @param {string} string - The string to check.
 * @returns {boolean} - Returns true if the string is empty, otherwise false.
 */
export const isEmpty = string => !isDefined(string) || string.length === 0;
