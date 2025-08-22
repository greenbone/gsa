/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable @typescript-eslint/naming-convention */

import CollectionCounts from 'gmp/collection/CollectionCounts';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand, {EntityCommandParams} from 'gmp/commands/entity';
import {FeedStatusCommand, feedStatusRejection} from 'gmp/commands/feedstatus';
import {HttpCommandOptions} from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Rejection from 'gmp/http/rejection';
import logger from 'gmp/log';
import Filter from 'gmp/models/filter';
import {Element} from 'gmp/models/model';
import {ScannerType} from 'gmp/models/scanner';
import Task, {
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  TaskElement,
  TaskAutoDelete,
} from 'gmp/models/task';
import {NO_VALUE, YES_VALUE, YesNo} from 'gmp/parser';

interface TaskCommandCreateParams {
  add_tag?: YesNo;
  alert_ids?: string[];
  alterable?: YesNo;
  apply_overrides?: YesNo;
  auto_delete?: TaskAutoDelete;
  auto_delete_data?: number;
  comment?: string;
  config_id?: string;
  hosts_ordering?: string;
  in_assets?: YesNo;
  max_checks?: number;
  max_hosts?: number;
  min_qod?: number;
  name: string;
  scanner_type?: ScannerType;
  scanner_id?: string;
  schedule_id?: string;
  schedule_periods?: number;
  tag_id?: string;
  target_id?: string;
}

export interface TaskCommandCreateContainerParams {
  name: string;
  comment?: string;
}

interface TaskCommandSaveParams {
  alert_ids?: string[];
  alterable?: YesNo;
  auto_delete?: TaskAutoDelete;
  auto_delete_data?: Number;
  apply_overrides?: YesNo;
  comment?: string;
  config_id?: string;
  hosts_ordering?: string;
  id: string;
  in_assets?: YesNo;
  max_checks?: number;
  max_hosts?: number;
  min_qod?: number;
  name: string;
  scanner_id?: string;
  scanner_type?: ScannerType;
  schedule_id?: string;
  schedule_periods?: number;
  target_id?: string;
}

interface TaskCommandSaveContainerParams {
  name: string;
  comment?: string;
  in_assets?: YesNo;
  id: string;
}

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

const log = logger.getLogger('gmp.commands.tasks');

const NO_VALUE_ID = String(NO_VALUE);

export class TaskCommand extends EntityCommand<Task, TaskElement> {
  constructor(http: GmpHttp) {
    super(http, 'task', Task);
  }

  async start({id}: EntityCommandParams) {
    log.debug('Starting task...');

    try {
      const feeds = new FeedStatusCommand(this.http);

      const status = await feeds.checkFeedSync();

      if (status.isSyncing) {
        throw new Error('Feed is currently syncing. Please try again later.');
      }

      await this.httpPost({
        cmd: 'start_task',
        id,
      });

      log.debug('Started task');
    } catch (error) {
      log.error('An error occurred while starting the task', id, error);
      throw error;
    }
  }

  async stop({id}: EntityCommandParams) {
    log.debug('Stopping task');

    try {
      await this.httpPost({
        cmd: 'stop_task',
        id,
      });
      log.debug('Stopped task');
      return await this.get({id});
    } catch (err) {
      log.error('An error occurred while stopping the task', id, err);
      throw err;
    }
  }

  async resume({id}: EntityCommandParams) {
    try {
      await this.httpPost({
        cmd: 'resume_task',
        id,
      });
      log.debug('Resumed task');
      return await this.get({id});
    } catch (err) {
      log.error('An error occurred while resuming the task', id, err);
      throw err;
    }
  }

  async create({
    add_tag,
    alert_ids = [],
    alterable,
    apply_overrides,
    auto_delete,
    auto_delete_data,
    comment = '',
    config_id,
    hosts_ordering,
    in_assets,
    max_checks,
    max_hosts,
    min_qod,
    name,
    scanner_type,
    scanner_id,
    schedule_id,
    schedule_periods,
    tag_id,
    target_id,
  }: TaskCommandCreateParams) {
    const data = {
      cmd: 'create_task',
      add_tag,
      'alert_ids:': alert_ids,
      alterable,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      comment,
      config_id,
      hosts_ordering,
      in_assets,
      max_checks,
      max_hosts,
      min_qod,
      name,
      scanner_id,
      scanner_type,
      schedule_id,
      schedule_periods,
      tag_id,
      target_id,
      usage_type: 'scan',
    };
    log.debug('Creating task', data);

    try {
      return await this.entityAction(data);
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection as Rejection);
      throw rejection; // Ensure the function always returns or throws
    }
  }

  async createContainer({
    name,
    comment = '',
  }: TaskCommandCreateContainerParams) {
    log.debug('Creating container task', name, comment);
    return await this.entityAction({
      cmd: 'create_container_task',
      auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
      name,
      comment,
      usage_type: 'scan',
    });
  }

  async save({
    alert_ids = [],
    alterable,
    auto_delete,
    auto_delete_data,
    apply_overrides,
    comment = '',
    config_id = NO_VALUE_ID,
    hosts_ordering = HOSTS_ORDERING_SEQUENTIAL,
    id,
    in_assets,
    max_checks,
    max_hosts,
    min_qod,
    name,
    scanner_id = NO_VALUE_ID,
    scanner_type,
    schedule_id = NO_VALUE_ID,
    schedule_periods,
    target_id = NO_VALUE_ID,
  }: TaskCommandSaveParams) {
    const data = {
      alterable,
      'alert_ids:': alert_ids,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      comment,
      config_id,
      cmd: 'save_task',
      hosts_ordering,
      in_assets,
      max_checks,
      max_hosts,
      min_qod,
      name,
      scanner_id,
      scanner_type,
      schedule_id,
      schedule_periods,
      target_id,
      task_id: id,
      usage_type: 'scan',
    };
    log.debug('Saving task', data);
    try {
      await this.httpPost(data);
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection as Rejection);
    }
  }

  async saveContainer({
    name,
    comment = '',
    in_assets = YES_VALUE,
    id,
  }: TaskCommandSaveContainerParams) {
    log.debug('Saving container task', {name, comment, in_assets, id});
    await this.httpPost({
      cmd: 'save_container_task',
      name,
      comment,
      in_assets,
      auto_delete: 'no',
      auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
      task_id: id,
      usage_type: 'scan',
    });
  }

  getElementFromRoot(root: Element): TaskElement {
    // @ts-expect-error
    return root.get_task.get_tasks_response.task;
  }
}

export class TasksCommand extends EntitiesCommand<Task, GetTasksResponse> {
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
