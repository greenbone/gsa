/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {apiType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';

import Alert from 'gmp/models/alert';
import Scanconfig from 'gmp/models/scanconfig';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import Group from 'gmp/models/group';
import Note from 'gmp/models/note';
import Override from 'gmp/models/override';
import Permission from 'gmp/models/permission';
import PortList from 'gmp/models/portlist';
import ReportFormat from 'gmp/models/reportformat';
import Role from 'gmp/models/role';
import Scanner from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import Tag from 'gmp/models/tag';
import Target from 'gmp/models/target';
import Task from 'gmp/models/task';
import Ticket from 'gmp/models/ticket';

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
      if (isDefined(trash_data.get_alerts_response)) {
        data.alert_list = map(trash_data.get_alerts_response.alert, model =>
          Alert.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_configs_response)) {
        data.config_list = map(trash_data.get_configs_response.config, model =>
          Scanconfig.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_credentials_response)) {
        data.credential_list = map(
          trash_data.get_credentials_response.credential,
          model => Credential.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_filters_response)) {
        data.filter_list = map(trash_data.get_filters_response.filter, model =>
          Filter.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_groups_response)) {
        data.group_list = map(trash_data.get_groups_response.group, model =>
          Group.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_notes_response)) {
        data.note_list = map(trash_data.get_notes_response.note, model =>
          Note.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_overrides_response)) {
        data.override_list = map(
          trash_data.get_overrides_response.override,
          model => Override.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_permissions_response)) {
        data.permission_list = map(
          trash_data.get_permissions_response.permission,
          model => Permission.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_port_lists_response)) {
        data.port_list_list = map(
          trash_data.get_port_lists_response.port_list,
          model => PortList.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_report_formats_response)) {
        data.report_format_list = map(
          trash_data.get_report_formats_response.report_format,
          model => ReportFormat.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_roles_response)) {
        data.role_list = map(trash_data.get_roles_response.role, model =>
          Role.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_scanners_response)) {
        data.scanner_list = map(
          trash_data.get_scanners_response.scanner,
          model => Scanner.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_schedules_response)) {
        data.schedule_list = map(
          trash_data.get_schedules_response.schedule,
          model => Schedule.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_tags_response)) {
        data.tag_list = map(trash_data.get_tags_response.tag, model =>
          Tag.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_targets_response)) {
        data.target_list = map(trash_data.get_targets_response.target, model =>
          Target.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_tasks_response)) {
        data.task_list = map(trash_data.get_tasks_response.task, model =>
          Task.fromElement(model),
        );
      }
      if (isDefined(trash_data.get_tickets_response)) {
        data.ticket_list = map(trash_data.get_tickets_response.ticket, model =>
          Ticket.fromElement(model),
        );
      }
      return response.setData(data);
    });
  }
}

registerCommand('trashcan', Trashcan);

// vim: set ts=2 sw=2 tw=80:
