/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  testing,
} from '@gsa/testing';
import {FeedStatusCommand} from 'gmp/commands/feedstatus';
import {TaskCommand} from 'gmp/commands/tasks';
import {
  createActionResultResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import GmpHttp from 'gmp/http/gmp';
import Rejection from 'gmp/http/rejection';
import logger, {LogLevel} from 'gmp/log';
import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner';
import {
  HOSTS_ORDERING_RANDOM,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_KEEP,
} from 'gmp/models/task';

let logLevel: LogLevel;

beforeAll(() => {
  logLevel = logger.level;
  logger.setDefaultLevel('silent');
});

afterAll(() => {
  logger.setDefaultLevel(logLevel);
});

describe('TaskCommand tests', () => {
  test('should create new task', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new TaskCommand(fakeHttp);
    const resp = await cmd.create({
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
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create new task with all parameters', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TaskCommand(fakeHttp);
    const resp = await cmd.create({
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
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test.each([
    {
      name: 'resource restricted',
      feedsResponse: {feed_owner_set: 1},
      message: 'Some Error',
      expectedMessage:
        'Access to the feed resources is currently restricted. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'feed owner not set',
      feedsResponse: {feed_owner_set: 0},
      message: 'Some Error',
      expectedMessage:
        'The feed owner is currently not set. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing port list',
      message: 'Failed to find port_list XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Target because the default Port List is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing scan config',
      message: 'Failed to find config XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Task because the default Scan Config is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
  ])(
    'should not create new task while feed is not available: $name',
    async ({feedsResponse, message, expectedMessage}) => {
      const xhr = {
        status: 404,
      } as XMLHttpRequest;
      const rejection = new Rejection(xhr, Rejection.REASON_ERROR, message);
      const feedStatusResponse = createResponse({
        get_feeds: {
          get_feeds_response: feedsResponse,
        },
      });
      const fakeHttp = {
        request: testing
          .fn()
          .mockRejectedValueOnce(rejection)
          .mockResolvedValueOnce(feedStatusResponse),
      } as unknown as GmpHttp;

      const cmd = new TaskCommand(fakeHttp);
      await expect(
        cmd.create({
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
        }),
      ).rejects.toThrow(expectedMessage);
    },
  );

  test('should create new container task', async () => {
    const mockResponse = createActionResultResponse();
    const fakeHttp = createHttp(mockResponse);
    const cmd = new TaskCommand(fakeHttp);
    const response = await cmd.createContainer({
      name: 'foo',
      comment: 'comment',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        auto_delete_data: AUTO_DELETE_KEEP_DEFAULT_VALUE,
        cmd: 'create_container_task',
        comment: 'comment',
        name: 'foo',
        usage_type: 'scan',
      },
    });
    expect(response.data).toEqual({id: 'foo'});
  });

  test('should save task', async () => {
    const mockResponse = createActionResultResponse();
    const fakeHttp = createHttp(mockResponse);
    const cmd = new TaskCommand(fakeHttp);
    const response = await cmd.save({
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
        config_id: '0',
        hosts_ordering: HOSTS_ORDERING_RANDOM,
        in_assets: 0,
        max_checks: 10,
        max_hosts: 10,
        min_qod: 70,
        name: 'foo',
        scanner_id: '0',
        scanner_type: undefined,
        schedule_id: '0',
        schedule_periods: undefined,
        task_id: 'task1',
        target_id: '0',
        usage_type: 'scan',
      },
    });
    expect(response).toBeUndefined();
  });

  test.each([
    {
      name: 'resource restricted',
      feedsResponse: {feed_owner_set: 1},
      message: 'Some Error',
      expectedMessage:
        'Access to the feed resources is currently restricted. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'feed owner not set',
      feedsResponse: {feed_owner_set: 0},
      message: 'Some Error',
      expectedMessage:
        'The feed owner is currently not set. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing port list',
      message: 'Failed to find port_list XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Target because the default Port List is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
    {
      name: 'missing scan config',
      message: 'Failed to find config XYZ',
      feedsResponse: {
        feed_owner_set: 1,
        feed_resources_access: 1,
      },
      expectedMessage:
        'Failed to create a new Task because the default Scan Config is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    },
  ])(
    'should not save task while feed is not available: $name',
    async ({feedsResponse, message, expectedMessage}) => {
      const xhr = {
        status: 404,
      };
      const rejection = new Rejection(
        xhr as XMLHttpRequest,
        Rejection.REASON_ERROR,
        message,
      );
      const feedStatusResponse = createResponse({
        get_feeds: {
          get_feeds_response: feedsResponse,
        },
      });
      const fakeHttp = {
        request: testing
          .fn()
          .mockRejectedValueOnce(rejection)
          .mockResolvedValueOnce(feedStatusResponse),
      } as unknown as GmpHttp;

      const cmd = new TaskCommand(fakeHttp);
      await expect(
        cmd.save({
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
        }),
      ).rejects.toThrow(expectedMessage);
    },
  );

  test('should save task with all parameters', async () => {
    const mockResponse = createActionResultResponse();
    const fakeHttp = createHttp(mockResponse);
    const cmd = new TaskCommand(fakeHttp);
    const response = await cmd.save({
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
        task_id: 'task1',
        target_id: 't1',
        usage_type: 'scan',
      },
    });
    expect(response).toBeUndefined();
  });

  test('should throw an error if feed is currently syncing', async () => {
    const response = createResponse({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: 'NVT',
              currently_syncing: true,
              sync_not_available: false,
              version: 202502170647,
            },
            {
              type: 'SCAP',
              currently_syncing: false,
              sync_not_available: false,
              version: 202502170647,
            },
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);

    const taskCmd = new TaskCommand(fakeHttp);

    const feedCmd = new FeedStatusCommand(fakeHttp);

    const result = await feedCmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);

    await expect(taskCmd.start({id: 'task1'})).rejects.toThrow(
      'Feed is currently syncing. Please try again later.',
    );
  });
});
