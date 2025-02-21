/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collectioncounts';
import {parseCollectionList} from 'gmp/collection/parser';
import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import logger from 'gmp/log';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';


const log = logger.getLogger('gmp.commands.filters');

class FilterCommand extends EntityCommand {
  constructor(http) {
    super(http, 'filter', Filter);
  }

  create(args) {
    const {term, name, type, comment = ''} = args;
    const data = {
      cmd: 'create_filter',
      term,
      name,
      resource_type: type,
      comment,
    };
    log.debug('Creating new filter', args, data);
    return this.action(data);
  }

  save(args) {
    const {id, term, name, type, comment = ''} = args;
    const data = {
      cmd: 'save_filter',
      comment,
      id,
      name,
      resource_type: type,
      term,
    };
    log.debug('Saving filter', args, data);
    return this.action(data);
  }

  getElementFromRoot(root) {
    return root.get_filter.get_filters_response.filter;
  }
}

// FIXME parsing counts is horrible

const parseFilter = element => {
  const filter =
    isDefined(element) && isDefined(element.filters)
      ? element.filters[0]
      : undefined;
  return Filter.fromElement(filter);
};

const parse_counts = element => {
  if (
    isDefined(element) &&
    isDefined(element.filters) &&
    isDefined(element.filter_count)
  ) {
    const es = element.filters[1];
    const ec = element.filter_count;
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }
  return {};
};

const parse_collection_counts = response => {
  return new CollectionCounts(parse_counts(response));
};

class FiltersCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'filter', Filter);
  }

  getEntitiesResponse(root) {
    return root.get_filters.get_filters_response;
  }

  getCollectionListFromRoot(root, meta) {
    const response = this.getEntitiesResponse(root);
    return parseCollectionList(response, this.name, this.clazz, {
      meta,
      filter_parse_func: parseFilter,
      collection_count_parse_func: parse_collection_counts,
    });
  }
}

export default FiltersCommand;

registerCommand('filter', FilterCommand);
registerCommand('filters', FiltersCommand);
