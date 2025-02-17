/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {FeedStatus} from '../feedstatus';
import {createResponse, createHttp} from '../testing';

describe('FeedStatusCommand tests', () => {
  test('should return feed information', () => {
    const response = createResponse({
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

    const cmd = new FeedStatus(fakeHttp);
    return cmd.readFeedInformation().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_feeds',
        },
      });

      const {data} = resp;
      expect(data[0].feedType).toEqual('NVT');
      expect(data[0].name).toEqual('foo');
      expect(data[0].description).toEqual('bar');
      expect(data[0].currentlySyncing).toEqual({timestamp: 'baz'});
      expect(data[0].status).toEqual(undefined);
      expect(data[0].version).toEqual('20190625T1319');
    });
  });

  test('should return isSyncing true when feeds are currently syncing', async () => {
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
    const cmd = new FeedStatus(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);
  });

  test('should return isSyncing true when feeds are not present', async () => {
    const response = createResponse({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {
              type: 'OTHER',
              currently_syncing: false,
              sync_not_available: false,
            },
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatus(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(true);
  });

  test('should return isSyncing false when feeds are not syncing and are present', async () => {
    const response = createResponse({
      get_feeds: {
        get_feeds_response: {
          feed: [
            {type: 'NVT', currently_syncing: false, sync_not_available: false},
            {type: 'SCAP', currently_syncing: false, sync_not_available: false},
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FeedStatus(fakeHttp);

    const result = await cmd.checkFeedSync();
    expect(result.isSyncing).toBe(false);
  });

  test('should throw an error when readFeedInformation fails', async () => {
    const fakeHttp = createHttp(Promise.reject(new Error('Network error')));
    const cmd = new FeedStatus(fakeHttp);

    await expect(cmd.checkFeedSync()).rejects.toThrow('Network error');
  });

  describe('checkFeedOwnerAndPermissions', () => {
    test('should return feed owner and permissions', async () => {
      const response = createResponse({
        get_feeds: {
          get_feeds_response: {
            feed_owner_set: 0,
            feed_resources_access: 1,
          },
        },
      });

      const fakeHttp = createHttp(response);
      const cmd = new FeedStatus(fakeHttp);

      const result = await cmd.checkFeedOwnerAndPermissions();

      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_feeds',
        },
      });

      expect(result.isFeedOwner).toBe(false);
      expect(result.isFeedResourcesAccess).toBe(true);
    });

    test('should log an error when checkFeedSync fails', async () => {
      const fakeHttp = createHttp(Promise.reject(new Error('Network error')));
      const cmd = new FeedStatus(fakeHttp);

      console.error = testing.fn();

      await expect(cmd.checkFeedSync()).rejects.toThrow('Network error');

      expect(console.error).toHaveBeenCalledWith(
        'Error checking if feed is syncing:',
        expect.any(Error),
      );
    });
  });
});
