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

// vim: set ts=2 sw=2 tw=80:
