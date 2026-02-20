/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createResponse, createHttp} from 'gmp/commands/testing';
import TimezonesCommand from 'gmp/commands/timezones';

describe('TimezonesCommand tests', () => {
  test('should return timezones list', async () => {
    const response = createResponse({
      get_timezones: {
        get_timezones_response: {
          timezone: [
            {name: 'UTC'},
            {name: 'Europe/Berlin'},
            {name: 'America/New_York'},
            {name: 'Asia/Tokyo'},
          ],
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new TimezonesCommand(fakeHttp);
    const resp = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_timezones',
      },
    });

    const {data} = resp;
    expect(data).toHaveLength(4);
    expect(data).toEqual([
      'UTC',
      'Europe/Berlin',
      'America/New_York',
      'Asia/Tokyo',
    ]);
  });

  test('should handle empty timezones list', async () => {
    const response = createResponse({
      get_timezones: {
        get_timezones_response: {
          timezone: [],
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new TimezonesCommand(fakeHttp);
    const resp = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_timezones',
      },
    });

    const {data} = resp;
    expect(data).toHaveLength(0);
    expect(data).toEqual([]);
  });
});
