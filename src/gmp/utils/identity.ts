/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const {isArray} = Array;

export const isDefined = <T>(value: T | undefined): value is T & ({} | null) =>
  value !== undefined;

export const hasValue = (value: unknown): value is {} =>
  value !== null && value !== undefined;

export const isObject = <T>(value: T): value is T & object =>
  value !== null && typeof value === 'object';

export const isString = <T>(value: T): value is T & string =>
  typeof value === 'string';

export const isNull = (value: unknown): value is null => value === null;

export const isNumber = <T>(value: T): value is T & number =>
  typeof value === 'number';

export const isNumberOrNumberString = <T>(
  value: T,
  parseFunc: (value: T) => number | undefined,
): boolean => {
  const parseValue = parseFunc(value);
  return isDefined(parseValue) && !isNaN(parseValue);
};

export const isFunction = (value: unknown): value is Function =>
  typeof value === 'function';

export const isJsDate = <T>(value: T): value is T & Date =>
  Object.prototype.toString.call(value) === '[object Date]';

export const isModelElement = <T>(elem: T): elem is T & {_id: string} => {
  return (
    isDefined(elem) &&
    isString((elem as {_id?: string})._id) &&
    (elem as {_id: string})._id.length > 0
  );
};
