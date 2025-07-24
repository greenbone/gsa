/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/CollectionCounts';
import {
  CollectionList,
  ModelClass,
  parseCollectionList,
} from 'gmp/collection/parser';
import GmpCommand, {
  BULK_SELECT_BY_IDS,
  BULK_SELECT_BY_FILTER,
  GmpCommandInputParams,
} from 'gmp/commands/gmp';
import {HttpCommandOptions, HttpCommandParams} from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response, {Meta} from 'gmp/http/response';
import DefaultTransform from 'gmp/http/transform/default';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import Filter, {ALL_FILTER} from 'gmp/models/filter';
import Model, {Element} from 'gmp/models/model';
import {map, forEach} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';

interface GetAggregatesSortParam {
  field: string;
  direction?: 'ascending' | 'descending';
  stat?: string;
}

interface GetAggregatesParams {
  dataColumns?: string[];
  textColumns?: string[];
  sort?: GetAggregatesSortParam[];
  aggregateMode?: string;
  maxGroups?: number;
  subgroupColumn?: string;
  [key: string]: unknown;
}

interface AggregateData {
  data_type: string;
  column_info: {
    aggregate_column: {
      column: string;
      data_type: 'unix_time' | 'integer' | 'text' | string;
      name: string;
      stat: string;
      type: string;
    };
  };
  group_column: string;
  group?: Array<{
    value: string | number;
    count: number;
    c_count: number;
    stats?: Array<{
      _column: string;
      c_sum: number;
      max: number;
      mean: number;
      min: number;
      sum: number;
    }>;
    text?: Array<{
      _column: string;
      __text: string;
    }>;
  }>;
}

interface GetAggregatesResponseData extends XmlResponseData {
  get_aggregate?: {
    get_aggregates_response: {
      aggregate: AggregateData;
    };
  };
}

interface Stats {
  c_sum: number;
  max: number;
  mean: number;
  min: number;
  sum: number;
}

interface Group {
  stats?: Record<string, Stats>;
  text?: Record<string, string>;
  value: string | number;
  count: number;
  c_count: number;
}

interface TransformedAggregatesResponseData {
  groups: Group[];
}

interface EntitiesMeta extends Meta {
  filter: Filter;
  counts: CollectionCounts;
}

abstract class EntitiesCommand<
  TModel extends Model,
  TEntitiesResponse extends Element = Element,
  TRoot extends Element = Element,
> extends GmpCommand {
  readonly clazz: ModelClass<Model>;
  readonly name: string;

  constructor(http: GmpHttp, name: string, clazz: ModelClass<Model>) {
    super(http, {cmd: 'get_' + name + 's'});

    this.clazz = clazz;
    this.name = name;
  }

  abstract getEntitiesResponse(root: TRoot): TEntitiesResponse;

  getCollectionListFromRoot(root: TRoot): CollectionList<TModel> {
    const response = this.getEntitiesResponse(root);
    return parseCollectionList<TModel>(
      response,
      this.name,
      this.clazz as ModelClass<TModel>,
    );
  }

  async get(params: GmpCommandInputParams, options?: HttpCommandOptions) {
    const response = await this.httpGet(params, options);
    const {entities, filter, counts} = this.getCollectionListFromRoot(
      response.data as TRoot,
    );
    return response.set<TModel[], EntitiesMeta>(entities, {filter, counts});
  }

  getAll(params: GmpCommandInputParams = {}, options?: HttpCommandOptions) {
    const {filter} = params;
    if (!isDefined(filter)) {
      params.filter = ALL_FILTER;
    } else if (isString(filter)) {
      params.filter = Filter.fromString(filter).all();
    } else {
      params.filter = (filter as Filter).all();
    }
    return this.get(params, options);
  }

  export(entities: TModel[]) {
    return this.exportByIds(
      map<TModel, string>(entities, entity => entity.id as string),
    );
  }

  exportByIds(ids: string[]) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_IDS,
    };
    for (const id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params, {
      transform: DefaultTransform,
    } as HttpCommandOptions);
  }

  exportByFilter(filter: Filter) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_FILTER,
      filter,
    };
    return this.httpPost(params, {
      transform: DefaultTransform,
    } as HttpCommandOptions);
  }

  async delete(entities: TModel[], extraParams?: HttpCommandParams) {
    const response = await this.deleteByIds(
      map(entities, (entity: Model) => entity.id as string),
      extraParams,
    );
    return response.setData(entities);
  }

  async deleteByIds(
    ids: string[],
    extraParams: HttpCommandParams = {},
  ): Promise<Response<string[], XmlMeta>> {
    const params = {
      ...extraParams,
      cmd: 'bulk_delete',
      resource_type: this.name,
    };
    for (const id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    const response = await this.httpPost(params);
    return response.setData(ids);
  }

  async deleteByFilter(filter: Filter, extraParams?: HttpCommandParams) {
    // FIXME change gmp to allow deletion by filter
    const response = await this.get({filter});
    const deleted = response.data;
    const deleteResponse = await this.delete(deleted, extraParams);
    return deleteResponse.setData(deleted);
  }

  transformAggregates(response: Response<GetAggregatesResponseData, XmlMeta>) {
    const {data} = response;
    if (!data.get_aggregate) {
      throw new Error('Invalid response: get_aggregate not found');
    }
    const {aggregate} = data.get_aggregate.get_aggregates_response;

    // ensure groups is always an array
    const {group: groups = []} = aggregate;

    const newGroups = map(groups, group => {
      const {stats, text, value, count, c_count} = group;

      const newGroup: Group = {
        value,
        count,
        c_count,
      };

      if (isDefined(text)) {
        const newText = {};
        forEach(text, t => {
          const name = t._column;
          const value = t.__text;
          newText[name] = value;
        });
        newGroup.text = newText;
      }
      if (isDefined(stats)) {
        const newStats = {};
        forEach(stats, s => {
          const name = s._column;
          const nStat: Stats = {
            c_sum: s.c_sum,
            max: s.max,
            mean: s.mean,
            min: s.min,
            sum: s.sum,
          };
          newStats[name] = nStat;
        });
        newGroup.stats = newStats;
      }

      return newGroup;
    });

    const ret: TransformedAggregatesResponseData = {
      groups: newGroups,
    };

    return response.setData(ret);
  }

  async getAggregates({
    dataColumns = [],
    textColumns = [],
    sort = [],
    aggregateMode,
    maxGroups,
    subgroupColumn,
    ...params
  }: GetAggregatesParams = {}) {
    const requestParams: Record<string, string> = {};

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
      requestParams.max_groups = String(maxGroups);
    }

    if (isDefined(subgroupColumn)) {
      requestParams.subgroup_column = subgroupColumn;
    }

    const response = await this.httpGet({
      ...requestParams,
      ...params,
      cmd: 'get_aggregate',
    });
    return this.transformAggregates(response);
  }
}

export default EntitiesCommand;
