/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseFloat} from 'gmp/parser';
import {isDefined, isNumberOrNumberString, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export interface FilterTermObject {
  keyword?: string;
  value?: string | number;
  relation?: string;
}

type ConvertKeyword = string | undefined;
type ConvertValue = string | number | undefined;
type ConvertRelation = string | undefined;

type ConvertFunc = (
  keyword: ConvertKeyword,
  value: ConvertValue,
  relation: ConvertRelation,
) => FilterTermObject;

const convertBooleanInt = (
  keyword: ConvertKeyword,
  value: ConvertValue,
  relation: ConvertRelation,
): FilterTermObject => {
  const intValue = parseInt(value);
  return {
    keyword,
    value: intValue && intValue >= 1 ? 1 : 0,
    relation,
  };
};

const convertInt = (
  keyword: ConvertKeyword,
  value: ConvertValue,
  relation: ConvertRelation,
): FilterTermObject => ({
  keyword,
  value: parseInt(value),
  relation,
});

const convertFirst = (
  keyword: ConvertKeyword,
  value: ConvertValue,
): FilterTermObject => {
  const intValue = parseInt(value);
  return {
    keyword,
    value: intValue && intValue > 0 ? intValue : 1,
    relation: '=',
  };
};

const convertRows = (
  keyword: ConvertKeyword,
  value: ConvertValue,
): FilterTermObject => convertInt(keyword, value, '=');

const convertString = (
  keyword: ConvertKeyword,
  value: ConvertValue,
  relation: ConvertRelation,
): FilterTermObject => ({
  keyword,
  value: !isEmpty(value) ? String(value) : undefined,
  relation,
});

const convertNoRelation = (
  keyword: ConvertKeyword,
  value: ConvertValue,
): FilterTermObject => ({
  keyword,
  value,
});

const convertNoRelationAndKeyword = (
  keyword: ConvertKeyword,
  value: ConvertValue,
): FilterTermObject => ({
  value,
});

const KEYWORD_CONVERTERS: Record<string, ConvertFunc> = {
  apply_overrides: convertBooleanInt,
  first: convertFirst,
  min_qod: convertInt,
  notes: convertBooleanInt,
  overrides: convertBooleanInt,
  result_hosts_only: convertBooleanInt,
  rows: convertRows,
  name: convertString,
};

const VALUE_CONVERTERS = {
  and: convertNoRelationAndKeyword,
  or: convertNoRelationAndKeyword,
  not: convertNoRelationAndKeyword,
  re: convertNoRelation,
  regexp: convertNoRelation,
  '': convertNoRelation,
};

const convert = (
  keyword: ConvertKeyword,
  value: ConvertValue,
  relation: ConvertRelation,
): FilterTermObject => {
  let converter = isDefined(keyword) ? KEYWORD_CONVERTERS[keyword] : undefined;

  if (!isDefined(converter)) {
    converter = isDefined(value) ? VALUE_CONVERTERS[value] : undefined;
  }

  if (isDefined(converter)) {
    return converter(keyword, value, relation);
  }

  if (isString(keyword) && isEmpty(keyword)) {
    return {value: isDefined(value) ? String(value) : undefined, relation};
  }

  if (isNumberOrNumberString(keyword, parseFloat)) {
    return {value: `"${keyword}${relation}${value}"`, relation: '~'};
  }

  return {
    value: isDefined(value) ? String(value) : undefined,
    keyword,
    relation,
  };
};

export default convert;
