/* Copyright (C) 2024 Greenbone AG
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
import {AuditReportsCommand} from '../auditreports';

describe('AuditReportsCommand tests', () => {
  test('should return all audit reports', () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditReportsCommand(fakeHttp);
    return cmd.getAll().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_reports',
          details: 0,
          filter: ALL_FILTER.toFilterString(),
          usage_type: 'audit',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should return results', () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditReportsCommand(fakeHttp);
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_reports',
          details: 0,
          usage_type: 'audit',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should aggregate compliance counts', () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditReportsCommand(fakeHttp);
    return cmd.getComplianceAggregates().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_aggregate',
          aggregate_type: 'report',
          group_column: 'compliant',
          usage_type: 'audit',
        },
      });
    });
  });
});
