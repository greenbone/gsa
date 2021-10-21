/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {isDefined} from './identity';

/**
 * Formats a Number to a fixed number of digits to appear after the decimal
 * point.
 *
 * Hint: The number is rounded and the fractional part is padded with zeros if
 * necessary
 *
 * @param {Number} value A Number value to format
 * @param {Number} digits Number of digest after the decimal point
 *
 * @returns {String} Formatted Number
 */
export const fixedValue = (value, digits) =>
  isDefined(digits) ? value.toFixed(digits) : '' + value;

/**
 * Formats a Number to a Severity value
 *
 * @param {Number} severity Number to format as severity
 *
 * @returns {String} Formatted Severity
 */
export const severityValue = severity => fixedValue(severity, 1);

// vim: set ts=2 sw=2 tw=80:
