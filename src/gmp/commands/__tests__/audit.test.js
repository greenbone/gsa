/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {AuditCommand, AuditsCommand} from 'gmp/commands/audits';
import {
  createActionResultResponse,
  createEntityResponse,
  createEntitiesResponse,
  createHttp,
} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';
import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';
import {
  HOSTS_ORDERING_RANDOM,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_KEEP,
} from 'gmp/models/task';

describe('AuditCommand tests', () => {
  test('should create new audit', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditCommand(fakeHttp);
    return cmd
      .create({
        alterable: 0,
        applyOverrides: 0,
        autoDelete: AUTO_DELETE_KEEP,
        comment: 'comment',
        policyId: 'c1',
        hostsOrdering: HOSTS_ORDERING_RANDOM,
        inAssets: 0,
        maxChecks: 10,
        maxHosts: 10,
        minQod: 70,
        name: 'foo',
        scannerId: OPENVAS_DEFAULT_SCANNER_ID,
        scannerType: OPENVAS_SCANNER_TYPE,
        targetId: 't1',
      })
      .then(resp => {
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
  });

  test('should create new audit with all parameters', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditCommand(fakeHttp);
    return cmd
      .create({
        addTag: 1,
        alterable: 0,
        alertIds: ['a1', 'a2'],
        applyOverrides: 0,
        autoDelete: AUTO_DELETE_KEEP,
        autoDeleteData: AUTO_DELETE_KEEP_DEFAULT_VALUE,
        comment: 'comment',
        policyId: 'c1',
        hostsOrdering: HOSTS_ORDERING_RANDOM,
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
      })
      .then(resp => {
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
  });

  test('should save audit', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditCommand(fakeHttp);
    return cmd
      .save({
        alterable: 0,
        applyOverrides: 0,
        autoDelete: AUTO_DELETE_KEEP,
        comment: 'comment',
        hostsOrdering: HOSTS_ORDERING_RANDOM,
        id: 'audit1',
        inAssets: 0,
        maxChecks: 10,
        maxHosts: 10,
        minQod: 70,
        name: 'foo',
      })
      .then(resp => {
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
  });

  test('should save audit with all parameters', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditCommand(fakeHttp);
    return cmd
      .save({
        alterable: 0,
        alertIds: ['a1', 'a2'],
        applyOverrides: 0,
        autoDelete: AUTO_DELETE_KEEP,
        autoDeleteData: AUTO_DELETE_KEEP_DEFAULT_VALUE,
        comment: 'comment',
        policyId: 'c1',
        hostsOrdering: HOSTS_ORDERING_RANDOM,
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
      })
      .then(resp => {
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
  });

  test('should return single audit', () => {
    const response = createEntityResponse('task', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_task',
          task_id: 'foo',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });
});

describe('AuditsCommand tests', () => {
  test('should return all audits', () => {
    const response = createEntitiesResponse('task', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditsCommand(fakeHttp);
    return cmd.getAll().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_tasks',
          filter: ALL_FILTER.toFilterString(),
          usage_type: 'audit',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should return audits', () => {
    const response = createEntitiesResponse('task', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditsCommand(fakeHttp);
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_tasks',
          usage_type: 'audit',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });
});
