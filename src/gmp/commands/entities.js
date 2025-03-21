/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseCollectionList} from 'gmp/collection/parser';
import GmpCommand, {BULK_SELECT_BY_IDS, BULK_SELECT_BY_FILTER} from 'gmp/commands/gmp';
import DefaultTransform from 'gmp/http/transform/default';
import logger from 'gmp/log';
import Filter, {ALL_FILTER} from 'gmp/models/filter';
import {map, forEach} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';


const log = logger.getLogger('gmp.commands.entities');

class EntitiesCommand extends GmpCommand {
  constructor(http, name, clazz) {
    super(http, {cmd: 'get_' + name + 's'});

    this.clazz = clazz;
    this.name = name;
  }

  getCollectionListFromRoot(root) {
    const response = this.getEntitiesResponse(root);
    return parseCollectionList(response, this.name, this.clazz);
  }

  getEntitiesResponse(root) {
    log.warn('getEntitiesResponse not implemented in', this.constructor.name);
    return root;
  }

  get(params, options) {
    return this.httpGet(params, options).then(response => {
      const {entities, filter, counts} = this.getCollectionListFromRoot(
        response.data,
      );
      return response.set(entities, {filter, counts});
    });
  }

  getAll(params = {}, options) {
    const {filter} = params;
    if (!isDefined(filter)) {
      params.filter = ALL_FILTER;
    } else if (isString(filter)) {
      params.filter = Filter.fromString(filter).all();
    } else {
      params.filter = filter.all();
    }
    return this.get(params, options);
  }

  export(entities) {
    return this.exportByIds(map(entities, entity => entity.id));
  }

  exportByIds(ids) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_IDS,
    };
    for (const id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params, {transform: DefaultTransform});
  }

  exportByFilter(filter) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_FILTER,
      filter,
    };
    return this.httpPost(params, {transform: DefaultTransform});
  }

  delete(entities, extraParams) {
    return this.deleteByIds(
      map(entities, entity => entity.id),
      extraParams,
    ).then(response => response.setData(entities));
  }

  deleteByIds(ids, extraParams = {}) {
    const params = {
      ...extraParams,
      cmd: 'bulk_delete',
      resource_type: this.name,
    };
    for (const id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params).then(response => response.setData(ids));
  }

  deleteByFilter(filter, extraParams) {
    // FIXME change gmp to allow deletion by filter
    let deleted;
    return this.get({filter})
      .then(entities => {
        deleted = entities.data;
        return this.delete(deleted, extraParams);
      })
      .then(response => response.setData(deleted));
  }

  transformAggregates(response) {
    const {aggregate} = response.data.get_aggregate.get_aggregates_response;

    const ret = {
      ...aggregate,
    };

    // ensure groups is always an array
    const {group: groups = []} = aggregate;

    ret.groups = map(groups, group => {
      const {stats, text} = group;

      const newGroup = {
        ...group,
      };

      if (isDefined(text)) {
        newGroup.text = {};

        forEach(text, t => {
          const name = t._column;
          const value = t.__text;
          newGroup.text[name] = value;
        });
      }
      if (isDefined(stats)) {
        newGroup.stats = {};

        forEach(stats, s => {
          const name = s._column;
          const nStat = {...s};
          delete nStat._column;
          newGroup.stats[name] = nStat;
        });
      }

      return newGroup;
    });

    delete ret.group;

    return response.setData(ret);
  }

  getAggregates({
    dataColumns = [],
    textColumns = [],
    sort = [],
    aggregateMode,
    maxGroups,
    subgroupColumn,
    ...params
  } = {}) {
    const requestParams = {};

    dataColumns.forEach(
      (column, i) => (requestParams[`data_columns:${i}`] = column),
    );

    textColumns.forEach(
      (column, i) => (requestParams[`text_columns:${i}`] = column),
    );

    sort.forEach(({field, direction = 'ascending', stat = 'value'}, i) => {
      requestParams[`sort_fields:${i}`] = field;
      requestParams[`sort_orders:${i}`] = direction;
      requestParams[`sort_stats:${i}`] = stat;
    });

    if (isDefined(aggregateMode)) {
      requestParams.aggregate_mode = aggregateMode;
    }

    if (isDefined(maxGroups)) {
      requestParams.max_groups = maxGroups;
    }

    if (isDefined(subgroupColumn)) {
      requestParams.subgroup_column = subgroupColumn;
    }

    return this.httpGet({
      ...requestParams,
      ...params,
      cmd: 'get_aggregate',
    }).then(this.transformAggregates);
  }
}

export default EntitiesCommand;
