/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeAll, afterAll} from '@gsa/testing';
import AuditCommand from 'gmp/commands/audit';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttpError,
  createHttpMany,
  createHttp,
} from 'gmp/commands/testing';
import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';
import {
  HOSTS_ORDERING_RANDOM,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_KEEP,
} from 'gmp/models/task';
import logger, {type LogLevel} from 'gmp/log';

let logLevel: LogLevel;

beforeAll(() => {
  logLevel = logger.level;
  logger.setDefaultLevel('silent');
});

afterAll(() => {
  logger.setDefaultLevel(logLevel);
});

describe('AuditCommand tests', () => {
  test('should create new audit', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.create({
      alterable: 0,
      applyOverrides: 0,
      autoDelete: AUTO_DELETE_KEEP,
      comment: 'comment',
      policyId: 'c1',
      inAssets: 0,
      maxChecks: 10,
      maxHosts: 10,
      minQod: 70,
      name: 'foo',
      scannerId: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
      targetId: 't1',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        add_tag: undefined,
        'alert_ids:': [],
        alterable: 0,
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        auto_delete_data: undefined,
        cmd: 'create_task',
        comment: 'comment',
        config_id: 'c1',
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
        name: 'foo',
        scanner_id: OPENVAS_DEFAULT_SCANNER_ID,
        scanner_type: OPENVAS_SCANNER_TYPE,
        schedule_id: undefined,
        schedule_periods: undefined,
        tag_id: undefined,
        target_id: 't1',
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create new audit with all parameters', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.create({
      addTag: 1,
      alterable: 0,
      alertIds: ['a1', 'a2'],
      applyOverrides: 0,
      autoDelete: AUTO_DELETE_KEEP,
      autoDeleteData: AUTO_DELETE_KEEP_DEFAULT_VALUE,
      comment: 'comment',
      policyId: 'c1',
      inAssets: 0,
      maxChecks: 10,
      maxHosts: 10,
      minQod: 70,
      name: 'foo',
      scannerId: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
      scheduleId: 's1',
      schedulePeriods: 1,
      tagId: 't1',
      targetId: 't1',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        add_tag: 1,
        'alert_ids:': ['a1', 'a2'],
        alterable: 0,
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
        cmd: 'create_task',
        comment: 'comment',
        config_id: 'c1',
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
        name: 'foo',
        scanner_id: OPENVAS_DEFAULT_SCANNER_ID,
        scanner_type: OPENVAS_SCANNER_TYPE,
        schedule_id: 's1',
        schedule_periods: 1,
        tag_id: 't1',
        target_id: 't1',
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save audit', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.save({
      alterable: 0,
      applyOverrides: 0,
      autoDelete: AUTO_DELETE_KEEP,
      comment: 'comment',
      id: 'audit1',
      inAssets: 0,
      maxChecks: 10,
      maxHosts: 10,
      minQod: 70,
      name: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'alert_ids:': [],
        alterable: 0,
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        auto_delete_data: undefined,
        cmd: 'save_task',
        comment: 'comment',
        config_id: 0,
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
        name: 'foo',
        scanner_id: 0,
        scanner_type: undefined,
        schedule_id: 0,
        schedule_periods: undefined,
        task_id: 'audit1',
        target_id: 0,
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save audit with all parameters', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.save({
      alterable: 0,
      alertIds: ['a1', 'a2'],
      applyOverrides: 0,
      autoDelete: AUTO_DELETE_KEEP,
      autoDeleteData: AUTO_DELETE_KEEP_DEFAULT_VALUE,
      comment: 'comment',
      policyId: 'c1',
      id: 'audit1',
      inAssets: 0,
      maxChecks: 10,
      maxHosts: 10,
      minQod: 70,
      name: 'foo',
      scannerId: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
      scheduleId: 's1',
      schedulePeriods: 1,
      targetId: 't1',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'alert_ids:': ['a1', 'a2'],
        alterable: 0,
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
        cmd: 'save_task',
        comment: 'comment',
        config_id: 'c1',
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
        name: 'foo',
        scanner_id: OPENVAS_DEFAULT_SCANNER_ID,
        scanner_type: OPENVAS_SCANNER_TYPE,
        schedule_id: 's1',
        schedule_periods: 1,
        task_id: 'audit1',
        target_id: 't1',
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should return single audit', async () => {
    const response = createEntityResponse('task', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_task',
        task_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should start audit and return the updated audit', async () => {
    const fakeHttp = createHttpMany([
      createActionResultResponse(),
      createEntityResponse('task', {_id: 'audit1'}),
    ]);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.start({id: 'audit1'});

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'start_task',
        task_id: 'audit1',
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'get', {
      args: {
        cmd: 'get_task',
        task_id: 'audit1',
      },
    });
    expect(resp.data.id).toEqual('audit1');
  });

  test('should stop audit and return the updated audit', async () => {
    const fakeHttp = createHttpMany([
      createActionResultResponse(),
      createEntityResponse('task', {_id: 'audit1'}),
    ]);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.stop({id: 'audit1'});

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'stop_task',
        task_id: 'audit1',
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'get', {
      args: {
        cmd: 'get_task',
        task_id: 'audit1',
      },
    });
    expect(resp.data.id).toEqual('audit1');
  });

  test('should resume audit and return the updated audit', async () => {
    const fakeHttp = createHttpMany([
      createActionResultResponse(),
      createEntityResponse('task', {_id: 'audit1'}),
    ]);

    const cmd = new AuditCommand(fakeHttp);
    const resp = await cmd.resume({id: 'audit1'});

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'resume_task',
        task_id: 'audit1',
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'get', {
      args: {
        cmd: 'get_task',
        task_id: 'audit1',
      },
    });
    expect(resp.data.id).toEqual('audit1');
  });

  test('should rethrow errors from audit lifecycle actions', async () => {
    const error = new Error('Failed to change audit state');

    for (const action of ['start', 'stop', 'resume'] as const) {
      const cmd = new AuditCommand(createHttpError(error));

      await expect(cmd[action]({id: 'audit1'})).rejects.toThrow(
        'Failed to change audit state',
      );
    }
  });

  test('should get the audit element from the response root', () => {
    const cmd = new AuditCommand(createHttp());
    const task = {id: 'audit1', name: 'Audit'};
    const root = {
      get_task: {
        get_tasks_response: {
          task,
        },
      },
    };

    expect(cmd.getElementFromRoot(root)).toEqual(task);
  });
});
