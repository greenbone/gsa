/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  FeedStatusCommand,
  NVT_FEED,
  FEED_COMMUNITY,
  feedStatusRejection,
  FEED_ENTERPRISE,
  FeedStatusElement,
} from 'gmp/commands/feedstatus';
import {createResponse, createHttp} from 'gmp/commands/testing';
import GmpHttp from 'gmp/http/gmp';
import Rejection from 'gmp/http/rejection';
import logger from 'gmp/log';

describe('FeedStatusCommand tests', () => {
  test('should return feed information', async () => {
    testing.setSystemTime(new Date('2019-06-26T14:00:00Z'));

    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: {
            type: 'NVT',
            name: 'foo',
            version: 201906251319,
            description: 'bar',
            currently_syncing: {timestamp: 'baz'},
          },
        },
      },
    });

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new FeedStatusCommand(fakeHttp);
    const resp = await cmd.readFeedInformation();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_feeds',
      },
    });
    const {data} = resp;
    const feed = data[0];
    expect(feed.feedType).toEqual('NVT');
    expect(feed.name).toEqual('foo');
    expect(feed.description).toEqual('bar');
    expect(feed.currentlySyncing).toEqual(true);
    expect(feed.syncNotAvailableError).toBeUndefined();
    expect(feed.status).toEqual(undefined);
    expect(feed.version).toEqual('20190625T1319');
    expect(feed.age).toEqual(1);
  });

  test('should return isSyncing true when feeds are currently syncing', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: 'NVT',
              description: 'NVT Feed',
              name: 'NVT Feed',
              currently_syncing: {
                timestamp: '202502170647',
              },
              version: 202502170647,
            },
            {
              type: 'SCAP',
              description: 'SCAP Feed',
              name: 'SCAP Feed',
              version: 202502170647,
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatusCommand(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);
  });

  test('should return isSyncing true when feeds are not present', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: 'OTHER',
              version: 202502170647,
              description: 'Other Feed',
              name: 'Other Feed',
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatusCommand(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);
  });

  test('should return isSyncing true when feed sync has an issue', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: 'OTHER',
              version: 202502170647,
              description: 'Other Feed',
              name: 'Other Feed',
              sync_not_available: {
                error: 'Sync not available',
              },
            },
            {
              type: 'NVT',
              version: 202502170647,
              description: 'NVT Feed',
              name: 'NVT Feed',
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatusCommand(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);
  });

  test('should return isSyncing false when feeds are not syncing and are present', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: 'NVT',
              description: 'NVT Feed',
              name: 'NVT Feed',
              version: 202502170647,
            },
            {
              type: 'SCAP',
              description: 'SCAP Feed',
              name: 'SCAP Feed',
              version: 202502170647,
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatusCommand(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(false);
  });

  test('should throw an error when readFeedInformation fails', async () => {
    const log = logger.getLogger('gmp.commands.feedstatus');
    log.error = testing.fn();
    const fakeHttp = createHttp(Promise.reject(new Error('Network error')));
    const cmd = new FeedStatusCommand(fakeHttp);

    await expect(cmd.checkFeedSync()).rejects.toThrow('Network error');
  });

  test('should return feed owner and permissions when checking feed', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed_owner_set: 0,
          feed_resources_access: 1,
          feed: [],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatusCommand(fakeHttp);

    const result = await cmd.checkFeedOwnerAndPermissions();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_feeds',
      },
    });

    expect(result.isFeedOwnerSet).toBe(false);
    expect(result.isFeedResourcesAccess).toBe(true);
  });

  test('should log an error when checkFeedSync fails', async () => {
    const log = logger.getLogger('gmp.commands.feedstatus');
    log.error = testing.fn();
    const fakeHttp = createHttp(Promise.reject(new Error('Network error')));
    const cmd = new FeedStatusCommand(fakeHttp);

    await expect(cmd.checkFeedSync()).rejects.toThrow('Network error');

    expect(log.error).toHaveBeenCalledWith(
      'Error checking if feed is syncing:',
      expect.any(Error),
    );
  });

  test('should return true if NVT feed is the enterprise feed', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: NVT_FEED,
              description: 'Enterprise NVT Feed',
              name: FEED_ENTERPRISE,
              version: 202502170647,
            },
            {
              type: 'SCAP',
              description: 'Enterprise SCAP Feed',
              name: 'Some Other Feed',
              version: 202502170647,
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const feedStatus = new FeedStatusCommand(fakeHttp);

    const result = await feedStatus.isEnterpriseFeed();

    expect(result).toBe(true);
  });

  test('should return false if NVT feed is not the enterprise feed', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: NVT_FEED,
              name: FEED_COMMUNITY,
              description: 'Community NVT Feed',
              version: 202502170647,
            },
            {
              type: 'SCAP',
              name: FEED_COMMUNITY,
              description: 'Community SCAP Feed',
              version: 202502170647,
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const feedStatus = new FeedStatusCommand(fakeHttp);

    const result = await feedStatus.isEnterpriseFeed();

    expect(result).toBe(false);
  });

  test('should return undefined and log an error if an exception occurs', async () => {
    const fakeHttp = createHttp(Promise.reject(new Error('Network error')));
    const cmd = new FeedStatusCommand(fakeHttp);

    const consoleErrorSpy = testing.fn();
    console.error = consoleErrorSpy;

    const result = await cmd.isEnterpriseFeed();

    expect(result).toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error checking if feed is enterprise:',
      expect.any(Error),
    );
  });
});

