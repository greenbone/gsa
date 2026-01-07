/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import NvtsCommand from 'gmp/commands/nvts';
import {
  createAggregatesResponse,
  createHttp,
  createInfoEntitiesResponse,
} from 'gmp/commands/testing';
import Nvt from 'gmp/models/nvt';

describe('NvtsCommand tests', () => {
  test('should fetch nvts with default params', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        nvt: {
          _oid: '1.2.3',
        },
      },
      {
        _id: '2',
        name: 'User',
        nvt: {
          _oid: '2.3.4',
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_info', info_type: 'nvt'},
    });
    expect(result.data).toEqual([
      new Nvt({
        id: '1.2.3',
        name: 'Admin',
        oid: '1.2.3',
      }),
      new Nvt({
        id: '2.3.4',
        name: 'User',
        oid: '2.3.4',
      }),
    ]);
  });

  test('should fetch nvts with custom params', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        nvt: {
          _oid: '1.2.3',
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Admin'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_info',
        info_type: 'nvt',
        filter: "name='Admin'",
      },
    });
    expect(result.data).toEqual([
      new Nvt({id: '1.2.3', name: 'Admin', oid: '1.2.3'}),
    ]);
  });

  test('should fetch all nvts', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        nvt: {
          _oid: '1.2.3',
        },
      },
      {
        _id: '2',
        name: 'User',
        nvt: {
          _oid: '2.3.4',
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_info', info_type: 'nvt', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Nvt({
        id: '1.2.3',
        name: 'Admin',
        oid: '1.2.3',
      }),
      new Nvt({
        id: '2.3.4',
        name: 'User',
        oid: '2.3.4',
      }),
    ]);
  });

  test('should fetch severity aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'nvt',
        group_column: 'severity',
        info_type: 'nvt',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch created aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.getCreatedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'nvt',
        group_column: 'created',
        info_type: 'nvt',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch family aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.getFamilyAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'nvt',
        group_column: 'family',
        info_type: 'nvt',
        'data_columns:0': 'severity',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch qod aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.getQodAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'nvt',
        group_column: 'qod',
        info_type: 'nvt',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch qod type aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new NvtsCommand(fakeHttp);
    const result = await cmd.getQodTypeAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'nvt',
        group_column: 'qod_type',
        info_type: 'nvt',
      },
    });
    expect(result.data).toEqual({groups: []});
  });
});
