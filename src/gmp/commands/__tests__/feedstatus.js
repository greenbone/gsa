/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {createResponse, createHttp} from '../testing';

import {FeedStatus} from '../feedstatus';

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
      expect(data[0].feed_type).toEqual('NVT');
      expect(data[0].name).toEqual('foo');
      expect(data[0].description).toEqual('bar');
      expect(data[0].currentlySyncing).toEqual({timestamp: 'baz'});
      expect(data[0].status).toEqual(undefined);
      expect(data[0].version).toEqual('20190625T1319');
    });
  });
});
