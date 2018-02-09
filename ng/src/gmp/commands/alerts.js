/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {is_defined} from '../utils/identity';
import {map} from '../utils/array';
import logger from '../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';
import Model from '../model.js';

import Alert from '../models/alert.js';
import Credential from '../models/credential.js';

const log = logger.getLogger('gmp.commands.alerts');

const event_data_fields = ['status', 'feed_event', 'secinfo_type'];
const method_data_fields = [
  'details_url', 'to_address', 'from_address',
  'subject', 'notice', 'notice_report_format', 'message',
  'notice_attach_format', 'message_attach', 'submethod', // FIXME remove constant submethod!!!
  'URL', 'snmp_community', 'snmp_agent', 'snmp_message', 'defense_center_ip',
  'defense_center_port', 'pkcs12', 'verinice_server_url',
  'verinice_server_credential', 'verinice_server_report_format',
  'start_task_task', 'send_host', 'send_port', 'send_report_format',
  'scp_credential', 'scp_host', 'scp_known_hosts', 'scp_path',
  'scp_report_format', 'smb_credential', 'smb_file_path', 'smb_report_format',
  'smb_share_path', 'tp_sms_hostname', 'tp_sms_credential',
  'tp_sms_tls_certificate', 'tp_sms_tls_workaround',
];
const condition_data_fields = [
  'severity', 'direction', 'at_least_filter_id',
  'at_least_count', 'filter_direction', // FIXME filter_direction is constant
  'filter_id', 'count',
];

function convert_data(prefix, data, fields) {
  const converted = {};
  for (const field of fields) {
    const name = prefix + '_' + field;
    if (data.hasOwnProperty(name)) {
      converted[prefix + ':' + field] = data[name];
    }
  }
  return converted;
}

export class AlertCommand extends EntityCommand {

  constructor(http) {
    super(http, 'alert', Alert);
  }

  create(args) {
    const {
      active,
      name,
      comment = '',
      event,
      condition,
      filter_id,
      method,
      ...other
    } = args;
    const data = {
      ...convert_data('method_data', other, method_data_fields),
      ...convert_data('condition_data', other, condition_data_fields),
      ...convert_data('event_data', other, event_data_fields),
      cmd: 'create_alert',
      active,
      name,
      comment,
      event,
      condition,
      method,
      filter_id,
    };
    log.debug('Creating new alert', args, data);
    return this.action(data);
  }

  save(args) {
    const {
      active,
      id,
      name,
      comment = '',
      event,
      condition,
      filter_id,
      method,
      ...other
    } = args;
    const data = {
      ...convert_data('method_data', other, method_data_fields),
      ...convert_data('condition_data', other, condition_data_fields),
      ...convert_data('event_data', other, event_data_fields),
      cmd: 'save_alert',
      id,
      active,
      name,
      comment,
      event,
      condition,
      method,
      filter_id,
    };
    log.debug('Saving alert', args, data);
    return this.action(data);
  }

  newAlertSettings() { // should be removed after all corresponding omp commands are implemented
    return this.httpGet({
      cmd: 'new_alert',
    }).then(response => {
      const {new_alert} = response.data;
      new_alert.report_formats = map(
        new_alert.get_report_formats_response.report_format,
        format => new Model(format));
      new_alert.credentials = map(
        new_alert.get_credentials_response.credential,
        credential => new Credential(credential));
      new_alert.tasks = map(
        new_alert.get_tasks_response.task, task => new Model(task)); // don't use Task here to avoid cyclic dependencies
      new_alert.filters = map(
        new_alert.get_filters_response.filter, filter => new Model(filter));
      return response.setData(new_alert);
    });
  }

  editAlertSettings({id}) {
    return this.httpGet({
      cmd: 'edit_alert',
      id,
    }).then(response => {
      const {edit_alert} = response.data;

      edit_alert.alert = new Alert(edit_alert.get_alerts_response.alert);
      delete edit_alert.get_alerts_response;

      edit_alert.report_formats = map(
        edit_alert.get_report_formats_response.report_format,
        format => new Model(format));
      delete edit_alert.get_report_formats_response;

      edit_alert.credentials = map(
        edit_alert.get_credentials_response.credential,
        credential => new Credential(credential));
      delete edit_alert.get_credentials_response;

      edit_alert.tasks = map(
        edit_alert.get_tasks_response.task, task => new Model(task)); // don't use Task here to avoid cyclic dependencies
      delete edit_alert.get_tasks_response;

      edit_alert.filters = map(
        edit_alert.get_filters_response.filter, filter => new Model(filter));
      delete edit_alert.get_filters_response;

      delete edit_alert.next;

      return response.setData(edit_alert);
    });
  }

  test({id}) {
    return this.httpPost({
      cmd: 'test_alert',
      id,
    }).then(response => {
      const {action_result} = response.data;
      const {status, details} = action_result;
      return response.setData({
        ...action_result,
        details: is_defined(details) && details.length > 0 ?
          details : undefined,
        success: status[0] === '2',
      });
    });
  }

  getElementFromRoot(root) {
    return root.get_alert.get_alerts_response.alert;
  }

}

export class AlertsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'alert', Alert);
  }

  getEntitiesResponse(root) {
    return root.get_alerts.get_alerts_response;
  }
}

register_command('alert', AlertCommand);
register_command('alerts', AlertsCommand);

// vim: set ts=2 sw=2 tw=80:
