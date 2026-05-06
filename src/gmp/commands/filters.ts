/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {type CollectionList, parseCollectionList} from 'gmp/collection/parser';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import Filter, {type FilterModelElement} from 'gmp/models/filter';
import type {Element} from 'gmp/models/model';
import {resourceType, type EntityType} from 'gmp/utils/entity-type';
import {isArray, isDefined} from 'gmp/utils/identity';

interface FilterCountElement {
  page?: number;
  __text?: number;
  filtered?: number;
}

interface FilterPaginationElement {
  _start?: number;
  _max?: number;
}

interface FiltersResponseElement extends Element {
  filters?: Array<FilterModelElement | FilterPaginationElement>;
  filter_count?: FilterCountElement;
}

interface GetFilterResponseData extends XmlResponseData {
  get_filter?: {
    get_filters_response?: {
      filter?: FilterModelElement;
    };
  };
}

interface GetFiltersResponseData extends XmlResponseData {
  get_filters?: {
    get_filters_response?: FiltersResponseElement;
  };
}

const log = logger.getLogger('gmp.commands.filters');

export class FilterCommand extends EntityCommand<Filter, FilterModelElement> {
  constructor(http: Http) {
    super(http, 'filter', Filter);
  }

  create(args: {
    term: string;
    name: string;
    type: EntityType;
    comment?: string;
  }) {
    const {term, name, type, comment = ''} = args;
    const data = {
      cmd: 'create_filter',
      term,
      name,
      resource_type: resourceType(type),
      comment,
    };
    log.debug('Creating new filter', args, data);
    return this.action(data);
  }

  save(args: {
    id: string;
    term: string;
    name: string;
    type: EntityType;
    comment?: string;
  }) {
    const {id, term, name, type, comment = ''} = args;
    const data = {
      cmd: 'save_filter',
      comment,
      id,
      name,
      resource_type: resourceType(type),
      term,
    };
    log.debug('Saving filter', args, data);
    return this.action(data);
  }

  getElementFromRoot(root: XmlResponseData): FilterModelElement {
    return (
      (root as GetFilterResponseData).get_filter?.get_filters_response
        ?.filter ?? ({} as FilterModelElement)
    );
  }
}

const isPaginationElement = (
  value: unknown,
): value is FilterPaginationElement => {
  return (
    isDefined(value) &&
    typeof value === 'object' &&
    value !== null &&
    ('_start' in value || '_max' in value)
  );
};

const parseFilterFromResponse = (element: FiltersResponseElement): Filter => {
  const firstFilter =
    isDefined(element.filters) && isArray(element.filters)
      ? element.filters[0]
      : undefined;

  return isDefined(firstFilter) && !isPaginationElement(firstFilter)
    ? Filter.fromElement(firstFilter)
    : Filter.fromElement();
};

const parseCollectionCountsFromResponse = (
  element: FiltersResponseElement,
): CollectionCounts => {
  if (!isArray(element.filters) || !isDefined(element.filter_count)) {
    return new CollectionCounts();
  }

  const pagination = element.filters[1];
  const counts = element.filter_count;
  const first = isPaginationElement(pagination) ? pagination._start : undefined;
  const rows = isPaginationElement(pagination) ? pagination._max : undefined;

  return new CollectionCounts({
    first,
    rows,
    length: counts.page,
    all: counts.__text,
    filtered: counts.filtered,
  });
};

export class FiltersCommand extends EntitiesCommand<Filter> {
  constructor(http: Http) {
    super(http, 'filter', Filter);
  }

  getEntitiesResponse(root: XmlResponseData): FiltersResponseElement {
    return (
      (root as GetFiltersResponseData).get_filters?.get_filters_response ?? {}
    );
  }

  getCollectionListFromRoot(root: XmlResponseData): CollectionList<Filter> {
    const response = this.getEntitiesResponse(root);
    const {entities} = parseCollectionList(response, this.name, this.clazz);
    return {
      entities,
      filter: parseFilterFromResponse(response),
      counts: parseCollectionCountsFromResponse(response),
    };
  }
}
