/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OverridesCommand from 'gmp/commands/overrides';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import Override from 'gmp/models/override';

describe('OverridesCommand tests', () => {
  test('should fetch overrides with default params', async () => {
    const response = createEntitiesResponse('override', [
      {_id: '1', text: 'Override 1'},
      {_id: '2', text: 'Override 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new OverridesCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_overrides', details: 1},
    });
    expect(result.data).toEqual([
      new Override({id: '1', text: 'Override 1'}),
      new Override({id: '2', text: 'Override 2'}),
    ]);
  });

  test('should fetch overrides with custom filter', async () => {
    const response = createEntitiesResponse('override', [
      {_id: '3', text: 'Custom Override'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new OverridesCommand(fakeHttp);
    const result = await cmd.get({filter: "text='Custom Override'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_overrides',
        filter: "text='Custom Override'",
        details: 1,
      },
    });
    expect(result.data).toEqual([
      new Override({id: '3', text: 'Custom Override'}),
    ]);
  });

  test('should fetch all overrides', async () => {
    const response = createEntitiesResponse('override', [
      {_id: '1', text: 'Override 1'},
      {_id: '2', text: 'Override 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new OverridesCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_overrides', filter: 'first=1 rows=-1', details: 1},
    });
    expect(result.data).toEqual([
      new Override({id: '1', text: 'Override 1'}),
      new Override({id: '2', text: 'Override 2'}),
    ]);
  });

  test('should fetch active days aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 1, count: 5},
        {value: 2, count: 3},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new OverridesCommand(fakeHttp);
    const result = await cmd.getActiveDaysAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'override',
        details: 1,
        group_column: 'active_days',
        max_groups: '250',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 1, count: 5},
        {value: 2, count: 3},
      ],
    });
  });

  test('should fetch created aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: '2024-01-01', count: 10},
        {value: '2024-01-02', count: 7},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new OverridesCommand(fakeHttp);
    const result = await cmd.getCreatedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'override',
        details: 1,
        group_column: 'created',
        aggregate_mode: 'count',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: '2024-01-01', count: 10},
        {value: '2024-01-02', count: 7},
      ],
    });
  });

  test('should fetch word counts aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'vulnerability', count: 15},
        {value: 'false positive', count: 8},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new OverridesCommand(fakeHttp);
    const result = await cmd.getWordCountsAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'override',
        details: 1,
        group_column: 'text',
        aggregate_mode: 'word_counts',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 'vulnerability', count: 15},
        {value: 'false positive', count: 8},
      ],
    });
  });
});
