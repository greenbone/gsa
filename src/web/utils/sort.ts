/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date} from 'gmp/models/date';
import {
  parseInt,
  parseFloat,
  type NumberValue,
  type NumberReturn,
} from 'gmp/parser';
import {isDefined, isFunction} from 'gmp/utils/identity';

type Comparable = string | number | boolean | bigint | Date | null | undefined;
type PropertySelector<TObject, TReturn> =
  keyof TObject | string | ((object: TObject) => TReturn);
type Compare<T> = (a: T, b: T) => number;
type CompareFactory<T> = (reverse?: boolean) => Compare<T>;

const genericCompareAsc = (a: Comparable, b: Comparable): number => {
  if (
    (a as number | string | bigint | boolean | Date) >
    (b as number | string | bigint | boolean | Date)
  ) {
    return +1;
  } else if (
    (b as number | string | bigint | boolean | Date) >
    (a as number | string | bigint | boolean | Date)
  ) {
    return -1;
  }
  return 0;
};

const genericCompareDesc = (a: Comparable, b: Comparable): number => {
  if (
    (a as number | string | bigint | boolean | Date) <
    (b as number | string | bigint | boolean | Date)
  ) {
    return +1;
  } else if (
    (b as number | string | bigint | boolean | Date) <
    (a as number | string | bigint | boolean | Date)
  ) {
    return -1;
  }
  return 0;
};

// export for testing only
export const getProperty = <T, TReturn>(
  object: T,
  property: PropertySelector<T, TReturn>,
): TReturn | undefined => {
  try {
    if (isFunction(property)) {
      return (property as (value: T) => TReturn)(object);
    }

    return (object as Record<string, TReturn>)[property as string];
  } catch {
    return undefined;
  }
};

// export for testing only
export const ipToNumber = (original?: string): number | string | undefined => {
  if (!isDefined(original)) {
    return undefined;
  }

  const split = original.split('.');
  if (split.length === 4) {
    // should be an ipv4 address
    let ret = 0;
    for (const item of split) {
      ret = ret * 256; // same as shift 8 bits left
      const number = parseInt(item);

      if (!isDefined(number)) {
        // wasn't a number. it's not an ip
        return original;
      }

      ret = ret + number;
    }
    return ret;
  }

  // TODO support ipv6

  return original; // use original value for comparison
};

// export for testing only
export const getValue = <TObject, TValue, TConverted extends Comparable>(
  convertFunc: (value: TValue) => TConverted,
  value: TObject,
  property: PropertySelector<TObject, TValue>,
  undefinedVal?: TConverted,
): TConverted | undefined => {
  const val = convertFunc(getProperty(value, property) as TValue);

  return isDefined(val) ? val : undefinedVal;
};

const makeCompare =
  <TValue, TConverted extends Comparable, TObject>(
    convertFunc: (value: TValue) => TConverted,
  ) =>
  (
    property: PropertySelector<TObject, TValue>,
    undefinedVal?: TConverted,
  ): CompareFactory<TObject> =>
  (reverse = false) => {
    const valCompare = reverse ? genericCompareDesc : genericCompareAsc;

    return (a: TObject, b: TObject): number =>
      valCompare(
        getValue(convertFunc, a, property, undefinedVal),
        getValue(convertFunc, b, property, undefinedVal),
      );
  };

export const makeCompareString = <TObject>(
  property: PropertySelector<TObject, string | undefined>,
  undefinedVal?: string,
): CompareFactory<TObject> =>
  makeCompare<string | undefined, string | undefined, TObject>(
    (value: string = '') => String(value),
  )(property, undefinedVal);

export const makeCompareNumber = <TObject>(
  property: PropertySelector<TObject, NumberValue>,
  undefinedVal?: number,
): CompareFactory<TObject> =>
  makeCompare<NumberValue, NumberReturn, TObject>(parseFloat)(
    property,
    undefinedVal,
  );

export const makeCompareDate = <TObject>(
  property: PropertySelector<TObject, Date | undefined>,
  undefinedVal?: Date,
): CompareFactory<TObject> =>
  makeCompare<Date | undefined, Date | undefined, TObject>(
    (value?: Date) => value,
  )(property, undefinedVal);

export const makeCompareIp = <TObject>(
  property: PropertySelector<TObject, string | undefined>,
  undefinedVal?: number,
): CompareFactory<TObject> =>
  makeCompare<string | undefined, number | string | undefined, TObject>(
    ipToNumber,
  )(property, undefinedVal);

export const makeComparePort = <TObject>(
  name: PropertySelector<TObject, string | number | undefined>,
): CompareFactory<TObject> =>
  makeCompare<string | number | undefined, number | undefined, TObject>(
    parseInt,
  )(name, -1);

export const makeCompareSeverity = <T = {severity?: string | number}>(
  name: PropertySelector<T, string | number | undefined> = 'severity',
): CompareFactory<T> => makeCompareNumber<T>(name, 0);
