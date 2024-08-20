/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isString} from './identity';

export const capitalizeFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const shorten = (text = '', length = 60) => {
  if (!isString(text)) {
    text = `${text}`;
  }

  if (text.length < length) {
    return text;
  }

  return text.substr(0, length) + '...';
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

export const isEmpty = string => !isDefined(string) || string.length === 0;

// vim: set ts=2 sw=2 tw=80:
