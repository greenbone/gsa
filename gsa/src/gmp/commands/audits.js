/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import logger from '../log';

import registerCommand from '../command';

import {NO_VALUE} from '../parser';

import Audit, {HOSTS_ORDERING_SEQUENTIAL} from '../models/audit';

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
      source_iface,
      tag_id,
      target_id,
    } = args;

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
      source_iface,
      tag_id,
      target_id,
      usage_type: 'audit',
    };
    log.debug('Creating audit', args, data);
    return this.action(data);
  }

  createContainer(args) {
    const {name, comment = ''} = args;
    log.debug('Creating container audit', args);
    return this.action({
      cmd: 'create_container_task',
      name,
      comment,
      usage_type: 'audit',
    });
  }

  save(args) {
    const {
      alert_ids = [],
      alterable,
      auto_delete,
      auto_delete_data,
      apply_overrides,
      comment = '',
      config_id = NO_VALUE,
      hosts_ordering = HOSTS_ORDERING_SEQUENTIAL,
      id,
      in_assets,
      max_checks,
      max_hosts,
      min_qod,
      name,
      scanner_id = NO_VALUE,
      scanner_type,
      schedule_id = NO_VALUE,
      schedule_periods,
      target_id = NO_VALUE,
      source_iface,
    } = args;
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
      source_iface,
      target_id,
      task_id: id,
      usage_type: 'audit',
    };
    log.debug('Saving audit', args, data);
    return this.action(data);
  }

  saveContainer(args) {
    const {
      name,
      comment = '',
      in_assets = '1',
      auto_delete = 'no',
      auto_delete_data,
      id,
    } = args;
    log.debug('Saving container audit', args);
    return this.action({
      cmd: 'save_container_task',
      name,
      comment,
      in_assets,
      auto_delete,
      auto_delete_data,
      task_id: id,
      usage_type: 'audit',
    });
  }

  getElementFromRoot(root) {
    return root.get_task.get_tasks_response.task;
  }
}

class AuditsCommand extends EntitiesCommand {
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
