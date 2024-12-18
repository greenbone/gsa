/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {AuditReportsCommand} from 'gmp/commands/auditreports';
import {ALL_FILTER} from 'gmp/models/filter';

import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from '../testing';

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
