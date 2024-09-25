/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const {isArray} = global.Array;

export const isDefined = value => value !== undefined;

export const hasValue = value => value !== null && value !== undefined;

export const isObject = value => value !== null && typeof value === 'object';

export const isString = value => typeof value === 'string';

export const isNull = value => value === null;

export const isNumber = value => typeof value === 'number';

export const isNumberOrNumberString = (value, parseFunc) =>
  !isNaN(parseFunc(value));

export const isFunction = value => typeof value === 'function';

export const isJsDate = value =>
  Object.prototype.toString.call(value) === '[object Date]';

export const isModelElement = elem =>
  isDefined(elem) && isString(elem._id) && elem._id.length > 0;

// vim: set ts=2 sw=2 tw=80:
