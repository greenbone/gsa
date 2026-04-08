/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand, {type EntityCommandParams} from 'gmp/commands/entity';
import {type HttpCommandOptions} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import Audit, {HOSTS_ORDERING_RANDOM} from 'gmp/models/audit';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import {type ScannerType} from 'gmp/models/scanner';
import {type TaskElement, type TaskAutoDelete} from 'gmp/models/task';
import {NO_VALUE, type YesNo} from 'gmp/parser';

interface AuditCommandCreateParams {
  addTag?: YesNo;
  alertIds?: string[];
  alterable?: YesNo;
  applyOverrides?: YesNo;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment?: string;
  policyId?: string;
  inAssets?: YesNo;
  maxChecks?: number;
  maxHosts?: number;
  minQod?: number;
  name: string;
  scannerType?: ScannerType;
  scannerId?: string;
  scheduleId?: string;
  schedulePeriods?: number;
  tagId?: string;
  targetId?: string;
}

interface AuditCommandSaveParams {
  alertIds?: string[];
  alterable?: YesNo;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  applyOverrides?: YesNo;
  comment?: string;
  policyId?: string | number;
  id: string;
  inAssets?: YesNo;
  maxChecks?: number;
  maxHosts?: number;
  minQod?: number;
  name: string;
  scannerId?: string | number;
  scannerType?: ScannerType;
  scheduleId?: string | number;
  schedulePeriods?: number;
  targetId?: string | number;
}

interface AuditsCommandGetParams {
  filter?: Filter | string;
}

const log = logger.getLogger('gmp.commands.audits');

class AuditCommand extends EntityCommand<Audit, TaskElement> {
  constructor(http: Http) {
    super(http, 'task', Audit);
  }

  async start({id}: EntityCommandParams) {
    log.debug('Starting audit...');

    try {
      await this.httpPostWithTransform({
        cmd: 'start_task',
        id,
      });
      log.debug('Started audit');
      return await this.get({id});
    } catch (err) {
      log.error('An error occurred while starting the audit', id, err);
      throw err;
    }
  }

  async stop({id}: EntityCommandParams) {
    log.debug('Stopping audit');

    try {
      await this.httpPostWithTransform({
        cmd: 'stop_task',
        id,
      });
      log.debug('Stopped audit');
      return await this.get({id});
    } catch (err) {
      log.error('An error occurred while stopping the audit', id, err);
      throw err;
    }
  }

  async resume({id}: EntityCommandParams) {
    try {
      await this.httpPostWithTransform({
        cmd: 'resume_task',
        id,
      });
      log.debug('Resumed audit');
      return await this.get({id});
    } catch (err) {
      log.error('An error occurred while resuming the audit', id, err);
      throw err;
    }
  }

  async create({
    addTag,
    alertIds = [],
    alterable,
    applyOverrides,
    autoDelete,
    autoDeleteData,
    comment = '',
    policyId,
    inAssets,
    maxChecks,
    maxHosts,
    minQod,
    name,
    scannerType,
    scannerId,
    scheduleId,
    schedulePeriods,
    tagId,
    targetId,
  }: AuditCommandCreateParams) {
    const data = {
      cmd: 'create_task',
      add_tag: addTag,
      'alert_ids:': alertIds,
      alterable,
      apply_overrides: applyOverrides,
      auto_delete: autoDelete,
      auto_delete_data: autoDeleteData,
      comment,
      config_id: policyId,
      hosts_ordering: HOSTS_ORDERING_RANDOM,
      in_assets: inAssets,
      max_checks: maxChecks,
      max_hosts: maxHosts,
      min_qod: minQod,
      name,
      scanner_id: scannerId,
      scanner_type: scannerType,
      schedule_id: scheduleId,
      schedule_periods: schedulePeriods,
      tag_id: tagId,
      target_id: targetId,
      usage_type: 'audit',
    };
    log.debug('Creating audit', data);
    return await this.action(data);
  }

  async save({
    alertIds = [],
    alterable,
    autoDelete,
    autoDeleteData,
    applyOverrides,
    comment = '',
    policyId = NO_VALUE,
    id,
    inAssets,
    maxChecks,
    maxHosts,
    minQod,
    name,
    scannerId = NO_VALUE,
    scannerType,
    scheduleId = NO_VALUE,
    schedulePeriods,
    targetId = NO_VALUE,
  }: AuditCommandSaveParams) {
    const data = {
      alterable,
      'alert_ids:': alertIds,
      apply_overrides: applyOverrides,
      auto_delete: autoDelete,
      auto_delete_data: autoDeleteData,
      comment,
      config_id: policyId,
      cmd: 'save_task',
      hosts_ordering: HOSTS_ORDERING_RANDOM,
      in_assets: inAssets,
      max_checks: maxChecks,
      max_hosts: maxHosts,
      min_qod: minQod,
      name,
      scanner_id: scannerId,
      scanner_type: scannerType,
      schedule_id: scheduleId,
      schedule_periods: schedulePeriods,
      target_id: targetId,
      task_id: id,
      usage_type: 'audit',
    };
    log.debug('Saving audit', data);
    return await this.action(data);
  }

  getElementFromRoot(root: Element): TaskElement {
    // @ts-expect-error
    return root.get_task.get_tasks_response.task;
  }
}

class AuditsCommand extends EntitiesCommand<Audit> {
  constructor(http: Http) {
    super(http, 'task', Audit);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_tasks.get_tasks_response;
  }

  async get(
    {filter}: AuditsCommandGetParams = {},
    options?: HttpCommandOptions,
  ) {
    const params = {filter, usage_type: 'audit'};
    const response = await this.httpGetWithTransform(params, options);
    const {
      entities,
      filter: responseFilter,
      counts,
    } = this.getCollectionListFromRoot(response.data);
    return response.set<Audit[], {filter: Filter; counts: CollectionCounts}>(
      entities,
      {filter: responseFilter, counts},
    );
  }
}

export default AuditCommand;
export {AuditCommand, AuditsCommand};
