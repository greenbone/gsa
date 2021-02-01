/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import logger from '../log';

import {isArray, isDefined} from '../utils/identity';
import {map} from '../utils/array';

import Model from '../model';

import Filter from '../models/filter';

import CollectionCounts from './collectioncounts';

const log = logger.getLogger('gmp.collection.parser');

export function parseInfoEntities(response, name, modelclass, filter_func) {
  if (!isArray(response.info)) {
    return [];
  }
  return response.info
    .filter(filter_func)
    .map(info => modelclass.fromElement(info));
}

export function parseInfoCounts(response) {
  // this is really ugly and more of a kind of a hack
  //  we depend on the order of the array to be able to parse the counts
  //  this should be fixed in gmp xml by using a different elements for counts
  //  or by using the same pattern (with 's') for info

  const infos = response.info;
  // its getting even uglier... if no entities are returned we get a single info
  // element for start and max counts.
  let es = isArray(infos) ? infos[infos.length - 1] : infos;
  let ec = response.info_count;

  if (!isDefined(es)) {
    // houston we have a problem ...
    log.error(
      'No info found in response. Can not get correct counts.',
      response,
    );
    es = {
      _start: 0,
      _max: 0,
    };
  }

  if (!isDefined(ec)) {
    // houston we have another problem ...
    log.error(
      'No info_count found in response. Can not get correct counts.',
      response,
    );
    ec = {
      page: 0,
      __text: 0,
      filtered: 0,
    };
  }

  const counts = {
    first: es._start,
    rows: es._max,
    length: ec.page,
    all: ec.__text,
    filtered: ec.filtered,
  };
  return new CollectionCounts(counts);
}

export function parseFilter(element) {
  return Filter.fromElement(element.filters);
}

export function parseCounts(element, name, plural_name) {
  if (!isDefined(element)) {
    return {};
  }

  if (!isDefined(plural_name)) {
    plural_name = name + 's';
  }

  const es = element[plural_name];
  const ec = element[name + '_count'];

  if (isDefined(es) && isDefined(ec)) {
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }
  return {};
}

const parseElements = (response, name) =>
  isDefined(response) ? response[name] : undefined;

const parseEntities = (response, name, modelclass = Model) =>
  map(parseElements(response, name), element =>
    modelclass.fromElement(element),
  );

export const parseReportResultEntities = (response, name, modelclass) =>
  parseEntities(response.results, name, modelclass);

const parseCollectionCounts = (response, name, plural_name) =>
  new CollectionCounts(parseCounts(response, name, plural_name));

/**
 * Parse a {@link CollectionList} from a response object
 *
 * @param {Object} response       A response object e.g envelope.get_tasks_response
 * @param {String} name           The name of the property containing the entities
 * @param {Model}  modelclass     A Model class to use for creating the entities
 *
 * @param {Object} options        An object that contains several optional
 *                                values.
 *
 * @param {String} options.plural_name
 *
 *                                (optional) plural name. Defaults to name + 's'
 *                                if undefined. Used to extract the collection
 *                                counts from the response object.
 *
 * @param {Function} options.entities_parse_func
 *
 *                                (optional) Function to parse Model instances
 *                                from the response. Defaults to parse_entities
 *                                if undefined.
 *
 * @param {Function} options.collection_count_parse_func
 *
 *                                (optional) Function to parse a
 *                                CollectionCounts instance from the response.
 *                                Defaults to parse_collection_counts if
 *                                undefined.
 *
 * @param {Function} options.filter_parse_func
 *
 *                                Function to parse a Filter instance from the
 *                                response. Defaults to parse_filter if
 *                                undefined.
 *
 * @return {Object}  A new object containing the parsed entities, filter and
 *                   counts.
 */
export const parseCollectionList = (
  response,
  name,
  modelclass,
  options = {},
) => {
  const {
    plural_name,
    entities_parse_func = parseEntities,
    collection_count_parse_func = parseCollectionCounts,
    filter_parse_func = parseFilter,
  } = options;
  return {
    entities: entities_parse_func(response, name, modelclass),
    filter: filter_parse_func(response),
    counts: collection_count_parse_func(response, name, plural_name),
  };
};

// vim: set ts=2 sw=2 tw=80:
