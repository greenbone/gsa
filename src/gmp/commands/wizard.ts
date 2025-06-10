/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {feedStatusRejection} from 'gmp/commands/feedstatus';
import HttpCommand from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import Model, {Element, ModelElement, parseModelFromElement} from 'gmp/model';
import Credential from 'gmp/models/credential';
import {Date} from 'gmp/models/date';
import {SettingElement} from 'gmp/models/setting';
import Settings from 'gmp/models/settings';
import Task from 'gmp/models/task';
import {forEach, map} from 'gmp/utils/array';

function convertData(prefix: string, data: {}, fields: string[]) {
  const converted = {};
  for (const name of fields) {
    if (data.hasOwnProperty(name)) {
      converted[prefix + ':' + name] = data[name];
    }
  }
  return converted;
}

const EVENT_DATA_QUICK_FIRST_SCAN_FIELDS = [
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

const EVENT_DATA_QUICK_TASK_FIELDS = [
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

const EVENT_DATA_MODIFY_TASK_FIELDS = [
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

interface RunWizardResponseData extends XmlResponseData {
  client_address: string;
  wizard: {
    run_wizard_response: {
      response: {
        get_settings_response: {
          setting: SettingElement | SettingElement[];
        };
        get_configs_response: {
          config: ModelElement | ModelElement[];
        };
        get_credentials_response: {
          credential: ModelElement | ModelElement[];
        };
        get_tasks_response: {
          task: ModelElement | ModelElement[];
        };
      };
    };
  };
}

interface TaskResponseData {
  clientAddress: string;
  settings: Settings;
}

interface AdvancedTaskResponseData extends TaskResponseData {
  credentials: Credential[];
  scanConfigs: Model[];
}

interface ModifyTaskResponseData {
  settings: Settings;
  tasks: Task[];
}

export const IMMEDIATELY_START_VALUE = '2';
export const SCHEDULE_START_VALUE = '1';
export const DONT_START_VALUE = '0';

interface RunQuickFirstScanArguments {
  hosts: string;
}

interface RunQuickTaskArguments {
  alert_email: string;
  auto_start:
    | typeof IMMEDIATELY_START_VALUE
    | typeof SCHEDULE_START_VALUE
    | typeof DONT_START_VALUE;
  config_id: string;
  start_date: Date;
  esxi_credential: string;
  scan_configs: string[];
  smb_credential: string;
  ssh_credential: string;
  ssh_port: number;
  start_hour: string;
  start_minute: string;
  start_timezone: string;
  target_hosts: string;
  task_name: string;
}

interface RunModifyTaskArguments {
  task_id: string;
  alert_email: string;
  reschedule: YesNo;
  start_date: Date;
  start_hour: number;
  start_minute: number;
  start_timezone: string;
}

class WizardCommand extends HttpCommand {
  constructor(http: GmpHttp) {
    super(http, {cmd: 'wizard'});
  }

  async task() {
    const response = await this.httpGet({
      name: 'quick_first_scan',
    });
    const {data} = response as Response<RunWizardResponseData, XmlMeta>;
    const settings = new Settings();
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
    return response.setData<TaskResponseData>({
      settings,
      clientAddress: data.client_address,
    });
  }

  async advancedTask() {
    const response = await this.httpGet({
      name: 'quick_task',
    });
    const {data} = response as Response<RunWizardResponseData, XmlMeta>;
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
    const scanConfigs = map(resp.get_configs_response.config, config => {
      return parseModelFromElement(config, 'scanconfig');
    });
    const credentials = map(resp.get_credentials_response.credential, cred => {
      return Credential.fromElement<Credential>(cred as Element);
    });
    return response.setData<AdvancedTaskResponseData>({
      settings,
      clientAddress: data.client_address,
      credentials,
      scanConfigs,
    });
  }

  async modifyTask() {
    const response = await this.httpGet({
      name: 'modify_task',
    });
    const {data} = response as Response<RunWizardResponseData, XmlMeta>;
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
    const tasks = map<ModelElement, Task>(resp.get_tasks_response.task, task =>
      Task.fromElement(task as Element),
    ).filter(currentTask => !currentTask.isContainer());
    return response.setData<ModifyTaskResponseData>({settings, tasks});
  }

  async runQuickFirstScan(args: RunQuickFirstScanArguments) {
    try {
      return await this.httpPost({
        ...convertData('event_data', args, EVENT_DATA_QUICK_FIRST_SCAN_FIELDS),
        cmd: 'run_wizard',
        name: 'quick_first_scan',
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
  }

  async runQuickTask(args: RunQuickTaskArguments) {
    const {start_date, ...other} = args;
    const event_data = convertData(
      'event_data',
      other,
      EVENT_DATA_QUICK_TASK_FIELDS,
    );

    event_data['event_data:start_day'] = start_date.date();
    event_data['event_data:start_month'] = start_date.month() + 1;
    event_data['event_data:start_year'] = start_date.year();

    try {
      return await this.httpPost({
        ...event_data,
        cmd: 'run_wizard',
        name: 'quick_task',
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
  }

  runModifyTask(args: RunModifyTaskArguments) {
    const {start_date, ...other} = args;

    const event_data = convertData(
      'event_data',
      other,
      EVENT_DATA_MODIFY_TASK_FIELDS,
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