describe('feedStatusRejection tests', () => {
  test('should pass rejection for non 404 errors', async () => {
    const gmpHttp = {} as GmpHttp;
    const xhr = {
      status: 500,
    } as XMLHttpRequest;
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      'Internal Server Error',
    );
    await expect(feedStatusRejection(gmpHttp, rejection)).rejects.toThrow();
    expect(rejection.message).toEqual('Internal Server Error');
  });

  test('should detect feed owner not set', async () => {
    const response = createResponse({
      get_feeds: {
        get_feeds_response: {},
      },
    });
    const gmpHttp = createHttp(response);
    const xhr = {
      status: 404,
    } as XMLHttpRequest;
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      'Some Message',
    );

    await expect(feedStatusRejection(gmpHttp, rejection)).rejects.toThrow();
    expect(rejection.message).toEqual(
      'The feed owner is currently not set. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    );
  });

  test('should detect feed resources access restricted', async () => {
    const response = createResponse({
      get_feeds: {
        get_feeds_response: {feed_owner_set: 1},
      },
    });
    const gmpHttp = createHttp(response);
    const xhr = {
      status: 404,
    } as XMLHttpRequest;
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      'Some Message',
    );

    await expect(feedStatusRejection(gmpHttp, rejection)).rejects.toThrow();
    expect(rejection.message).toEqual(
      'Access to the feed resources is currently restricted. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    );
  });

  test('should detect missing port list', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed_owner_set: 1,
          feed_resources_access: 1,
          feed: [],
        },
      },
    });
    const gmpHttp = createHttp(response);
    const xhr = {
      status: 404,
    } as XMLHttpRequest;
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      'Failed to find port_list XYZ',
    );

    await expect(feedStatusRejection(gmpHttp, rejection)).rejects.toThrow();
    expect(rejection.message).toEqual(
      'Failed to create a new Target because the default Port List is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    );
  });

  test('should detect missing scan config', async () => {
    const response = createResponse<FeedStatusElement>({
      get_feeds: {
        get_feeds_response: {
          feed_owner_set: 1,
          feed_resources_access: 1,
          feed: [],
        },
      },
    });
    const gmpHttp = createHttp(response);
    const xhr = {
      status: 404,
    } as XMLHttpRequest;
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      'Failed to find config XYZ',
    );

    await expect(feedStatusRejection(gmpHttp, rejection)).rejects.toThrow();
    expect(rejection.message).toEqual(
      'Failed to create a new Task because the default Scan Config is not available. This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
    );
  });
});
