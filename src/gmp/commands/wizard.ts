/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable @typescript-eslint/naming-convention */

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
import {YesNo} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';

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

  async runQuickFirstScan({hosts}: RunQuickFirstScanArguments) {
    try {
      return await this.httpPost({
        'event_data:hosts': hosts,
        cmd: 'run_wizard',
        name: 'quick_first_scan',
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
  }

  async runQuickTask({
    alert_email,
    auto_start,
    config_id,
    esxi_credential,
    smb_credential,
    ssh_credential,
    ssh_port,
    start_date,
    start_hour,
    start_minute,
    start_timezone,
    target_hosts,
    task_name,
  }: RunQuickTaskArguments) {
    try {
      return await this.httpPost({
        'event_data:alert_email': alert_email,
        'event_data:auto_start': auto_start,
        'event_data:config_id': config_id,
        'event_data:esxi_credential': esxi_credential,
        'event_data:smb_credential': smb_credential,
        'event_data:ssh_credential': ssh_credential,
        'event_data:ssh_port': ssh_port,
        'event_data:start_day': start_date.date(),
        'event_data:start_month': start_date.month() + 1,
        'event_data:start_year': start_date.year(),
        'event_data:start_hour': start_hour,
        'event_data:start_minute': start_minute,
        'event_data:start_timezone': start_timezone,
        'event_data:target_hosts': target_hosts,
        'event_data:task_name': task_name,
        cmd: 'run_wizard',
        name: 'quick_task',
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
  }

  runModifyTask({
    task_id,
    alert_email,
    reschedule,
    start_date,
    start_hour,
    start_minute,
    start_timezone,
  }: RunModifyTaskArguments) {
    return this.httpPost({
      'event_data:alert_email': alert_email,
      'event_data:reschedule': reschedule,
      'event_data:start_hour': start_hour,
      'event_data:start_minute': start_minute,
      'event_data:start_day': start_date.date(),
      'event_data:start_month': start_date.month() + 1,
      'event_data:start_year': start_date.year(),
      'event_data:start_timezone': start_timezone,
      'event_data:task_id': task_id,
      cmd: 'run_wizard',
      name: 'modify_task',
    });
  }
}

export default WizardCommand;
