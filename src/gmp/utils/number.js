/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
