/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import TasksCommand from 'gmp/commands/tasks';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import Task from 'gmp/models/task';

describe('TasksCommand tests', () => {
  test('should fetch tasks with default params', async () => {
    const response = createEntitiesResponse('task', [
      {_id: '1', name: 'Scan Task 1'},
      {_id: '2', name: 'Scan Task 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TasksCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_tasks', usage_type: 'scan'},
    });
    expect(result.data).toEqual([
      new Task({id: '1', name: 'Scan Task 1'}),
      new Task({id: '2', name: 'Scan Task 2'}),
    ]);
  });

  test('should fetch tasks with custom params', async () => {
    const response = createEntitiesResponse('task', [
      {_id: '3', name: 'Custom Task'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TasksCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Custom Task'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_tasks',
        filter: "name='Custom Task'",
        usage_type: 'scan',
      },
    });
    expect(result.data).toEqual([new Task({id: '3', name: 'Custom Task'})]);
  });

  test('should fetch all tasks', async () => {
    const response = createEntitiesResponse('task', [
      {_id: '4', name: 'All Tasks 1'},
      {_id: '5', name: 'All Tasks 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TasksCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_tasks', filter: 'first=1 rows=-1', usage_type: 'scan'},
    });
    expect(result.data).toEqual([
      new Task({id: '4', name: 'All Tasks 1'}),
      new Task({id: '5', name: 'All Tasks 2'}),
    ]);
  });

  test('should fetch severity aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new TasksCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'task',
        group_column: 'severity',
        usage_type: 'scan',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch status aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new TasksCommand(fakeHttp);
    const result = await cmd.getStatusAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'task',
        group_column: 'status',
        usage_type: 'scan',
      },
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should fetch high results aggregates', async () => {
    const response = createAggregatesResponse({});
    const fakeHttp = createHttp(response);

    const cmd = new TasksCommand(fakeHttp);
    const result = await cmd.getHighResultsAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'task',
        group_column: 'uuid',
        usage_type: 'scan',
        'sort_fields:0': 'high_per_host',
        'sort_fields:1': 'modified',
        'sort_orders:0': 'descending',
        'sort_orders:1': 'descending',
        'sort_stats:0': 'max',
        'sort_stats:1': 'value',
        'text_columns:0': 'name',
        'text_columns:1': 'high_per_host',
        'text_columns:2': 'severity',
        'text_columns:3': 'modified',
      },
    });
    expect(result.data).toEqual({groups: []});
  });
});
