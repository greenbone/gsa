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
import {is_defined} from './identity';

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

/**
 * Split a string into several terms
 *
 * Example usage: split('abc_def_hij', '_', 1) => ['abc', 'def_hij']
 *
 * @param {String} string     String to split
 * @param {String} separator  String to search for splitting
 * @param {Number} limit      Split only limit times
 *
 * @returns {Array} Splitted String as an array
 */
export function split(string, separator, limit) {
  if (is_defined(limit) && limit <= 0) {
    return [string];
  }

  const splits = string.split(separator, limit);

  const left = string.replace(splits.join(separator), '');
  if (left.trim().length > 0) {
    splits.push(left.slice(1));
  }

  return splits;
}

export const is_empty = string => !is_defined(string) || string.length === 0;

// vim: set ts=2 sw=2 tw=80:
