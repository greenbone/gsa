/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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
import registerCommand from '../command';

import {parseModelFromElement} from '../model';

import Credential from '../models/credential';
import Task from '../models/task';
import Settings from '../models/settings';

import {forEach, map} from '../utils/array';

import HttpCommand from './http';

function convert_data(prefix, data, fields) {
  const converted = {};
  for (const name of fields) {
    if (data.hasOwnProperty(name)) {
      converted[prefix + ':' + name] = data[name];
    }
  }
  return converted;
}

const event_data_quick_first_scan_fields = [
  'config_id',
  'alert_id',
  'scanner_id',
  'smb_credential',
  'ssh_credential',
  'ssh_port',
  'esxi_credential',
  'hosts',
  'port_list_id',
];

const event_data_quick_task_fields = [
  'config_id',
  'alert_email',
  'scanner_id',
  'auto_start',
  'start_year',
  'start_month',
  'start_day',
  'start_hour',
  'start_minute',
  'start_timezone',
  'smb_credential',
  'ssh_credential',
  'ssh_port',
  'esxi_credential',
  'task_name',
  'target_hosts',
  'port_list_id',
];

const event_data_modify_task_fields = [
  'task_id',
  'alert_email',
  'reschedule',
  'start_year',
  'start_month',
  'start_day',
  'start_hour',
  'start_minute',
  'start_timezone',
];

class WizardCommand extends HttpCommand {
  constructor(http) {
    super(http, {cmd: 'wizard'});
  }

  task() {
    return this.httpGet({
      name: 'quick_first_scan',
    }).then(response => {
      const {data} = response;
      const settings = new Settings();

      settings.client_address = data.client_address;

      forEach(
        data.wizard.run_wizard_response.response.get_settings_response.setting,
        setting => {
          settings.set(setting.name, {
            id: setting._id,
            comment: setting.comment,
            name: setting.name,
            value: setting.value,
          });
        },
      );

      return response.setData(settings);
    });
  }

  advancedTask() {
    return this.httpGet({
      name: 'quick_task',
    }).then(response => {
      const {data} = response;

      const resp = data.wizard.run_wizard_response.response;

      const settings = new Settings();

      forEach(resp.get_settings_response.setting, setting => {
        settings.set(setting.name, {
          id: setting._id,
          comment: setting.comment,
          name: setting.name,
          value: setting.value,
        });
      });

      settings.scan_configs = map(resp.get_configs_response.config, config => {
        return parseModelFromElement(config, 'scanconfig');
      });

      settings.credentials = map(
        resp.get_credentials_response.credential,
        cred => {
          return Credential.fromElement(cred);
        },
      );

      settings.client_address = data.client_address;

      return response.setData(settings);
    });
  }

  modifyTask() {
    return this.httpGet({
      name: 'modify_task',
    }).then(response => {
      const {data} = response;

      const resp = data.wizard.run_wizard_response.response;

      const settings = new Settings();

      forEach(resp.get_settings_response.setting, setting => {
        settings.set(setting.name, {
          id: setting._id,
          comment: setting.comment,
          name: setting.name,
          value: setting.value,
        });
      });

      settings.tasks = map(resp.get_tasks_response.task, task =>
        Task.fromElement(task),
      ).filter(task => !task.isContainer());

      return response.setData(settings);
    });
  }

  runQuickFirstScan(args) {
    return this.httpPost({
      ...convert_data('event_data', args, event_data_quick_first_scan_fields),
      cmd: 'run_wizard',
      name: 'quick_first_scan',
    });
  }

  runQuickTask(args) {
    const {start_date, ...other} = args;
    const event_data = convert_data(
      'event_data',
      other,
      event_data_quick_task_fields,
    );

    event_data['event_data:start_day'] = start_date.day();
    event_data['event_data:start_month'] = start_date.month() + 1;
    event_data['event_data:start_year'] = start_date.year();

    return this.httpPost({
      ...event_data,
      cmd: 'run_wizard',
      name: 'quick_task',
    });
  }

  runModifyTask(args) {
    const {start_date, ...other} = args;

    const event_data = convert_data(
      'event_data',
      other,
      event_data_modify_task_fields,
    );

    event_data['event_data:start_day'] = start_date.date();
    event_data['event_data:start_month'] = start_date.month() + 1;
    event_data['event_data:start_year'] = start_date.year();

    return this.httpPost({
      ...event_data,
      cmd: 'run_wizard',
      name: 'modify_task',
    });
  }
}

export default WizardCommand;

registerCommand('wizard', WizardCommand);

// vim: set ts=2 sw=2 tw=80:
