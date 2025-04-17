/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

type NumberValue = string | number | undefined;

/**
 * Formats a Number to a fixed number of digits to appear after the decimal
 * point.
 *
 * Hint: The number is rounded and the fractional part is padded with zeros if
 * necessary
 *
 * @param value A Number value to format
 * @param digits Number of digest after the decimal point
 *
 * @returns Formatted Number
 */
const fixedValue = (value: NumberValue, digits: number): string | undefined => {
  const parsedValue = parseFloat(value);

  return isDefined(parsedValue) ? parsedValue.toFixed(digits) : undefined;
};

/**
 * Formats a Number to a Severity value
 *
 * @param severity Number to format as severity
 *
 * @returns Formatted Severity
 */
export const severityValue = (severity: NumberValue): string | undefined =>
  fixedValue(severity, 1);
