/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import registerCommand from '../command';

import {apiType} from '../utils/entitytype';
import {isDefined} from '../utils/identity';
import {map} from '../utils/array';

import Agent from '../models/agent';
import Alert from '../models/alert';
import Scanconfig from '../models/scanconfig';
import Credential from '../models/credential';
import Filter from '../models/filter';
import Group from '../models/group';
import Note from '../models/note';
import Override from '../models/override';
import Permission from '../models/permission';
import PortList from '../models/portlist';
import ReportFormat from '../models/reportformat';
import Role from '../models/role';
import Scanner from '../models/scanner';
import Schedule from '../models/schedule';
import Tag from '../models/tag';
import Target from '../models/target';
import Task from '../models/task';
import Ticket from '../models/ticket';

import HttpCommand from './http';

class Trashcan extends HttpCommand {
  restore({id}) {
    const data = {
      cmd: 'restore',
      target_id: id,
    };
    return this.httpPost(data);
  }

  delete({id, entityType}) {
    entityType = apiType(entityType);
    const cmd = 'delete_from_trash';
    const typeId = entityType + '_id';
    return this.httpPost({
      cmd,
      [typeId]: id,
      resource_type: entityType,
    });
  }

  empty() {
    return this.httpPost({cmd: 'empty_trashcan'});
  }

  get() {
    return this.httpGet({cmd: 'get_trash'}).then(response => {
      const trash_data = response.data.get_trash;
      const data = {};
      if (isDefined(trash_data.get_agents_response)) {
        data.agent_list = map(
          trash_data.get_agents_response.agent,
          model => new Agent(model),
        );
      }
      if (isDefined(trash_data.get_alerts_response)) {
        data.alert_list = map(
          trash_data.get_alerts_response.alert,
          model => new Alert(model),
        );
      }
      if (isDefined(trash_data.get_configs_response)) {
        data.config_list = map(
          trash_data.get_configs_response.config,
          model => new Scanconfig(model),
        );
      }
      if (isDefined(trash_data.get_credentials_response)) {
        data.credential_list = map(
          trash_data.get_credentials_response.credential,
          model => new Credential(model),
        );
      }
      if (isDefined(trash_data.get_filters_response)) {
        data.filter_list = map(
          trash_data.get_filters_response.filter,
          model => new Filter(model),
        );
      }
      if (isDefined(trash_data.get_groups_response)) {
        data.group_list = map(
          trash_data.get_groups_response.group,
          model => new Group(model),
        );
      }
      if (isDefined(trash_data.get_notes_response)) {
        data.note_list = map(
          trash_data.get_notes_response.note,
          model => new Note(model),
        );
      }
      if (isDefined(trash_data.get_overrides_response)) {
        data.override_list = map(
          trash_data.get_overrides_response.override,
          model => new Override(model),
        );
      }
      if (isDefined(trash_data.get_permissions_response)) {
        data.permission_list = map(
          trash_data.get_permissions_response.permission,
          model => new Permission(model),
        );
      }
      if (isDefined(trash_data.get_port_lists_response)) {
        data.port_list_list = map(
          trash_data.get_port_lists_response.port_list,
          model => new PortList(model),
        );
      }
      if (isDefined(trash_data.get_report_formats_response)) {
        data.report_format_list = map(
          trash_data.get_report_formats_response.report_format,
          model => new ReportFormat(model),
        );
      }
      if (isDefined(trash_data.get_roles_response)) {
        data.role_list = map(
          trash_data.get_roles_response.role,
          model => new Role(model),
        );
      }
      if (isDefined(trash_data.get_scanners_response)) {
        data.scanner_list = map(
          trash_data.get_scanners_response.scanner,
          model => new Scanner(model),
        );
      }
      if (isDefined(trash_data.get_schedules_response)) {
        data.schedule_list = map(
          trash_data.get_schedules_response.schedule,
          model => new Schedule(model),
        );
      }
      if (isDefined(trash_data.get_tags_response)) {
        data.tag_list = map(
          trash_data.get_tags_response.tag,
          model => new Tag(model),
        );
      }
      if (isDefined(trash_data.get_targets_response)) {
        data.target_list = map(
          trash_data.get_targets_response.target,
          model => new Target(model),
        );
      }
      if (isDefined(trash_data.get_tasks_response)) {
        data.task_list = map(
          trash_data.get_tasks_response.task,
          model => new Task(model),
        );
      }
      if (isDefined(trash_data.get_tickets_response)) {
        data.ticket_list = map(
          trash_data.get_tickets_response.ticket,
          model => new Ticket(model),
        );
      }
      return response.setData(data);
    });
  }
}

registerCommand('trashcan', Trashcan);

// vim: set ts=2 sw=2 tw=80:
