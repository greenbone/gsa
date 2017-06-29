/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {HttpCommand, register_command} from '../command.js';
import Model from '../model.js';

import Credential from '../models/credential.js';
import Task from '../models/task.js';
import Settings from '../models/settings.js';

import {extend, for_each, map} from '../utils.js';

function convert_data(prefix, data, fields) {
  let converted = {};
  for (let name of fields) {
    if (data.hasOwnProperty(name)) {
      converted[prefix + ':' + name] = data[name];
    }
  }
  return converted;
}

const event_data_quick_first_scan_fields = [
  'config_id', 'alert_id', 'scanner_id', 'smb_credential', 'ssh_credential',
  'ssh_port', 'esxi_credential', 'hosts', 'port_list_id',
];

const event_data_quick_task_fields = [
  'config_id', 'alert_email', 'scanner_id', 'auto_start',
  'start_year', 'start_month', 'start_day',  'start_hour', 'start_minute',
  'start_timezone', 'smb_credential', 'ssh_credential', 'ssh_port',
  'esxi_credential', 'task_name', 'target_hosts', 'port_list_id',
];

const event_data_modify_task_fields = [
  'task_id', 'alert_email', 'reschedule', 'start_year', 'start_month',
  'start_day', 'start_hour', 'start_minute', 'start_timezone',
];

export class WizardCommand extends HttpCommand {

  constructor(http) {
    super(http, {cmd: 'wizard'});
  }

  task() {
    return this.httpGet({
      name: 'quick_first_scan',
    }).then(response => {
      let {data} = response;
      let settings = new Settings();

      settings.client_address = data.client_address;

      for_each(data.wizard.run_wizard_response.response.get_settings_response
        .setting, setting => {
          settings.set(setting.name, {
            id: setting._id,
            comment: setting.comment,
            name: setting.name,
            value: setting.value,
          });
      });

      return response.setData(settings);
    });
  }

  advancedTask() {
    return this.httpGet({
      name: 'quick_task',
    }).then(response => {
      let {data} = response;

      let resp = data.wizard.run_wizard_response.response.commands_response;

      let settings = new Settings();

      for_each(resp.get_settings_response.setting, setting => {
          settings.set(setting.name, {
            id: setting._id,
            comment: setting.comment,
            name: setting.name,
            value: setting.value,
          });
      });

      settings.scan_configs = map(resp.get_configs_response.config, config => {
        return new Model(config);
      });

      settings.credentials = map(resp.get_credentials_response.credential,
        cred => {
          return new Credential(cred);
        });

      settings.client_address = data.client_address;
      settings.timezone = data.timezone;

      return response.setData(settings);
    });
  }

  modifyTask() {
    return this.httpGet({
      name: 'modify_task',
    }).then(response => {
      let {data} = response;

      let resp = data.wizard.run_wizard_response.response.commands_response;

      let settings = new Settings();

      for_each(resp.get_settings_response.setting, setting => {
          settings.set(setting.name, {
            id: setting._id,
            comment: setting.comment,
            name: setting.name,
            value: setting.value,
          });
      });

      settings.tasks = map(resp.get_tasks_response.task,
        task => new Task(task))
        .filter(task => !task.isContainer());

      settings.timezone = data.timezone;
      return response.setData(settings);
    });
  }

  runQuickFirstScan(args) {
    return this.httpPost(extend(
      {
        cmd: 'run_wizard',
        name: 'quick_first_scan',
      },
      convert_data('event_data', args, event_data_quick_first_scan_fields),
    ));
  }

  runQuickTask(args) {
    let {date, ...other} = args;
    let event_data = convert_data('event_data', other,
      event_data_quick_task_fields);

    event_data['event_data:start_day'] = date.day();
    event_data['event_data:start_month'] = date.month() + 1;
    event_data['event_data:start_year'] = date.year();

    return this.httpPost(extend(
      {
        cmd: 'run_wizard',
        name: 'quick_task',
      },
      event_data,
    ));
  }

  runModifyTask(args) {
    let {date, ...other} = args;

    let event_data = convert_data('event_data', other,
      event_data_modify_task_fields);

    event_data['event_data:start_day'] = date.day();
    event_data['event_data:start_month'] = date.month() + 1;
    event_data['event_data:start_year'] = date.year();

    return this.httpPost(extend(
      {
        cmd: 'run_wizard',
        name: 'modify_task',
      },
      event_data
    ));
  }
}

export default WizardCommand;

register_command('wizard', WizardCommand);

// vim: set ts=2 sw=2 tw=80:
