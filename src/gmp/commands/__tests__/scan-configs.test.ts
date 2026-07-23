/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ScanConfigsCommand from 'gmp/commands/scan-configs';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import ScanConfig from 'gmp/models/scan-config';

describe('ScanConfigsCommand tests', () => {
  test('should fetch all scan configs', async () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_configs',
        filter: ALL_FILTER.toFilterString(),
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should fetch scan configs with default params', async () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_configs',
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should fetch scan configs with custom params', async () => {
    const response = createEntitiesResponse('config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigsCommand(fakeHttp);
    const resp = await cmd.get({
      filter: ALL_FILTER,
      details: 1,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_configs',
        filter: ALL_FILTER.toFilterString(),
        details: 1,
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should allow to export scan configs by filter', async () => {
    const response = createEntitiesResponse('config', []);
    const fakeHttp = createHttp(response);

    const filter = QueryFilter.fromString('name~foo');

    const cmd = new ScanConfigsCommand(fakeHttp);
    await cmd.exportByFilter(filter);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'config',
        bulk_select: 0,
        filter: 'name~foo',
      },
    });
  });

  test('should allow to export scan configs by ids', async () => {
    const response = createEntitiesResponse('config', []);
    const fakeHttp = createHttp(response);

    const cmd = new ScanConfigsCommand(fakeHttp);

    const ids = ['123', '456'];

    await cmd.exportByIds(ids);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'config',
        bulk_select: 1,
      },
    });
  });

  test('should allow to export scan configs', async () => {
    const response = createEntitiesResponse('config', []);
    const fakeHttp = createHttp(response);

    const cmd = new ScanConfigsCommand(fakeHttp);

    const entities = [new ScanConfig({id: '123'}), new ScanConfig({id: '456'})];

    await cmd.export(entities);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'config',
        bulk_select: 1,
      },
    });
  });
});
