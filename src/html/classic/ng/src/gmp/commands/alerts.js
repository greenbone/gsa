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

import {map, extend, convert_data} from '../../utils.js';
import logger from '../../log.js';

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
  'scp_report_format',
];
const condition_data_fields = [
  'severity', 'direction', 'at_least_filter_id',
  'at_least_count', 'filter_direction', //FIXME filter_direction is constant
  'filter_id', 'count',
];

export class AlertCommand extends EntityCommand {

  constructor(http) {
    super(http, 'get_alert', 'alert_id', Alert);
  }

  create(args) {
    let {name, comment = '', event, event_data = {}, condition,
      condition_data = {}, filter_id, method, method_data = {},
    } = args;
    let data = extend({
      cmd: 'create_alert',
      next: 'get_alert',
      name,
      comment,
      event,
      condition,
      method,
      filter_id,
    }, convert_data("method_data", method_data, method_data_fields),
      convert_data("condition_data", condition_data, condition_data_fields),
      convert_data("event_data", event_data, event_data_fields));
    log.debug('Creating new alert', args, data);
    return this.httpPost(data).then(xhr => this.getModelFromResponse(xhr));
  }

  getElementFromResponse(xhr) {
    return xhr.get_alert.get_alerts_response.alert;
  }

  newAlertSettings() { // should be removed after all corresponsing omp commands are implemented
    return this.httpGet({cmd: 'new_alert'}).then(xhr => {
      let {new_alert} = xhr;
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
      return new_alert;
    });
  }
}

export class AlertsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'get_alerts', Alert);
  }

  getElementsFromResponse(response) {
    return response.alert;
  }

  getEntitiesResponse(root) {
    return root.get_alerts.get_alerts_response;
  }

  getCountsFromResponse(response) {
    let es = response.alerts;
    let ec = response.alert_count;
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }
}

register_command('alert', AlertCommand);
register_command('alerts', AlertsCommand);

// vim: set ts=2 sw=2 tw=80:
