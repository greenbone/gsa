/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AuditReportsCommand from 'gmp/commands/audit-reports';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';

describe('AuditReportsCommand tests', () => {
  test('should fetch all audit reports', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    const cmd = new AuditReportsCommand(fakeHttp);
    const resp = await cmd.getAll();
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

  test('should fetch audit reports with default parameters', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    const cmd = new AuditReportsCommand(fakeHttp);
    const resp = await cmd.get();
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

  test('should fetch audit reports with custom parameters', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
    ]);

    const fakeHttp = createHttp(response);

    const cmd = new AuditReportsCommand(fakeHttp);
    const resp = await cmd.get({filter: "name='Custom Report'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_reports',
        details: 0,
        filter: "name='Custom Report'",
        usage_type: 'audit',
      },
    });
    const {data} = resp;
    expect(data.length).toEqual(1);
  });

  test('should aggregate compliance counts', async () => {
    const response = createAggregatesResponse();
    const fakeHttp = createHttp(response);

    const cmd = new AuditReportsCommand(fakeHttp);
    await cmd.getComplianceAggregates();
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
