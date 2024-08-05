/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {TaskCommand} from '../tasks';
import {FeedStatus} from '../feedstatus';

import {
  createActionResultResponse,
  createHttp,
  createResponse,
} from '../testing';
import {
  HOSTS_ORDERING_RANDOM,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_KEEP,
} from 'gmp/models/task';
import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';

describe('TaskCommand tests', () => {
  test('should create new task', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TaskCommand(fakeHttp);
    return cmd
      .create({
        alterable: 0,
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
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
        target_id: 't1',
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
            usage_type: 'scan',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should create new task with all parameters', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TaskCommand(fakeHttp);
    return cmd
      .create({
        add_tag: 1,
        alterable: 0,
        alert_ids: ['a1', 'a2'],
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
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
            usage_type: 'scan',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should create new container task', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TaskCommand(fakeHttp);
    return cmd
      .createContainer({
        name: 'foo',
        comment: 'comment',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
            cmd: 'create_container_task',
            comment: 'comment',
            name: 'foo',
            usage_type: 'scan',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should save task', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TaskCommand(fakeHttp);
    return cmd
      .save({
        alterable: 0,
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        comment: 'comment',
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        id: 'task1',
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
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
            task_id: 'task1',
            target_id: 0,
            usage_type: 'scan',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should save task with all parameters', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TaskCommand(fakeHttp);
    return cmd
      .save({
        alterable: 0,
        alert_ids: ['a1', 'a2'],
        apply_overrides: 0,
        auto_delete: AUTO_DELETE_KEEP,
        auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
        comment: 'comment',
        config_id: 'c1',
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        id: 'task1',
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
        name: 'foo',
        scanner_id: OPENVAS_DEFAULT_SCANNER_ID,
        scanner_type: OPENVAS_SCANNER_TYPE,
        schedule_id: 's1',
        schedule_periods: 1,
        target_id: 't1',
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
            task_id: 'task1',
            target_id: 't1',
            usage_type: 'scan',
          },
        });

        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should throw an error if feed is currently syncing', async () => {
    const response = createResponse({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {type: 'NVT', currently_syncing: true, sync_not_available: false},
            {type: 'SCAP', currently_syncing: false, sync_not_available: false},
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);

    const taskCmd = new TaskCommand(fakeHttp);

    const feedCmd = new FeedStatus(fakeHttp);

    const result = await feedCmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);

    await expect(taskCmd.start({id: 'task1'})).rejects.toThrow(
      'Feed is currently syncing. Please try again later.',
    );
  });
});
