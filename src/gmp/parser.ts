/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import createDate, {Date as GmpDate, duration} from 'gmp/models/date';
import {isDefined, isString, isNumber, isArray} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export interface TextElement {
  __text?: string | number;
  _excerpt?: string | number;
}

export interface QoDParams {
  type?: string;
  value?: string | number;
}

export interface QoD {
  type?: string;
  value?: number;
}

export type Properties = Record<string, unknown>;

type NumberValue = string | number | undefined;
type NumberReturn = undefined | number;
type BooleanValue = NumberValue | boolean;

export type YesNo = typeof YES_VALUE | typeof NO_VALUE;

const isText = (value: unknown): value is TextElement =>
  typeof value === 'object' && value !== null && '__text' in value;

export const parseProgressElement = (
  value?: string | number | undefined | TextElement,
) => {
  if (!isDefined(value)) {
    return 0;
  }

  if (isText(value)) {
    value = value.__text;
  }

  const progress = parseFloat(value);
  return isDefined(progress) ? progress : 0;
};

export const parseText = (
  text?: TextElement | string | number | undefined,
): string | undefined => {
  if (isText(text)) {
    text = text.__text;
  }
  return parseToString(text);
};

export const parseTextElement = (text?: string | number | TextElement) => {
  if (isText(text)) {
    return {
      text: parseToString(text.__text),
      textExcerpt: isDefined(text._excerpt)
        ? parseYesNo(text._excerpt)
        : undefined,
    };
  }

  return {
    text: parseToString(text),
  };
};

export const parseInt = (value?: NumberValue): NumberReturn => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (!/^(-|\+)?([0-9.]+)$/.test(value as string)) {
    return undefined;
  }

  const val = global.parseInt(value as string, 10);

  if (isNaN(val)) {
    return undefined;
  }

  return val;
};

export const parseFloat = (value: NumberValue): NumberReturn => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (!/^(-|\+)?([0-9.]+)$/.test(value as string)) {
    return undefined;
  }

  const val = global.parseFloat(value as string);

  if (isNaN(val)) {
    return undefined;
  }

  return val;
};

export const parseSeverity = parseFloat;

export const parseIntoArray = <T>(value: T | Array<T>): Array<T> =>
  isArray(value) ? value : [value];

export const YES_VALUE = 1;
export const NO_VALUE = 0;

export const parseYesNo = (value?: string | number): YesNo =>
  value === '1' || value === 1 ? YES_VALUE : NO_VALUE;

export const parseYes = (value: string): YesNo => {
  return value === 'yes' ? YES_VALUE : NO_VALUE;
};

export const parseCsv = (value: string | number = ''): string[] => {
  if (!isString(value)) {
    value = String(value);
  }

  return isEmpty(value.trim()) ? [] : value.split(',').map(val => val.trim());
};

export const parseQod = ({value, type}: QoDParams): QoD => ({
  type: parseToString(type),
  value: parseFloat(value),
});

const esc2xml = {
  '&quot;': `"`,
  '&apos;': `'`,
  '&amp;': `&`,
  '&lt;': `<`,
  '&gt;': `>`,
  '&#x2F;': `/`,
  '&#x5C;': `\\`,
} as const;

export const parseXmlEncodedString = (value: string) =>
  value.replace(
    /(&quot;|&lt;|&gt;|&amp;|&apos;|&#x2F;|&#x5C;)/g,
    (str, symbol) => esc2xml[symbol],
  );

export const setProperties = <P extends Properties, T>(
  properties?: P,
  object: T = {} as T,
  {writable = false} = {},
): P & T => {
  if (isDefined(properties)) {
    for (const [key, value] of Object.entries(properties)) {
      if (!key.startsWith('_')) {
        Object.defineProperty(object, key, {
          value,
          writable,
          enumerable: true,
        });
      }
    }
  }
  return object as P & T;
};

/**
 * Parse date(time) from string
 *
 * @param value Date as string to be parsed
 *
 * @returns A date instance (Not a js Date!)
 */
export const parseDate = (
  value?: string | GmpDate | Date | undefined,
): GmpDate | undefined => (isDefined(value) ? createDate(value) : undefined);

/**
 * Parse duration from string or integer
 *
 * @param value Duration as string or int in seconds.
 *
 * @returns duration A duration instance
 */
export const parseDuration = (value: NumberValue) => {
  if (isString(value)) {
    value = parseInt(value);
  }
  if (!isDefined(value)) {
    return undefined;
  }
  return duration(value, 'seconds');
};

/**
 * Parse Numbers, Number Strings and Boolean to Boolean
 *
 * Number Strings are converted to Numbers by using the parseInt function.
 * A Number is considered true if the value is not equal zero.
 * All other values are compared against true.
 *
 * @param value Value to convert to boolean
 *
 * @returns true if value is considered true else false
 */
export const parseBoolean = (value?: BooleanValue): boolean => {
  if (isString(value)) {
    if (value.trim().toLowerCase() === 'true') return true;
    value = parseInt(value);
  }
  if (isNumber(value)) {
    return value !== 0;
  }
  return value === true;
};

/**
 * Parses the given value into a string if it is defined.
 *
 * @param value - The value to be parsed into a string.
 * @returns The parsed string if the value is defined, otherwise undefined.
 */
export const parseToString = (value?: unknown): string | undefined => {
  if (isDefined(value)) {
    return isEmpty(value as string) ? undefined : String(value);
  }
  return undefined;
};
