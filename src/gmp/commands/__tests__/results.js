/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {ALL_FILTER} from 'gmp/models/filter';

import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from '../testing';
import {ResultsCommand} from '../results';

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
