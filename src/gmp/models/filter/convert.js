/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseFloat} from '../../parser';
import {isDefined, isNumberOrNumberString} from '../../utils/identity';
import {isEmpty} from '../../utils/string';

const convertBooleanInt = (keyword, value, relation) => ({
  keyword,
  value: parseInt(value) >= 1 ? 1 : 0,
  relation,
});

const convertInt = (keyword, value, relation) => ({
  keyword,
  value: parseInt(value),
  relation,
});

const convertFirst = (keyword, value, relation) => {
  const intValue = parseInt(value);
  return {
    keyword,
    value: intValue > 0 ? intValue : 1,
    relation: '=',
  };
};

const convertRows = (keyword, value, relation) =>
  convertInt(keyword, value, '=');

const convertNoRelation = (keyword, value, relation) => ({
  keyword,
  value,
});

const convertNoRelationAndKeyword = (keyword, value, relation) => ({value});

const KEYWORD_CONVERTERS = {
  apply_overrides: convertBooleanInt,
  first: convertFirst,
  min_qod: convertInt,
  notes: convertBooleanInt,
  overrides: convertBooleanInt,
  result_hosts_only: convertBooleanInt,
  rows: convertRows,
};

const VALUE_CONVERTERS = {
  and: convertNoRelationAndKeyword,
  or: convertNoRelationAndKeyword,
  not: convertNoRelationAndKeyword,
  re: convertNoRelation,
  regexp: convertNoRelation,
  '': convertNoRelation,
};

const convert = (keyword, value, relation) => {
  let converter = KEYWORD_CONVERTERS[keyword];

  if (isDefined(converter)) {
    return converter(keyword, value, relation);
  }

  converter = VALUE_CONVERTERS[value];
  if (isDefined(converter)) {
    return converter(keyword, value, relation);
  }

  if (isEmpty(keyword)) {
    return {value, relation};
  }

  if (isNumberOrNumberString(keyword, parseFloat)) {
    return {value: `"${keyword}${relation}${value}"`, relation: '~'};
  }

  return {
    value,
    keyword,
    relation,
  };
};

export default convert;
