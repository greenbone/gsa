/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {feedStatusRejection} from 'gmp/commands/feedstatus';
import HttpCommand from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import Credential from 'gmp/models/credential';
import {Date} from 'gmp/models/date';
import Model, {
  Element,
  ModelElement,
  parseModelFromElement,
} from 'gmp/models/model';
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
  alertEmail: string;
  autoStart:
    | typeof IMMEDIATELY_START_VALUE
    | typeof SCHEDULE_START_VALUE
    | typeof DONT_START_VALUE;
  esxiCredential: string;
  scanConfigId: string;
  scanConfigs: string[];
  smbCredential: string;
  sshCredential: string;
  sshPort: number;
  startDate: Date;
  startHour: string;
  startMinute: string;
  startTimezone: string;
  targetHosts: string;
  taskName: string;
}

interface RunModifyTaskArguments {
  taskId: string;
  alertEmail: string;
  reschedule: YesNo;
  startDate: Date;
  startHour: number;
  startMinute: number;
  startTimezone: string;
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
    alertEmail,
    autoStart,
    esxiCredential,
    scanConfigId,
    smbCredential,
    sshCredential,
    sshPort,
    startDate,
    startHour,
    startMinute,
    startTimezone,
    targetHosts,
    taskName,
  }: RunQuickTaskArguments) {
    try {
      return await this.httpPost({
        'event_data:alert_email': alertEmail,
        'event_data:auto_start': autoStart,
        'event_data:config_id': scanConfigId,
        'event_data:esxi_credential': esxiCredential,
        'event_data:smb_credential': smbCredential,
        'event_data:ssh_credential': sshCredential,
        'event_data:ssh_port': sshPort,
        'event_data:start_day': startDate.date(),
        'event_data:start_month': startDate.month() + 1,
        'event_data:start_year': startDate.year(),
        'event_data:start_hour': startHour,
        'event_data:start_minute': startMinute,
        'event_data:start_timezone': startTimezone,
        'event_data:target_hosts': targetHosts,
        'event_data:task_name': taskName,
        cmd: 'run_wizard',
        name: 'quick_task',
      });
    } catch (rejection) {
      await feedStatusRejection(this.http, rejection);
    }
  }

  runModifyTask({
    taskId,
    alertEmail,
    reschedule,
    startDate,
    startHour,
    startMinute,
    startTimezone,
  }: RunModifyTaskArguments) {
    return this.httpPost({
      'event_data:alert_email': alertEmail,
      'event_data:reschedule': reschedule,
      'event_data:start_hour': startHour,
      'event_data:start_minute': startMinute,
      'event_data:start_day': startDate.date(),
      'event_data:start_month': startDate.month() + 1,
      'event_data:start_year': startDate.year(),
      'event_data:start_timezone': startTimezone,
      'event_data:task_id': taskId,
      cmd: 'run_wizard',
      name: 'modify_task',
    });
  }
}

export default WizardCommand;
