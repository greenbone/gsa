/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import EntitiesCommand from 'gmp/commands/entities';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import Filter from 'gmp/models/filter';

describe('EntitiesCommand tests', () => {
  test('should add filter parameter', async () => {
    const filter = Filter.fromString('foo=bar');
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    cmd.getEntitiesResponse = testing.fn().mockReturnValue(data => data);
    await cmd.get({filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter: 'foo=bar',
      },
    });
  });

  test('should add filter_id parameter', async () => {
    const filter = Filter.fromElement({_id: 'bar'});
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    cmd.getEntitiesResponse = testing.fn().mockReturnValue(data => data);
    await cmd.get({filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter_id: 'bar',
      },
    });
  });

  test('should prefer filter_id over filter parameter', async () => {
    const filter = Filter.fromElement({
      _id: 'bar',
      keywords: {
        keyword: {relation: '=', value: 'bar', column: 'foo'},
      },
    });
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect(filter.toFilterString()).toEqual('foo=bar');

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    cmd.getEntitiesResponse = testing.fn().mockReturnValue(data => data);
    await cmd.get({filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter_id: 'bar',
      },
    });
  });

  test('deleteByIds() should should call bulk_delete with correct ids', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    const ids = new Set();
    ids.add('123');
    ids.add('456');

    expect.hasAssertions();

    const cmd = new EntitiesCommand(fakeHttp, 'foo');
    await cmd.deleteByIds(ids);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_delete',
        resource_type: 'foo',
      },
    });
  });
});
