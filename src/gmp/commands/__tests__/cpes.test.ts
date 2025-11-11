/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CpesCommand from 'gmp/commands/cpes';
import {
  createAggregatesResponse,
  createHttp,
  createInfoEntitiesResponse,
} from 'gmp/commands/testing';
import Cpe from 'gmp/models/cpe';

describe('CpesCommand tests', () => {
  test('should fetch cpes with default params', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        cpe: {
          cpe_name_id: 'cpe:/a:admin:admin:1.0',
        },
      },
      {
        _id: '2',
        name: 'User',
        cpe: {
          cpe_name_id: 'cpe:/a:user:user:1.0',
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CpesCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_info', info_type: 'cpe'},
    });
    expect(result.data).toEqual([
      new Cpe({
        id: '1',
        name: 'Admin',
        cpeNameId: 'cpe:/a:admin:admin:1.0',
      }),
      new Cpe({
        id: '2',
        name: 'User',
        cpeNameId: 'cpe:/a:user:user:1.0',
      }),
    ]);
  });

  test('should fetch cpes with custom params', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        cpe: {
          cpe_name_id: 'cpe:/a:admin:admin:1.0',
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CpesCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Admin'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_info',
        info_type: 'cpe',
        filter: "name='Admin'",
      },
    });
    expect(result.data).toEqual([
      new Cpe({id: '1', name: 'Admin', cpeNameId: 'cpe:/a:admin:admin:1.0'}),
    ]);
  });

  test('should fetch all cpes', async () => {
    const response = createInfoEntitiesResponse([
      {
        _id: '1',
        name: 'Admin',
        cpe: {
          cpe_name_id: 'cpe:/a:admin:admin:1.0',
        },
      },
      {
        _id: '2',
        name: 'User',
        cpe: {
          cpe_name_id: 'cpe:/a:user:user:1.0',
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new CpesCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_info', info_type: 'cpe', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Cpe({
        id: '1',
        name: 'Admin',
        cpeNameId: 'cpe:/a:admin:admin:1.0',
      }),
      new Cpe({
        id: '2',
        name: 'User',
        cpeNameId: 'cpe:/a:user:user:1.0',
      }),
    ]);
  });

  test('should fetch severity aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new CpesCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'cpe',
        group_column: 'severity',
        info_type: 'cpe',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch created aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new CpesCommand(fakeHttp);
    const result = await cmd.getCreatedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'cpe',
        group_column: 'created',
        info_type: 'cpe',
      },
    });
    expect(result.data).toEqual({groups: []});
  });
});
