/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportsCommand from 'gmp/commands/reports';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';

describe('ReportsCommand tests', () => {
  test('should return all reports', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new ReportsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_reports',
        details: 0,
        filter: ALL_FILTER.toFilterString(),
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return results', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new ReportsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_reports',
        details: 0,
        usage_type: 'scan',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return severity aggregates', async () => {
    const response = createAggregatesResponse({
      group: [{value: 'High', count: 2, c_count: 3}],
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportsCommand(fakeHttp);

    const result = await cmd.getSeverityAggregates({});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'report',
        group_column: 'severity',
      },
    });
    expect(result.data).toEqual({
      groups: [{value: 'High', count: 2, c_count: 3}],
    });
  });

  test('should return high-result aggregates', async () => {
    const response = createAggregatesResponse({
      group: [{value: '2024-01-01', count: 1, c_count: 1}],
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportsCommand(fakeHttp);

    const result = await cmd.getHighResultsAggregates({});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'report',
        group_column: 'date',
        'data_columns:0': 'high',
        'data_columns:1': 'high_per_host',
      },
    });
    expect(result.data).toEqual({
      groups: [{value: '2024-01-01', count: 1, c_count: 1}],
    });
  });
});
