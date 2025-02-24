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
  test('should return all results', () => {
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
    return cmd.getAll().then(resp => {
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
  });

  test('should return results', () => {
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
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_results',
          details: 1,
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should allow to overwrite details parameter', () => {
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
    return cmd.get({details: 0}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_results',
          details: 0,
        },
      });
    });
  });

  test('should aggregate Description Word Counts', () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    return cmd.getDescriptionWordCountsAggregates().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_aggregate',
          aggregate_type: 'result',
          group_column: 'description',
          aggregate_mode: 'word_counts',
          max_groups: 250,
        },
      });
    });
  });

  test('should aggregate word counts', () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    return cmd.getWordCountsAggregates().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_aggregate',
          aggregate_type: 'result',
          group_column: 'vulnerability',
          aggregate_mode: 'word_counts',
          max_groups: 250,
        },
      });
    });
  });

  test('should aggregate severities', () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ResultsCommand(fakeHttp);
    return cmd.getSeverityAggregates().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_aggregate',
          aggregate_type: 'result',
          group_column: 'severity',
        },
      });
    });
  });
});
