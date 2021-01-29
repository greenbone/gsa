/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import {parseInt} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

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

  return {
    value,
    keyword,
    relation,
  };
};

export default convert;

// vim: set ts=2 sw=2 tw=80:
