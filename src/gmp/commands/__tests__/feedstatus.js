/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
