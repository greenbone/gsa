/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import {NO_VALUE} from 'gmp/parser';

import Audit, {HOSTS_ORDERING_SEQUENTIAL} from 'gmp/models/audit';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.audits');

export class AuditCommand extends EntityCommand {
  constructor(http) {
    super(http, 'task', Audit);
  }

  start({id}) {
    log.debug('Starting audit...');

    return this.httpPost({
      cmd: 'start_task',
      id,
    })
      .then(() => {
        log.debug('Started audit');
        return this.get({id});
      })
      .catch(err => {
        log.error('An error occurred while starting the audit', id, err);
        throw err;
      });
  }

  stop({id}) {
    log.debug('Stopping audit');

    return this.httpPost({
      cmd: 'stop_task',
      id,
    })
      .then(() => {
        log.debug('Stopped audit');
        return this.get({id});
      })
      .catch(err => {
        log.error('An error occurred while stopping the audit', id, err);
        throw err;
      });
  }

  resume({id}) {
    return this.httpPost({
      cmd: 'resume_task',
      id,
    })
      .then(() => {
        log.debug('Resumed audit');
        return this.get({id});
      })
      .catch(err => {
        log.error('An error occurred while resuming the audit', id, err);
        throw err;
      });
  }

  create(args) {
    const {
      addTag,
      alertIds = [],
      alterable,
      applyOverrides,
      autoDelete,
      autoDeleteData,
      comment = '',
      policyId,
      hostsOrdering,
      inAssets,
      maxChecks,
      maxHosts,
      minQod,
      name,
      scannerType,
      scannerId,
      scheduleId,
      schedulePeriods,
      sourceIface,
      tagId,
      targetId,
    } = args;

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
      hosts_ordering: hostsOrdering,
      in_assets: inAssets,
      max_checks: maxChecks,
      max_hosts: maxHosts,
      min_qod: minQod,
      name,
      scanner_id: scannerId,
      scanner_type: scannerType,
      schedule_id: scheduleId,
      schedule_periods: schedulePeriods,
      source_iface: sourceIface,
      tag_id: tagId,
      target_id: targetId,
      usage_type: 'audit',
    };
    log.debug('Creating audit', args, data);
    return this.action(data);
  }

  save(args) {
    const {
      alertIds = [],
      alterable,
      autoDelete,
      autoDeleteData,
      applyOverrides,
      comment = '',
      policyId = NO_VALUE,
      hostsOrdering = HOSTS_ORDERING_SEQUENTIAL,
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
      sourceIface,
    } = args;
    const data = {
      alterable,
      'alert_ids:': alertIds,
      apply_overrides: applyOverrides,
      auto_delete: autoDelete,
      auto_delete_data: autoDeleteData,
      comment,
      config_id: policyId,
      cmd: 'save_task',
      hosts_ordering: hostsOrdering,
      in_assets: inAssets,
      max_checks: maxChecks,
      max_hosts: maxHosts,
      min_qod: minQod,
      name,
      scanner_id: scannerId,
      scanner_type: scannerType,
      schedule_id: scheduleId,
      schedule_periods: schedulePeriods,
      source_iface: sourceIface,
      target_id: targetId,
      task_id: id,
      usage_type: 'audit',
    };
    log.debug('Saving audit', args, data);
    return this.action(data);
  }

  getElementFromRoot(root) {
    return root.get_task.get_tasks_response.task;
  }
}

export class AuditsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'task', Audit);
  }

  getEntitiesResponse(root) {
    return root.get_tasks.get_tasks_response;
  }

  get(params, options) {
    params = {...params, usage_type: 'audit'};
    return this.httpGet(params, options).then(response => {
      const {entities, filter, counts} = this.getCollectionListFromRoot(
        response.data,
      );
      return response.set(entities, {filter, counts});
    });
  }
}

registerCommand('audit', AuditCommand);
registerCommand('audits', AuditsCommand);

// vim: set ts=2 sw=2 tw=80:
