/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts, {
  type CollectionCountsOptions,
} from 'gmp/collection/CollectionCounts';
import logger from 'gmp/log';
import Filter, {type FilterModelElement} from 'gmp/models/filter';
import Model, {type Element} from 'gmp/models/model';
import {map} from 'gmp/utils/array';
import {hasValue, isArray, isDefined} from 'gmp/utils/identity';

export interface ModelClass<TModel> {
  fromElement(element: unknown, type?: string): TModel;
}

export interface CollectionList<TModel> {
  entities: TModel[];
  filter: Filter;
  counts: CollectionCounts;
}

interface ParseCollectionListOptions<TModel extends Model, TElement = Element> {
  pluralName?: string;
  entitiesParseFunc?: (
    element: TElement,
    name: string,
    modelClass: ModelClass<TModel>,
  ) => TModel[];
  collectionCountParseFunc?: (
    element: TElement,
    name: string,
    pluralName?: string,
  ) => CollectionCounts;
  filterParseFunc?: (element: FilterElement) => Filter;
}

interface InfoElement {
  info?: Element[];
}

interface ResourceElement {
  type?: string;
}

interface ResultsElement {
  results: unknown;
}

interface FilterElement {
  filters?: FilterModelElement;
}

interface ElementStart {
  _start?: number;
  _max?: number;
}

interface ElementCounts {
  page?: number;
  __text?: number;
  filtered?: number;
}

interface InfoWithCounts extends InfoElement {
  info_count?: ElementCounts;
}

const log = logger.getLogger('gmp.collection.parser');

export function parseInfoEntities<TModel extends Model>(
  response: InfoElement,
  _name: string,
  modelClass: ModelClass<TModel>,
  filterFunc: (value: Element, index: number, array: Element[]) => boolean,
) {
  if (!isArray(response.info)) {
    return [];
  }
  return response.info
    .filter(filterFunc)
    .map(info => modelClass.fromElement(info));
}

export function parseResourceNamesEntities<TModel extends Model>(
  response: ResourceElement,
  name: string,
  modelClass: ModelClass<TModel>,
) {
  const type = isDefined(response.type) ? response.type : '';
  return map(parseElements(response as Element, name), element =>
    modelClass.fromElement(element, type),
  );
}

export function parseInfoCounts(response: InfoWithCounts) {
  // this is really ugly and more of a kind of a hack
  //  we depend on the order of the array to be able to parse the counts
  //  this should be fixed in gmp xml by using a different elements for counts
  //  or by using the same pattern (with 's') for info

  const infos = response.info;
  // its getting even uglier... if no entities are returned we get a single info
  // element for start and max counts.
  let es = (isArray(infos) ? infos[infos.length - 1] : infos) as ElementStart;
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

export function parseFilter(element: FilterElement): Filter {
  return Filter.fromElement(element.filters);
}

export function parseCounts<TElement = Element>(
  element: TElement,
  name: string,
  pluralName?: string,
): CollectionCountsOptions {
  if (!isDefined(element)) {
    return {};
  }

  if (!isDefined(pluralName)) {
    pluralName = name + 's';
  }

  const es = hasValue(element)
    ? (element[pluralName] as ElementStart)
    : undefined;
  const ec = hasValue(element)
    ? (element[name + '_count'] as ElementCounts)
    : undefined;

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

const parseElements = <TElement = Element>(
  response: TElement | undefined,
  name: string,
): TElement | TElement[] | undefined =>
  hasValue(response)
    ? (response[name] as TElement | TElement[] | undefined)
    : undefined;

const parseEntities = <TModel extends Model = Model, TElement = Element>(
  element: TElement,
  name: string,
  modelClass: ModelClass<TModel> = Model as unknown as ModelClass<TModel>,
) => {
  return map(parseElements(element, name), (element: TElement) =>
    modelClass.fromElement(element),
  );
};

export const parseReportResultEntities = <
  TModel extends Model,
  TElement extends ResultsElement = ResultsElement,
>(
  response: TElement,
  name: string,
  modelClass: ModelClass<TModel>,
) =>
  parseEntities<TModel, TElement>(
    response.results as TElement,
    name,
    modelClass,
  );

const parseCollectionCounts = <TElement = Element>(
  element: TElement,
  name: string,
  pluralName?: string,
) => new CollectionCounts(parseCounts(element, name, pluralName));

/**
 * Parse a CollectionList from a response object
 *
 * @param element       A response object e.g envelope.get_tasks_response
 * @param name           The name of the property containing the entities
 * @param modelClass     A Model class to use for creating the entities
 *
 * @param options        An object that contains several optional values.
 *
 * @param options.plural_name
 *
 *        (optional) plural name. Defaults to name + 's'
 *        if undefined. Used to extract the collection
 *        counts from the response object.
 *
 * @param options.entities_parse_func
 *
 *        (optional) Function to parse Model instances
 *        from the response. Defaults to parse_entities
 *        if undefined.
 *
 * @param options.collection_count_parse_func
 *
 *        (optional) Function to parse a
 *        CollectionCounts instance from the response.
 *        Defaults to parse_collection_counts if
 *        undefined.
 *
 * @param options.filter_parse_func
 *
 *        Function to parse a Filter instance from the
 *        response. Defaults to parse_filter if
 *        undefined.
 *
 * @return A new object containing the parsed entities, filter and counts.
 */
export const parseCollectionList = <TModel extends Model, TElement = Element>(
  element: TElement,
  name: string,
  modelClass: ModelClass<TModel>,
  {
    pluralName,
    entitiesParseFunc = parseEntities<TModel, TElement>,
    collectionCountParseFunc = parseCollectionCounts,
    filterParseFunc = parseFilter,
  }: ParseCollectionListOptions<TModel, TElement> = {},
): CollectionList<TModel> => {
  return {
    entities: entitiesParseFunc(element, name, modelClass),
    filter: filterParseFunc(element as FilterElement),
    counts: collectionCountParseFunc(element, name, pluralName),
  };
};
