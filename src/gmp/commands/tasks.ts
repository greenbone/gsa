/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/CollectionCounts';
import EntitiesCommand from 'gmp/commands/entities';
import {type HttpCommandOptions} from 'gmp/commands/http';
import type GmpHttp from 'gmp/http/gmp';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import Task, {type TaskElement} from 'gmp/models/task';
import {type YesNo} from 'gmp/parser';

interface GetTasksResponse extends Element {
  apply_overrides: YesNo;
  task: TaskElement | TaskElement[];
  filters: Filter;
  sort: {
    field: {
      __text: string;
      order: 'ascending' | 'descending';
    };
  };
  task_count: {
    __text: number;
    _filtered: number;
    _page: number;
  };
  tasks: {
    _start: number;
    _max: number;
  };
}

interface TasksCommandWithFilterParam {
  filter?: Filter;
}

interface TasksCommandGetParams {
  filter?: Filter | string;
}

class TasksCommand extends EntitiesCommand<Task, GetTasksResponse> {
  constructor(http: GmpHttp) {
    super(http, 'task', Task);
  }

  getEntitiesResponse(root: Element): GetTasksResponse {
    // @ts-expect-error
    return root.get_tasks.get_tasks_response;
  }

  async get(
    {filter}: TasksCommandGetParams = {},
    options?: HttpCommandOptions,
  ) {
    const params = {filter, usage_type: 'scan'};
    const response = await this.httpGet(params, options);
    const {
      entities,
      filter: responseFilter,
      counts,
    } = this.getCollectionListFromRoot(response.data);
    return response.set<Task[], {filter: Filter; counts: CollectionCounts}>(
      entities,
      {filter: responseFilter, counts},
    );
  }

  getSeverityAggregates({filter}: TasksCommandWithFilterParam = {}) {
    return this.getAggregates({
      aggregate_type: 'task',
      group_column: 'severity',
      usage_type: 'scan',
      filter,
    });
  }

  getStatusAggregates({filter}: TasksCommandWithFilterParam = {}) {
    return this.getAggregates({
      aggregate_type: 'task',
      group_column: 'status',
      usage_type: 'scan',
      filter,
    });
  }

  getHighResultsAggregates({
    filter,
    max,
  }: {filter?: Filter; max?: number} = {}) {
    return this.getAggregates({
      filter,
      aggregate_type: 'task',
      group_column: 'uuid',
      usage_type: 'scan',
      textColumns: ['name', 'high_per_host', 'severity', 'modified'],
      sort: [
        {
          field: 'high_per_host',
          direction: 'descending',
          stat: 'max',
        },
        {
          field: 'modified',
          direction: 'descending',
        },
      ],
      maxGroups: max,
    });
  }
}

export default TasksCommand;
