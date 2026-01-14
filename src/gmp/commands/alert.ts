/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import logger from 'gmp/log';
import Alert, {
  type AlertConditionType,
  type AlertMethodType,
  type AlertEventType,
} from 'gmp/models/alert';
import Credential from 'gmp/models/credential';
import Filter from 'gmp/models/filter';
import {
  type default as Model,
  type ModelElement,
  parseModelFromElement,
} from 'gmp/models/model';
import {parseYesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';

interface AlertCreateParams {
  active: boolean;
  name: string;
  comment?: string;
  event: AlertEventType;
  condition: AlertConditionType;
  filter_id: string;
  method: AlertMethodType;
  report_format_ids?: string[];
  report_config_ids?: string[];
  [key: string]: unknown;
}

interface AlertSaveParams extends AlertCreateParams {
  id: string;
}

interface NewAlertElement {
  new_alert?: {
    get_report_formats_response?: {
      report_format: ModelElement | ModelElement[];
    };
    get_report_configs_response?: {
      report_config: ModelElement | ModelElement[];
    };
    get_credentials_response?: {
      credential: ModelElement | ModelElement[];
    };
    get_tasks_response?: {
      task: ModelElement | ModelElement[];
    };
    get_filters_response?: {
      filter: ModelElement | ModelElement[];
    };
  };
}

interface EditAlertElement {
  edit_alert?: {
    get_alerts_response?: {
      alert: ModelElement;
    };
    get_report_formats_response?: {
      report_format: ModelElement | ModelElement[];
    };
    get_report_configs_response?: {
      report_config: ModelElement | ModelElement[];
    };
    get_credentials_response?: {
      credential: ModelElement | ModelElement[];
    };
    get_tasks_response?: {
      task: ModelElement | ModelElement[];
    };
    get_filters_response?: {
      filter: ModelElement | ModelElement[];
    };
  };
}

interface NewAlertSettings {
  filters: Filter[];
  credentials: Credential[];
  report_formats: Model[];
  report_configs: Model[];
  tasks: Model[];
}

interface EditAlertSettings extends NewAlertSettings {
  alert: Alert;
}

const log = logger.getLogger('gmp.commands.alert');

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

const convertData = (
  prefix: string,
  data: Record<string, unknown>,
  fields: string[],
) => {
  const converted = {};
  for (const field of fields) {
    const name = prefix + '_' + field;
    if (data.hasOwnProperty(name)) {
      converted[prefix + ':' + field] = data[name];
    }
  }
  return converted;
};

class AlertCommand extends EntityCommand<Alert> {
  constructor(http: Http) {
    super(http, 'alert', Alert);
  }

  create({
    active,
    name,
    comment = '',
    event,
    condition,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    filter_id,
    method,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_format_ids,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_config_ids,
    ...other
  }: AlertCreateParams) {
    const data = {
      ...convertData('method_data', other, method_data_fields),
      ...convertData('condition_data', other, condition_data_fields),
      ...convertData('event_data', other, event_data_fields),
      cmd: 'create_alert',
      active: parseYesNo(active),
      name,
      comment,
      event,
      condition,
      method,
      filter_id,
      'report_format_ids:': report_format_ids,
      'report_config_ids:': report_config_ids,
    };
    log.debug('Creating new alert', data);
    return this.action(data);
  }

  save({
    active,
    id,
    name,
    comment = '',
    event,
    condition,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    filter_id,
    method,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_format_ids = [],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    report_config_ids = [],
    ...other
  }: AlertSaveParams) {
    const data = {
      ...convertData('method_data', other, method_data_fields),
      ...convertData('condition_data', other, condition_data_fields),
      ...convertData('event_data', other, event_data_fields),
      cmd: 'save_alert',
      id,
      active: parseYesNo(active),
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
    log.debug('Saving alert', data);
    return this.action(data);
  }

  async newAlertSettings() {
    // newAlertSettings should be removed after all corresponding gmp commands are implemented
    // and UI queries are adapted to use them directly
    const response = (await this.httpGetWithTransform({
      cmd: 'new_alert',
    })) as Response<NewAlertElement>;
    const {new_alert} = response.data;
    const newAlert: NewAlertSettings = {
      report_formats: map(
        new_alert?.get_report_formats_response?.report_format,
        format => parseModelFromElement(format, 'reportformat'),
      ),
      report_configs: map(
        new_alert?.get_report_configs_response?.report_config,
        config => parseModelFromElement(config, 'reportconfig'),
      ),
      credentials: map(
        new_alert?.get_credentials_response?.credential,
        credential => Credential.fromElement(credential),
      ),
      // don't use Task here to avoid cyclic dependencies
      tasks: map(new_alert?.get_tasks_response?.task, task =>
        parseModelFromElement(task, 'task'),
      ),
      filters: map(new_alert?.get_filters_response?.filter, filter =>
        Filter.fromElement(filter),
      ),
    };

    return response.setData(newAlert);
  }

  async editAlertSettings({id}) {
    const response = (await this.httpGetWithTransform({
      cmd: 'edit_alert',
      id,
    })) as Response<EditAlertElement>;
    const {edit_alert} = response.data;
    const editAlert: EditAlertSettings = {
      alert: Alert.fromElement(edit_alert?.get_alerts_response?.alert),
      report_formats: map(
        edit_alert?.get_report_formats_response?.report_format,
        format => parseModelFromElement(format, 'reportformat'),
      ),
      report_configs: map(
        edit_alert?.get_report_configs_response?.report_config,
        config => parseModelFromElement(config, 'reportconfig'),
      ),
      credentials: map(
        edit_alert?.get_credentials_response?.credential,
        credential => Credential.fromElement(credential),
      ),
      tasks: map(edit_alert?.get_tasks_response?.task, task =>
        parseModelFromElement(task, 'task'),
      ), // don't use Task here to avoid cyclic dependencies
      filters: map(edit_alert?.get_filters_response?.filter, filter =>
        Filter.fromElement(filter),
      ),
    };
    return response.setData(editAlert);
  }

  test({id}: {id: string}) {
    return this.httpPostWithTransform({
      cmd: 'test_alert',
      id,
    });
  }

  getElementFromRoot(root) {
    return root.get_alert.get_alerts_response.alert;
  }
}

export default AlertCommand;
