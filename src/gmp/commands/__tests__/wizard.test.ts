/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createHttp, createResponse} from 'gmp/commands/testing';
import WizardCommand, {IMMEDIATELY_START_VALUE} from 'gmp/commands/wizard';
import date from 'gmp/models/date';

describe('Wizard Command', () => {
  test('should return expected data for task', async () => {
    const response = createResponse({
      client_address: '127.0.0.1',
      wizard: {
        run_wizard_response: {
          response: {
            get_settings_response: {
              setting: [{name: 'foo', _id: '1', comment: '', value: 'bar'}],
            },
          },
        },
      },
    });
    const http = createHttp(response);
    const wizard = new WizardCommand(http);

    const result = await wizard.task();
    const {settings, clientAddress} = result.data;
    // @ts-expect-error
    expect(settings.get('foo')?.value).toEqual('bar');
    expect(clientAddress).toEqual('127.0.0.1');
  });

  test('should return expected data for advancedTask', async () => {
    const response = createResponse({
      client_address: '127.0.0.1',
      wizard: {
        run_wizard_response: {
          response: {
            get_settings_response: {
              setting: [{name: 'foo', _id: '1', comment: '', value: 'bar'}],
            },
            get_configs_response: {
              config: [{_id: '1', name: 'ScanConfig'}],
            },
            get_credentials_response: {
              credential: [{_id: '2', name: 'Credential'}],
            },
          },
        },
      },
    });
    const http = createHttp(response);
    const wizard = new WizardCommand(http);

    const result = await wizard.advancedTask();
    const {settings, scanConfigs, credentials, clientAddress} = result.data;
    // @ts-expect-error
    expect(settings.get('foo').value).toEqual('bar');
    expect(scanConfigs[0].id).toEqual('1');
    expect(credentials[0].id).toEqual('2');
    expect(clientAddress).toEqual('127.0.0.1');
  });

  test('should return expected data for modifyTask', async () => {
    const response = createResponse({
      wizard: {
        run_wizard_response: {
          response: {
            get_settings_response: {
              setting: [{name: 'foo', _id: '1', comment: '', value: 'bar'}],
            },
            get_tasks_response: {
              task: [
                {
                  _id: 'task1',
                  name: 'Task',
                  isContainer: () => false,
                },
              ],
            },
          },
        },
      },
    });
    const http = createHttp(response);
    const wizard = new WizardCommand(http);

    const result = await wizard.modifyTask();
    const {settings, tasks} = result.data;
    // @ts-expect-error
    expect(settings.get('foo').value).toEqual('bar');
    expect(tasks[0].id).toEqual('task1');
  });

  test('should create a quick first scan', async () => {
    const response = createResponse({});
    const http = createHttp(response);
    const wizard = new WizardCommand(http);
    await wizard.runQuickFirstScan({hosts: '127.0.0.1'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        'event_data:hosts': '127.0.0.1',
        cmd: 'run_wizard',
        name: 'quick_first_scan',
      },
    });
  });

  test('should create an advanced task', async () => {
    const response = createResponse({});
    const http = createHttp(response);
    const wizard = new WizardCommand(http);
    await wizard.runQuickTask({
      alertEmail: 'a@b.c',
      autoStart: IMMEDIATELY_START_VALUE,
      scanConfigId: 'cfg',
      esxiCredential: 'esxi',
      scanConfigs: [],
      smbCredential: 'smb',
      sshCredential: 'ssh',
      sshPort: 22,
      startDate: date('2025-01-01'),
      startHour: '10',
      startMinute: '30',
      startTimezone: 'UTC',
      targetHosts: '127.0.0.1',
      taskName: 'task',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        'event_data:alert_email': 'a@b.c',
        'event_data:auto_start': '2',
        'event_data:config_id': 'cfg',
        'event_data:esxi_credential': 'esxi',
        'event_data:smb_credential': 'smb',
        'event_data:ssh_credential': 'ssh',
        'event_data:ssh_port': 22,
        'event_data:start_day': 1,
        'event_data:start_hour': '10',
        'event_data:start_minute': '30',
        'event_data:start_month': 1,
        'event_data:start_timezone': 'UTC',
        'event_data:start_year': 2025,
        'event_data:target_hosts': '127.0.0.1',
        'event_data:task_name': 'task',
        cmd: 'run_wizard',
        name: 'quick_task',
      },
    });
  });

  test('should modify a task', async () => {
    const response = createResponse({});
    const http = createHttp(response);
    const wizard = new WizardCommand(http);
    await wizard.runModifyTask({
      task_id: 'id',
      alert_email: 'a@b.c',
      reschedule: 1,
      start_date: date('2025-01-01'),
      start_hour: 10,
      start_minute: 30,
      start_timezone: 'UTC',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        'event_data:alert_email': 'a@b.c',
        'event_data:reschedule': 1,
        'event_data:start_day': 1,
        'event_data:start_hour': 10,
        'event_data:start_minute': 30,
        'event_data:start_month': 1,
        'event_data:start_timezone': 'UTC',
        'event_data:start_year': 2025,
        'event_data:task_id': 'id',
        cmd: 'run_wizard',
        name: 'modify_task',
      },
    });
  });
});
