/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AlertCommand from 'gmp/commands/alert';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import {
  CONDITION_TYPE_ALWAYS,
  EVENT_TYPE_NEW_SECINFO,
  METHOD_TYPE_EMAIL,
} from 'gmp/models/alert';
import {YES_VALUE} from 'gmp/parser';

describe('AlertCommand tests', () => {
  test('should get an alert', async () => {
    const response = createEntityResponse('alert', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const result = await cmd.get({id: 'target_id1'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_alert',
        alert_id: 'target_id1',
      },
    });
    expect(result.data.id).toEqual('foo');
  });

  test('should allow to clone an alert', async () => {
    const response = createActionResultResponse({id: 'cloned_id'});
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const result = await cmd.clone({id: 'target_id1'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        id: 'target_id1',
        resource_type: 'alert',
      },
    });
    expect(result.data.id).toEqual('cloned_id');
  });

  test('should allow to delete an alert', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const result = await cmd.delete({id: 'target_id1'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_alert',
        alert_id: 'target_id1',
      },
    });
    expect(result).toBeUndefined();
  });

  test('should create alert', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'Test Alert',
      comment: 'This is a test alert',
      event: EVENT_TYPE_NEW_SECINFO,
      condition: CONDITION_TYPE_ALWAYS,
      filter_id: 'filter_id1',
      method: METHOD_TYPE_EMAIL,
      active: true,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_alert',
        name: 'Test Alert',
        comment: 'This is a test alert',
        active: YES_VALUE,
        event: EVENT_TYPE_NEW_SECINFO,
        condition: CONDITION_TYPE_ALWAYS,
        filter_id: 'filter_id1',
        method: METHOD_TYPE_EMAIL,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should save alert', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'target_id1',
      name: 'Test Alert',
      comment: 'This is a test alert',
      event: EVENT_TYPE_NEW_SECINFO,
      condition: CONDITION_TYPE_ALWAYS,
      filter_id: 'filter_id1',
      method: METHOD_TYPE_EMAIL,
      active: true,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_alert',
        alert_id: 'target_id1',
        name: 'Test Alert',
        comment: 'This is a test alert',
        active: YES_VALUE,
        event: EVENT_TYPE_NEW_SECINFO,
        condition: CONDITION_TYPE_ALWAYS,
        filter_id: 'filter_id1',
        method: METHOD_TYPE_EMAIL,
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to get new alert settings', async () => {
    const response = createResponse({
      new_alert: {
        get_report_formats_response: {
          report_format: [{_id: 'rf1'}, {_id: 'rf2'}],
        },
        get_report_configs_response: {
          report_config: [{_id: 'rc1'}, {_id: 'rc2'}],
        },
        get_credentials_response: {
          credential: [{_id: 'cr1'}, {_id: 'cr2'}],
        },
        get_tasks_response: {
          task: [{_id: 't1'}, {_id: 't2'}],
        },
        get_filters_response: {
          filter: [{_id: 'f1'}, {_id: 'f2'}],
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const resp = await cmd.newAlertSettings();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'new_alert',
      },
    });
    expect(resp.data.report_formats.length).toBe(2);
    expect(resp.data.report_configs.length).toBe(2);
    expect(resp.data.credentials.length).toBe(2);
    expect(resp.data.tasks.length).toBe(2);
    expect(resp.data.filters.length).toBe(2);
  });

  test('should allow to get edit alert settings', async () => {
    const response = createResponse({
      edit_alert: {
        get_alerts_response: {
          alert: {_id: 'a1'},
        },
        get_report_formats_response: {
          report_format: [{_id: 'rf1'}, {_id: 'rf2'}],
        },
        get_report_configs_response: {
          report_config: [{_id: 'rc1'}, {_id: 'rc2'}],
        },
        get_credentials_response: {
          credential: [{_id: 'cr1'}, {_id: 'cr2'}],
        },
        get_tasks_response: {
          task: [{_id: 't1'}, {_id: 't2'}],
        },
        get_filters_response: {
          filter: [{_id: 'f1'}, {_id: 'f2'}],
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new AlertCommand(fakeHttp);
    const resp = await cmd.editAlertSettings({id: 'alert_id1'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'edit_alert',
        alert_id: 'alert_id1',
      },
    });
    expect(resp.data.alert.id).toBe('a1');
    expect(resp.data.report_formats.length).toBe(2);
    expect(resp.data.report_configs.length).toBe(2);
    expect(resp.data.credentials.length).toBe(2);
    expect(resp.data.tasks.length).toBe(2);
    expect(resp.data.filters.length).toBe(2);
  });
});
