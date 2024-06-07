/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';

import {map} from 'gmp/utils/array';

import registerCommand from 'gmp/command';
import {parseModelFromElement} from 'gmp/model';

import Alert from 'gmp/models/alert';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.alerts');

const event_data_fields = ['status', 'feed_event', 'secinfo_type'];
const method_data_fields = [
  'composer_ignore_pagination',
  'composer_include_notes',
  'composer_include_overrides',
  'details_url',
  'to_address',
  'from_address',
  'subject',
  'notice',
  'notice_report_format',
  'notice_report_config',
  'message',
  'notice_attach_format',
  'notice_attach_config',
  'message_attach',
  'recipient_credential',
  'submethod', // FIXME remove constant submethod!!!
  'URL',
  'snmp_community',
  'snmp_agent',
  'snmp_message',
  'defense_center_ip',
  'defense_center_port',
  'pkcs12',
  'pkcs12_credential',
  'verinice_server_url',
  'verinice_server_credential',
  'verinice_server_report_config',
  'verinice_server_report_format',
  'start_task_task',
  'send_host',
  'send_port',
  'send_report_config',
  'send_report_format',
  'scp_credential',
  'scp_host',
  'scp_known_hosts',
  'scp_path',
  'scp_port',
  'scp_report_config',
  'scp_report_format',
  'smb_credential',
  'smb_file_path',
  'smb_max_protocol',
  'smb_report_config',
  'smb_report_format',
  'smb_share_path',
  'tp_sms_hostname',
  'tp_sms_credential',
  'tp_sms_tls_certificate',
  'tp_sms_tls_workaround',
  'delta_type',
  'delta_report_id',
  'report_formats',
  'report_configs',
  'vfire_base_url',
  'vfire_credential',
  'vfire_session_type',
  'vfire_client_id',
  'vfire_call_partition_name',
  'vfire_call_description',
  'vfire_call_template_name',
  'vfire_call_type_name',
  'vfire_call_impact_name',
  'vfire_call_urgency_name',
];
const condition_data_fields = [
  'severity',
  'direction',
  'at_least_filter_id',
  'at_least_count',
  'filter_direction', // FIXME filter_direction is constant
  'filter_id',
  'count',
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

class AlertCommand extends EntityCommand {
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
      report_format_ids,
      report_config_ids,
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
      'report_format_ids:': report_format_ids,
      'report_config_ids:': report_config_ids,
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
      report_format_ids = [],
      report_config_ids = [],
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
      'report_format_ids:':
        report_format_ids.length > 0 ? report_format_ids : undefined,
      'report_config_ids:':
        report_config_ids.length > 0 ? report_config_ids : undefined,
    };
    log.debug('Saving alert', args, data);
    return this.action(data);
  }

  newAlertSettings() {
    // should be removed after all corresponding omp commands are implemented
    return this.httpGet({
      cmd: 'new_alert',
    }).then(response => {
      const {new_alert} = response.data;
      new_alert.report_formats = map(
        new_alert.get_report_formats_response.report_format,
        format => parseModelFromElement(format, 'reportformat'),
      );
      new_alert.report_configs = map(
        new_alert.get_report_configs_response.report_config,
        config => parseModelFromElement(config, 'reportconfig'),
      );
      new_alert.credentials = map(
        new_alert.get_credentials_response.credential,
        credential => Credential.fromElement(credential),
      );
      new_alert.tasks = map(new_alert.get_tasks_response.task, task =>
        parseModelFromElement(task, 'task'),
      ); // don't use Task here to avoid cyclic dependencies
      new_alert.filters = map(new_alert.get_filters_response.filter, filter =>
        Filter.fromElement(filter),
      );
      return response.setData(new_alert);
    });
  }

  editAlertSettings({id}) {
    return this.httpGet({
      cmd: 'edit_alert',
      id,
    }).then(response => {
      const {edit_alert} = response.data;

      edit_alert.alert = Alert.fromElement(
        edit_alert.get_alerts_response.alert,
      );
      delete edit_alert.get_alerts_response;

      edit_alert.report_formats = map(
        edit_alert.get_report_formats_response.report_format,
        format => parseModelFromElement(format, 'reportformat'),
      );
      delete edit_alert.get_report_formats_response;

      edit_alert.report_configs = map(
        edit_alert.get_report_configs_response.report_config,
        config => parseModelFromElement(config, 'reportconfig'),
      );
      delete edit_alert.get_report_configs_response;

      edit_alert.credentials = map(
        edit_alert.get_credentials_response.credential,
        credential => Credential.fromElement(credential),
      );
      delete edit_alert.get_credentials_response;

      edit_alert.tasks = map(edit_alert.get_tasks_response.task, task =>
        parseModelFromElement(task, 'task'),
      ); // don't use Task here to avoid cyclic dependencies
      delete edit_alert.get_tasks_response;

      edit_alert.filters = map(edit_alert.get_filters_response.filter, filter =>
        Filter.fromElement(filter),
      );
      delete edit_alert.get_filters_response;

      delete edit_alert.next;

      return response.setData(edit_alert);
    });
  }

  test({id}) {
    return this.httpPost({
      cmd: 'test_alert',
      id,
    });
  }

  getElementFromRoot(root) {
    return root.get_alert.get_alerts_response.alert;
  }
}

class AlertsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'alert', Alert);
  }

  getEntitiesResponse(root) {
    return root.get_alerts.get_alerts_response;
  }
}

registerCommand('alert', AlertCommand);
registerCommand('alerts', AlertsCommand);

// vim: set ts=2 sw=2 tw=80:
