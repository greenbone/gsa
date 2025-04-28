/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ResultsCommand} from 'gmp/commands/results';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';

describe('ResultsCommand tests', () => {
  test('should return all results', async () => {
    const response = createEntitiesResponse('result', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_results',
        details: 1,
        filter: ALL_FILTER.toFilterString(),
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return results', async () => {
    const response = createEntitiesResponse('result', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_results',
        details: 1,
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should allow to overwrite details parameter', async () => {
    const response = createEntitiesResponse('result', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    await cmd.get({details: 0});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_results',
        details: 0,
      },
    });
  });

  test('should aggregate Description Word Counts', async () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    await cmd.getDescriptionWordCountsAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'result',
        group_column: 'description',
        aggregate_mode: 'word_counts',
        max_groups: '250',
      },
    });
  });

  test('should aggregate word counts', async () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    await cmd.getWordCountsAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'result',
        group_column: 'vulnerability',
        aggregate_mode: 'word_counts',
        max_groups: '250',
      },
    });
  });

  test('should aggregate severities', async () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'result',
        group_column: 'severity',
      },
    });
  });
});
