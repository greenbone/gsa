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

import {map, is_empty} from '../../utils.js';
import logger from '../../log.js';

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

  delete({id}) {
    log.debug('Deleting task');

    let params = {cmd: 'delete_task', id};
    return this.httpPost(params);
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

  clone({id}) {
    let extra_params = {
      id, // we need plain 'id' in the submitted form data not 'task_id'
    };
    return this.httpPost({
      cmd: 'clone',
      resource_type: 'task',
      next: 'get_task',
    }, {
      extra_params,
    }).then(xhr => {
      log.debug('Cloned task');
      return this.getModelFromResponse(xhr);
    })
    .catch(err => {
      log.error('An error occured while cloning the task', id, err);
      throw err;
    });
  }

  newTaskSettings() {
    return this.httpGet({cmd: 'new_task'}).then(xhr => {
      let settings = {};
      let {new_task} = xhr;
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
      return settings;
    });
  }

  editTaskSettings({id}) { // should be removed after get Alert, Schedule, ... are implemented
    return this.httpGet({
      cmd: 'edit_task',
      id,
    }).then(xhr => {
        let inst = {};
        let resp = xhr.edit_task.commands_response;
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
        return inst;
      });
  }

  create(args) {
    let {name, comment = '', target_id, schedule_id = 0, in_assets,
      apply_overrides, min_qod, alterable, auto_delete, auto_delete_data,
      scanner_type, scanner_id, config_id, slave_id = 0,
      source_iface = '', hosts_ordering, max_checks, max_hosts, cve_scanner_id,
      tag_name = '', tag_value = ''} = args;
    log.debug('Creating task', args);
    return this.httpPost({
      cmd: 'create_task',
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
    });
  }

  save(args) {
    let {id, name, comment = '', target_id, schedule_id = 0, in_assets,
      apply_overrides, min_qod, alterable, auto_delete, auto_delete_data,
      scanner_type, scanner_id, config_id, slave_id = 0,
      source_iface = '', hosts_ordering, max_checks, max_hosts} = args;
    log.debug('Saving task', args);
    return this.httpPost({
      cmd: 'save_task',
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
      slave_id,
      source_iface,
      target_id,
      task_id: id,
    });
  }

  getElementFromResponse(root) {
    return root.get_task.commands_response.get_tasks_response.task;
  }
}

export class TasksCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'get_tasks', Task);
  }

  getElementsFromResponse(response) {
    return response.task;
  }

  getCountsFromResponse(response) {
    let es = response.tasks;
    let ec = response.task_count;
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }

  getEntitiesResponse(root) {
    return root.get_tasks.get_tasks_response;
  }

  delete(tasks) {
    return this.deleteByIds(map(tasks, task => task.id))
      .then(() => tasks);
  }

  deleteByIds(ids) {
    let params = {
      cmd: 'bulk_delete',
      resource_type: 'task',
    };
    for (let id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params).then(() => ids);
  }

  deleteByFilter(filter) {
    // FIXME change gmp to allow deletion by filter
    let deleted;
    return this.get(filter).then(tasks => {
      deleted = tasks;
      return this.delete(tasks);
    }).then(() => deleted);
  }

  export(tasks) {
    return this.exportByIds(map(tasks, task => task.id));
  }

  exportByIds(ids) {
    let params = {
      cmd: 'process_bulk',
      resource_type: 'task',
      bulk_select: 1,
      'bulk_export.x': 1,
    };
    for (let id of ids) {
      params['bulk_selected:' + id] = 1;
    }
    return this.httpPost(params, {plain: true});
  }

  exportByFilter(filter) {
    let params = {
      cmd: 'process_bulk',
      resource_type: 'task',
      bulk_select: 0,
      'bulk_export.x': 1,
      filter,
    };
    return this.httpPost(params, {plain: true});
  }
}

register_command('task', TaskCommand);
register_command('tasks', TasksCommand);

// vim: set ts=2 sw=2 tw=80:
