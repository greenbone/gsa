/* Copyright (C) 2017-2022 Greenbone AG
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
import ReportConfig from 'gmp/models/reportconfig';
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
    const alerts = this.httpGet({cmd: 'get_trash_alerts'});
    const configs = this.httpGet({cmd: 'get_trash_configs'});
    const credentials = this.httpGet({cmd: 'get_trash_credentials'});
    const filters = this.httpGet({cmd: 'get_trash_filters'});
    const groups = this.httpGet({cmd: 'get_trash_groups'});
    const notes = this.httpGet({cmd: 'get_trash_notes'});
    const overrides = this.httpGet({cmd: 'get_trash_overrides'});
    const permissions = this.httpGet({cmd: 'get_trash_permissions'});
    const port_lists = this.httpGet({cmd: 'get_trash_port_lists'});
    const report_configs = this.httpGet({cmd: 'get_trash_report_configs'});
    const report_formats = this.httpGet({cmd: 'get_trash_report_formats'});
    const roles = this.httpGet({cmd: 'get_trash_roles'});
    const scanners = this.httpGet({cmd: 'get_trash_scanners'});
    const schedules = this.httpGet({cmd: 'get_trash_schedules'});
    const tags = this.httpGet({cmd: 'get_trash_tags'});
    const targets = this.httpGet({cmd: 'get_trash_targets'});
    const tasks = this.httpGet({cmd: 'get_trash_tasks'});
    const tickets = this.httpGet({cmd: 'get_trash_tickets'});
    return Promise.all([
      alerts,
      configs,
      credentials,
      filters,
      groups,
      notes,
      overrides,
      permissions,
      port_lists,
      report_configs,
      report_formats,
      roles,
      scanners,
      schedules,
      tags,
      targets,
      tasks,
      tickets,
    ]).then(
      ([
        response_alerts,
        response_configs,
        response_credentials,
        response_filters,
        response_groups,
        response_notes,
        response_overrides,
        response_permissions,
        response_port_lists,
        response_report_configs,
        response_report_formats,
        response_roles,
        response_scanners,
        response_schedules,
        response_tags,
        response_targets,
        response_tasks,
        response_tickets,
      ]) => {
        const alerts_data = response_alerts.data.get_trash;
        const configs_data = response_configs.data.get_trash;
        const credentials_data = response_credentials.data.get_trash;
        const filters_data = response_filters.data.get_trash;
        const groups_data = response_groups.data.get_trash;
        const notes_data = response_notes.data.get_trash;
        const overrides_data = response_overrides.data.get_trash;
        const permissions_data = response_permissions.data.get_trash;
        const port_lists_data = response_port_lists.data.get_trash;
        const report_configs_data = response_report_configs.data.get_trash;
        const report_formats_data = response_report_formats.data.get_trash;
        const roles_data = response_roles.data.get_trash;
        const scanners_data = response_scanners.data.get_trash;
        const schedules_data = response_schedules.data.get_trash;
        const tags_data = response_tags.data.get_trash;
        const targets_data = response_targets.data.get_trash;
        const tasks_data = response_tasks.data.get_trash;
        const tickets_data = response_tickets.data.get_trash;
        const data = {};
        if (isDefined(alerts_data.get_alerts_response)) {
          data.alert_list = map(alerts_data.get_alerts_response.alert, model =>
            Alert.fromElement(model),
          );
        }
        if (isDefined(configs_data.get_configs_response)) {
          data.config_list = map(
            configs_data.get_configs_response.config,
            model => Scanconfig.fromElement(model),
          );
        }
        if (isDefined(credentials_data.get_credentials_response)) {
          data.credential_list = map(
            credentials_data.get_credentials_response.credential,
            model => Credential.fromElement(model),
          );
        }
        if (isDefined(filters_data.get_filters_response)) {
          data.filter_list = map(
            filters_data.get_filters_response.filter,
            model => Filter.fromElement(model),
          );
        }
        if (isDefined(groups_data.get_groups_response)) {
          data.group_list = map(groups_data.get_groups_response.group, model =>
            Group.fromElement(model),
          );
        }
        if (isDefined(notes_data.get_notes_response)) {
          data.note_list = map(notes_data.get_notes_response.note, model =>
            Note.fromElement(model),
          );
        }
        if (isDefined(overrides_data.get_overrides_response)) {
          data.override_list = map(
            overrides_data.get_overrides_response.override,
            model => Override.fromElement(model),
          );
        }
        if (isDefined(permissions_data.get_permissions_response)) {
          data.permission_list = map(
            permissions_data.get_permissions_response.permission,
            model => Permission.fromElement(model),
          );
        }
        if (isDefined(port_lists_data.get_port_lists_response)) {
          data.port_list_list = map(
            port_lists_data.get_port_lists_response.port_list,
            model => PortList.fromElement(model),
          );
        }
        if (isDefined(report_configs_data.get_report_configs_response)) {
          data.report_config_list = map(
            report_configs_data.get_report_configs_response.report_config,
            model => ReportConfig.fromElement(model),
          );
        }
        if (isDefined(report_formats_data.get_report_formats_response)) {
          data.report_format_list = map(
            report_formats_data.get_report_formats_response.report_format,
            model => ReportFormat.fromElement(model),
          );
        }
        if (isDefined(roles_data.get_roles_response)) {
          data.role_list = map(roles_data.get_roles_response.role, model =>
            Role.fromElement(model),
          );
        }
        if (isDefined(scanners_data.get_scanners_response)) {
          data.scanner_list = map(
            scanners_data.get_scanners_response.scanner,
            model => Scanner.fromElement(model),
          );
        }
        if (isDefined(schedules_data.get_schedules_response)) {
          data.schedule_list = map(
            schedules_data.get_schedules_response.schedule,
            model => Schedule.fromElement(model),
          );
        }
        if (isDefined(tags_data.get_tags_response)) {
          data.tag_list = map(tags_data.get_tags_response.tag, model =>
            Tag.fromElement(model),
          );
        }
        if (isDefined(targets_data.get_targets_response)) {
          data.target_list = map(
            targets_data.get_targets_response.target,
            model => Target.fromElement(model),
          );
        }
        if (isDefined(tasks_data.get_tasks_response)) {
          data.task_list = map(tasks_data.get_tasks_response.task, model =>
            Task.fromElement(model),
          );
        }
        if (isDefined(tickets_data.get_tickets_response)) {
          data.ticket_list = map(
            tickets_data.get_tickets_response.ticket,
            model => Ticket.fromElement(model),
          );
        }
        return response_targets.setData(data);
      },
    );
  }
}

registerCommand('trashcan', Trashcan);

// vim: set ts=2 sw=2 tw=80:
