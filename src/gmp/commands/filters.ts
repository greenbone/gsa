/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {type CollectionList, parseCollectionList} from 'gmp/collection/parser';
import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import Filter, {type FilterModelElement} from 'gmp/models/filter';
import type {Element} from 'gmp/models/model';
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

interface GetFiltersResponseData extends XmlResponseData {
  get_filters?: {
    get_filters_response?: FiltersResponseElement;
  };
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

export default FiltersCommand;
