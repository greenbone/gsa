/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {is_defined} from '../../utils/identity';
import {is_empty} from '../../utils/string';

import {parse_int} from '../../parser.js';

const convert_boolean_int = (keyword, value, relation) => {
  return {
    keyword,
    value:
    parse_int(value) >= 1 ? 1 : 0,
    relation,
  };
};

function convert_int(keyword, value, relation) {
  return {
    keyword,
    value: parse_int(value),
    relation,
  };
}

function convert_no_relation(keyword, value, relation) {
  return {
    keyword,
    value,
  };
}

const convert_no_relation_and_keyword = (keyword, value, relation) => ({value});

const KEYWORD_CONVERTERS = {
  apply_overrides: convert_boolean_int,
  autofp: convert_int,
  first: convert_int,
  min_qod: convert_int,
  notes: convert_boolean_int,
  overrides: convert_boolean_int,
  result_hosts_only: convert_boolean_int,
  rows: convert_int,
};

const VALUE_CONVERTERS = {
  and: convert_no_relation_and_keyword,
  or: convert_no_relation_and_keyword,
  not: convert_no_relation_and_keyword,
  re: convert_no_relation,
  regexp: convert_no_relation,
  '': convert_no_relation,
};

const convert = (keyword, value, relation) => {
  let converter = KEYWORD_CONVERTERS[keyword];
  if (is_defined(converter)) {
    return converter(keyword, value, relation);
  }

  converter = VALUE_CONVERTERS[value];
  if (is_defined(converter)) {
    return converter(keyword, value, relation);
  }

  if (is_empty(keyword)) {
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
