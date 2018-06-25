/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_defined} from '../utils/identity';
import {map} from '../utils/array';

import Agent from '../models/agent.js';
import Alert from '../models/alert.js';
import Scanconfig from '../models/scanconfig.js';
import Credential from '../models/credential.js';
import Filter from '../models/filter.js';
import Group from '../models/group.js';
import Note from '../models/note.js';
import Override from '../models/override.js';
import Permission from '../models/permission.js';
import PortList from '../models/portlist.js';
import ReportFormat from '../models/reportformat.js';
import Role from '../models/role.js';
import Scanner from '../models/scanner.js';
import Schedule from '../models/schedule.js';
import Tag from '../models/tag.js';
import Target from '../models/target.js';
import Task from '../models/task.js';

class Trashcan extends HttpCommand {

  restore({id}) {
    const data = {
      cmd: 'restore',
      target_id: id,
    };
    return this.httpPost(data);
  }

  delete({id, entity_type}) {
    const command = 'delete_trash_' + entity_type;
    const type_id = entity_type + '_id';
    const data = {
      cmd: [command],
      [type_id]: id,
    };
    return this.httpPost(data);
  }

  empty() {
    return this.httpPost({cmd: 'empty_trashcan'});
  }

  get() {
    return this.httpGet({cmd: 'get_trash'}).then(response => {
      const trash_data = response.data.get_trash;
      const data = {};
      if (is_defined(trash_data.get_agents_response)) {
        data.agent_list = map(trash_data.get_agents_response.agent,
          model => new Agent(model));
      }
      if (is_defined(trash_data.get_alerts_response)) {
        data.alert_list = map(trash_data.get_alerts_response.alert,
          model => new Alert(model));
      }
      if (is_defined(trash_data.get_configs_response)) {
        data.config_list = map(trash_data.get_configs_response.config,
          model => new Scanconfig(model));
      }
      if (is_defined(trash_data.get_credentials_response)) {
        data.credential_list = map(
          trash_data.get_credentials_response.credential,
          model => new Credential(model)
        );
      }
      if (is_defined(trash_data.get_filters_response)) {
        data.filter_list = map(trash_data.get_filters_response.filter,
            model => new Filter(model));
      }
      if (is_defined(trash_data.get_groups_response)) {
        data.group_list = map(trash_data.get_groups_response.group,
            model => new Group(model));
      }
      if (is_defined(trash_data.get_notes_response)) {
        data.note_list = map(trash_data.get_notes_response.note,
          model => new Note(model));
      }
      if (is_defined(trash_data.get_overrides_response)) {
        data.override_list = map(trash_data.get_overrides_response.override,
          model => new Override(model));
      }
      if (is_defined(trash_data.get_permissions_response)) {
        data.permission_list = map(
          trash_data.get_permissions_response.permission,
          model => new Permission(model)
        );
      }
      if (is_defined(trash_data.get_port_lists_response)) {
        data.port_list_list = map(trash_data.get_port_lists_response.port_list,
          model => new PortList(model));
      }
      if (is_defined(trash_data.get_report_formats_response)) {
        data.report_format_list = map(
          trash_data.get_report_formats_response.report_format,
          model => new ReportFormat(model)
        );
      }
      if (is_defined(trash_data.get_roles_response)) {
        data.role_list = map(trash_data.get_roles_response.role,
          model => new Role(model));
      }
      if (is_defined(trash_data.get_scanners_response)) {
        data.scanner_list = map(trash_data.get_scanners_response.scanner,
          model => new Scanner(model));
      }
      if (is_defined(trash_data.get_schedules_response)) {
        data.schedule_list = map(trash_data.get_schedules_response.schedule,
          model => new Schedule(model));
      }
      if (is_defined(trash_data.get_tags_response)) {
        data.tag_list = map(trash_data.get_tags_response.tag,
          model => new Tag(model));
      }
      if (is_defined(trash_data.get_targets_response)) {
        data.target_list = map(trash_data.get_targets_response.target,
          model => new Target(model));
      }
      if (is_defined(trash_data.get_tasks_response)) {
        data.task_list = map(trash_data.get_tasks_response.task,
          model => new Task(model));
      }
      return response.setData(data);
    });
  }
}

register_command('trashcan', Trashcan);

// vim: set ts=2 sw=2 tw=80:
