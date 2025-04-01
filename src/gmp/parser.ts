/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import createDate, {Date as GmpDate, duration} from 'gmp/models/date';
import {isDefined, isString, isNumber, isArray} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface Text {
  __text: string;
  __excerpt: string;
}

interface QoDParam {
  type: string;
  value: string;
}

interface QoD {
  type: string;
  value: number | undefined;
}

interface Meta {
  version: string | undefined;
  backendOperation: string | undefined;
  vendorVersion: string | undefined;
  i18n: string | undefined;
  time: string | undefined;
  timezone: string | undefined;
}

interface ObjectWithParsedProperties {
  id?: string;
  creationTime?: GmpDate;
  modificationTime?: GmpDate;
  _type?: string;
  [key: string]: unknown;
}

type NumberValue = string | number | undefined;
type NumberReturn = undefined | number;
type BooleanValue = NumberValue | boolean;

export const parseSeverity = (value: undefined | string) =>
  isEmpty(value) ? undefined : parseFloat(value);

const isText = (value: unknown): value is Text =>
  typeof value === 'object' && value !== null && '__text' in value;

export const parseProgressElement = (value: string | undefined | Text) => {
  if (!isDefined(value)) {
    return 0;
  }

  if (isText(value)) {
    value = value.__text;
  }

  const progress = parseFloat(value);
  return isDefined(progress) ? progress : 0;
};

export const parseText = (text: Text | string): string => {
  if (isText(text)) {
    text = text.__text;
  }
  return text;
};

export const parseTextElement = (text: string | object = {}) => {
  if (isText(text)) {
    return {
      text: text.__text,
      textExcerpt: text.__excerpt,
    };
  }

  return {
    text,
    textExcerpt: '0',
  };
};

export const parseInt = (value: NumberValue): NumberReturn => {
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

export const parseIntoArray = <T>(value: T | Array<T>): Array<T> =>
  isArray(value) ? value : [value];

export const YES_VALUE = 1;
export const NO_VALUE = 0;

type YesNo = typeof YES_VALUE | typeof NO_VALUE;

export const parseYesNo = (value: string | number): YesNo =>
  value === '1' || value === 1 ? YES_VALUE : NO_VALUE;

export const parseYes = (value: string): YesNo => {
  return value === 'yes' ? YES_VALUE : NO_VALUE;
};

export const parseCsv = (value: string = ''): string[] => {
  if (!isString(value)) {
    value = `${value}`;
  }

  return isEmpty(value.trim()) ? [] : value.split(',').map(val => val.trim());
};

export const parseQod = (qod: QoDParam): QoD => ({
  type: qod.type,
  value: parseFloat(qod.value),
});

const ENVELOPE_PROPS = [
  ['version', 'version'],
  ['backend_operation', 'backendOperation'],
  ['vendor_version', 'vendorVersion'],
  ['i18n', 'i18n'],
  ['time', 'time'],
  ['timezone', 'timezone'],
] as const;

export const parseEnvelopeMeta = (envelope: object): Meta => {
  const meta = {};

  for (const [name, to] of ENVELOPE_PROPS) {
    meta[to] = envelope[name];
    delete envelope[name];
  }
  // @ts-expect-error
  return meta;
};

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

export const parseProperties = (
  element = {},
  object = {},
): ObjectWithParsedProperties => {
  const copy = {...object, ...element}; // create shallow copy

  if ('_id' in element && isString(element._id) && element._id.length > 0) {
    // only set id if it id defined
    // @ts-expect-error
    copy.id = element._id;
  }

  if ('creation_time' in element && isDefined(element.creation_time)) {
    // @ts-expect-error
    copy.creationTime = parseDate(element.creation_time);
    // @ts-expect-error
    delete copy.creation_time;
  }
  if ('modification_time' in element && isDefined(element.modification_time)) {
    // @ts-expect-error
    copy.modificationTime = parseDate(element.modification_time);
    // @ts-expect-error
    delete copy.modification_time;
  }

  if ('type' in copy && isDefined(copy.type)) {
    // type should not be used directly
    // @ts-expect-error
    copy._type = copy.type;
    delete copy.type;
  }

  return copy;
};

export const setProperties = (
  properties: object | undefined,
  object: object = {},
  {writable = false} = {},
) => {
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
  return object;
};

/**
 * Parse date(time) from string
 *
 * @param {String} value Date as string to be parsed
 *
 * @returns {date} A date instance (Not a js Date!)
 */
export const parseDate = (
  value: string | GmpDate | Date | undefined,
): GmpDate | undefined => (isDefined(value) ? createDate(value) : undefined);

/**
 * Parse duration from string or integer
 *
 * @param {string|int} value Duration as string or int in seconds.
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
 * @param {string|number|boolean} value Value to convert to boolean
 *
 * @returns true if value is considered true else false
 */
export const parseBoolean = (value: BooleanValue): boolean => {
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
 * @param {*} value - The value to be parsed into a string.
 * @returns {string|undefined} The parsed string if the value is defined, otherwise undefined.
 */
export const parseToString = (value: unknown): string | undefined => {
  if (isDefined(value)) {
    return String(value);
  }
  return undefined;
};
