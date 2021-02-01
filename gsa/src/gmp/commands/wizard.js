/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import registerCommand from 'gmp/command';

import {parseModelFromElement} from 'gmp/model';

import Credential from 'gmp/models/credential';
import Task from 'gmp/models/task';
import Settings from 'gmp/models/settings';

import {forEach, map} from 'gmp/utils/array';

import HttpCommand from './http';

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
}

export default WizardCommand;

registerCommand('wizard', WizardCommand);

// vim: set ts=2 sw=2 tw=80:
