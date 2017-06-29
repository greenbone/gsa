/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {map, is_empty} from '../utils.js';
import logger from '../log.js';

import {EntitiesCommand, EntityCommand, register_command} from '../command.js';
import Model from '../model.js';

import Scanner from '../models/scanner.js';
import Schedule from '../models/schedule.js';
import Target from '../models/target.js';
import Task from '../models/task.js';

const log = logger.getLogger('gmp.commands.tasks');

export class TaskCommand extends EntityCommand {

  constructor(http) {
    super(http, 'task', Task);
  }

  start({id}) {
    log.debug('Starting task...');

    return this.httpPost({
      cmd: 'start_task',
      next: 'get_task',
      id,
    })
    .then(() => {
      log.debug('Started task');
      return this.get({id});
    })
    .catch(err => {
      log.error('An error occured while starting the task', id, err);
      throw err;
    });
  }

  stop({id}) {
    log.debug('Stopping task');

    return this.httpPost({
      cmd: 'stop_task',
      next: 'get_task',
      id,
    })
    .then(() => {
      log.debug('Stopped task');
      return this.get({id});
    })
    .catch(err => {
      log.error('An error occured while stopping the task', id, err);
      throw err;
    });
  }

  resume({id}) {
    return this.httpPost({
      cmd: 'resume_task',
      id,
    }).then(() => {
      log.debug('Resumed task');
      return this.get({id});
    })
    .catch(err => {
      log.error('An error occured while resuming the task', id, err);
      throw err;
    });
  }

  newTaskSettings() {
    return this.httpGet({cmd: 'new_task'}).then(response => {
      let {data} = response;
      let settings = {};
      let {new_task} = data;
      settings.targets = map(new_task.get_targets_response.target,
        target => new Target(target));
      settings.scan_configs = map(new_task.get_configs_response.config,
        config => new Model(config));
      settings.alerts = map(new_task.get_alerts_response.alert,
        alert => new Model(alert));
      settings.schedules = map(new_task.get_schedules_response.schedule,
        schedule => new Schedule(schedule));
      settings.scanners = map(new_task.get_scanners_response.scanner,
        scanner => new Scanner(scanner));
      settings.tags = map(new_task.get_tags_response.tag,
        tag => new Model(tag));
      settings.alert_id = is_empty(new_task.alert_id) ?
        undefined : new_task.alert_id;
      settings.config_id = is_empty(new_task.config_id) ?
        undefined : new_task.config_id;
      settings.osp_config_id = is_empty(new_task.osp_config_id) ?
        undefined : new_task.osp_config_id;
      settings.osp_scanner_id = is_empty(new_task.osp_scanner_id) ?
        undefined : new_task.osp_scanner_id;
      settings.scanner_id = is_empty(new_task.scanner_id) ?
        undefined : new_task.scanner_id;
      settings.schedule_id = is_empty(new_task.schedule_id) ?
        undefined : new_task.schedule_id;
      settings.target_id = is_empty(new_task.target_id) ?
        undefined : new_task.target_id;
      return response.setData(settings);
    });
  }

  editTaskSettings({id}) { // should be removed after get Alert, Schedule, ... are implemented
    return this.httpGet({
      cmd: 'edit_task',
      id,
    }).then(response => {
      let {data} = response;

      let inst = {};
      let resp = data.edit_task.commands_response;
      inst.targets = map(resp.get_targets_response.target,
        target => new Target(target));
      inst.scan_configs = map(resp.get_configs_response.config,
        config => new Model(config));
      inst.alerts = map(resp.get_alerts_response.alert,
        alert => new Model(alert));
      inst.schedules = map(resp.get_schedules_response.schedule,
        schedule => new Schedule(schedule));
      inst.scanners = map(resp.get_scanners_response.scanner,
        scanner => new Scanner(scanner));
      return response.setData(inst);
    });
  }

  create(args) {
    let {name, comment = '', target_id, schedule_id = 0, in_assets,
      apply_overrides, min_qod, alterable, auto_delete, auto_delete_data,
      scanner_type, scanner_id, config_id, slave_id = 0, alert_ids = [],
      source_iface = '', hosts_ordering, max_checks, max_hosts, cve_scanner_id,
      tag_name = '', tag_value = ''} = args;

    let data = {
      cmd: 'create_task',
      next: 'get_task',
      'alert_ids:': alert_ids,
      alterable,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      comment,
      config_id,
      cve_scanner_id,
      hosts_ordering,
      in_assets,
      max_checks,
      max_hosts,
      min_qod,
      name,
      scanner_id,
      scanner_type,
      schedule_id,
      slave_id,
      source_iface,
      tag_name,
      tag_value,
      target_id,
    };
    log.debug('Creating task', args, data);
    return this.httpPost(data).then(this.transformResponse);
  }

  createContainer(args) {
    let {name, comment = ''} = args;
    log.debug('Creating container task', args);
    return this.httpPost({
      cmd: 'create_container_task',
      next: 'get_task',
      name,
      comment,
    }).then(this.transformResponse);
  }

  save(args) {
    let {id, name, comment = '', target_id, schedule_id = 0, in_assets,
      apply_overrides, min_qod, alterable, auto_delete, auto_delete_data,
      scanner_type, scanner_id, config_id, slave_id = 0, alert_ids = [],
      source_iface = '', hosts_ordering, max_checks, max_hosts} = args;
    let data = {
      cmd: 'save_task',
      next: 'get_task',
      alterable,
      'alert_ids:': alert_ids,
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
      slave_id,
      source_iface,
      target_id,
      task_id: id,
    };
    log.debug('Saving task', args, data);
    return this.httpPost(data).then(this.transformResponse);
  }

  saveContainer(args) {
    let {name, comment = '', in_assets = '1', auto_delete = 'no',
      auto_delete_data, id} = args;
    log.debug('Saving container task', args);
    return this.httpPost({
      cmd: 'save_container_task',
      next: 'get_task',
      name,
      comment,
      in_assets,
      auto_delete,
      auto_delete_data,
      task_id: id,
    }).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_task.commands_response.get_tasks_response.task;
  }
}

export class TasksCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'task', Task);
  }

  getEntitiesResponse(root) {
    return root.get_tasks.get_tasks_response;
  }
}

register_command('task', TaskCommand);
register_command('tasks', TasksCommand);

// vim: set ts=2 sw=2 tw=80:
