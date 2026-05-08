/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {FiltersCommand} from 'gmp/commands/filters';
import {createHttp, createResponse} from 'gmp/commands/testing';

describe('FiltersCommand tests', () => {
  test('should parse filter meta and collection counts from response', async () => {
    const response = createResponse({
      get_filters: {
        get_filters_response: {
          filter: [{_id: 'f1', term: 'name=Alpha'}],
          filters: [{term: 'name=Alpha'}, {_start: 3, _max: 20}],
          filter_count: {page: 1, __text: 42, filtered: 7},
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FiltersCommand(fakeHttp);
    const resp = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_filters',
      },
    });
    expect(resp.data.length).toEqual(1);
    expect(resp.meta.filter.toFilterString()).toContain('name=Alpha');
    expect(resp.meta.counts.first).toEqual(3);
    expect(resp.meta.counts.rows).toEqual(20);
    expect(resp.meta.counts.length).toEqual(1);
    expect(resp.meta.counts.all).toEqual(42);
    expect(resp.meta.counts.filtered).toEqual(7);
  });

  test('should return default collection counts when meta is missing', async () => {
    const response = createResponse({
      get_filters: {
        get_filters_response: {
          filter: [{_id: 'f1', term: 'name=Alpha'}],
          filters: [{term: 'name=Alpha'}],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FiltersCommand(fakeHttp);
    const resp = await cmd.get();

    expect(resp.meta.counts.first).toEqual(0);
    expect(resp.meta.counts.rows).toEqual(0);
    expect(resp.meta.counts.length).toEqual(0);
    expect(resp.meta.counts.all).toEqual(0);
    expect(resp.meta.counts.filtered).toEqual(0);
  });
});
