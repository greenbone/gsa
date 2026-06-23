/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OverrideCommand from 'gmp/commands/override';
import {
  createHttp,
  createEntityResponse,
  createActionResultResponse,
} from 'gmp/commands/testing';
import {
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  ANY,
  MANUAL,
} from 'gmp/models/override';

describe('OverrideCommand tests', () => {
  test('should request single override', async () => {
    const response = createEntityResponse('override', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new OverrideCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_override',
        override_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create a simple override', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new OverrideCommand(fakeHttp);
    const resp = await cmd.create({
      text: 'override text',
      oid: 'oid',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_override',
        new_severity: -1,
        oid: 'oid',
        text: 'override text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create an override with details', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new OverrideCommand(fakeHttp);
    const resp = await cmd.create({
      active: ACTIVE_YES_FOR_NEXT_VALUE,
      custom_severity: true,
      days: 15,
      hosts_manual: 'host1,host2',
      hosts: MANUAL,
      newSeverity: 4.5,
      oid: 'oid',
      port: MANUAL,
      port_manual: '22/tcp',
      result_id: MANUAL,
      result_uuid: 'result-uuid',
      severity: 'High',
      task_id: MANUAL,
      task_uuid: 'task-uuid',
      text: 'override text',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        active: '1',
        cmd: 'create_override',
        hosts: 'host1,host2',
        new_severity: 4.5,
        oid: 'oid',
        port: '22/tcp',
        result_id: 'result-uuid',
        severity: 'High',
        task_id: 'task-uuid',
        text: 'override text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save a simple override', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new OverrideCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'foo',
      text: 'updated override text',
      oid: 'oid',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_override',
        new_severity: -1,
        oid: 'oid',
        override_id: 'foo',
        text: 'updated override text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to save an override with details', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new OverrideCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'foo',
      active: ACTIVE_YES_UNTIL_VALUE,
      days: 15,
      hosts_manual: 'host1,host2',
      hosts: MANUAL,
      new_severity_from_list: 0,
      oid: 'oid',
      port: MANUAL,
      port_manual: '22/tcp',
      result_id: ANY,
      result_uuid: 'result-uuid',
      severity: 'High',
      task_id: ANY,
      task_uuid: 'task-uuid',
      text: 'updated override text',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        active: 15,
        cmd: 'save_override',
        hosts: 'host1,host2',
        new_severity: 0,
        oid: 'oid',
        override_id: 'foo',
        port: '22/tcp',
        severity: 'High',
        text: 'updated override text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });
});
