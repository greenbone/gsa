/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined, is_empty, parse_float, map} from '../../utils.js';

import CollectionList from '../collectionlist.js';
import CollectionCounts from '../collectioncounts.js';

import Model from '../model.js';

import Filter from './filter.js';

export function parse_severity(value) {
  return is_empty(value) ? undefined : parse_float(value);
}

export function parse_text(text) {
  if (is_defined(text.__text)) {
    return {
      text: text.__text,
      text_excerpt: text.__excerpt,
    };
  }

  return {
    text,
    text_excerpt: '0',
  };
}

export function parse_counts(element, name, plural_name) {
  if (!is_defined(plural_name)) {
    plural_name = name + 's';
  }
  let es = element[plural_name];
  let ec = element[name + '_count'];
  return {
    first: es._start,
    rows: es._max,
    length: ec.page,
    all: ec.__text,
    filtered: ec.filtered,
  };
}

export function parse_filter(element) {
  return new Filter(element.filters);
}

export function parse_elements(response, name) {
  return response[name];
}

export function parse_entities(response, name, modelclass = Model) {
  return map(parse_elements(response, name),
    element => new modelclass(element));
}

export function parse_collection_counts(response, name, plural_name) {
  return new CollectionCounts(parse_counts(response, name, plural_name));
}

/**
 * Parse a {@link CollectionList} from a response object
 *
 * @param {Object} response       A response object e.g envelope.get_tasks_response
 * @param {String} name           The name of the property containing the entities
 * @param {Model}  modelclass     A Model class to use for creating the entities
 * @param {String} [plural_name]  (optional) plural name. Defaults to name + 's'
 *                                if undefined. Used to extract the collection
 *                                counts from the response object.
 *
 * @return {CollectionList}  A new CollectionList instance.
 */
export function parse_collection_list(response, name, modelclass, plural_name) {
  return new CollectionList({
    entries: parse_entities(response, name, modelclass),
    filter: parse_filter(response),
    counts: parse_collection_counts(response, name, plural_name),
  });
}

// vim: set ts=2 sw=2 tw=80:

