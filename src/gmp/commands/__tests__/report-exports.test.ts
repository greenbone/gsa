/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import ReportExportsCommand from 'gmp/commands/report-exports';
import {
  createEntityResponse,
  createEntitiesResponse,
  createEntitiesResponseWithFilter,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import QueryFilter from 'gmp/models/filter/query-filter';

describe('ReportExportsCommand tests', () => {
  test('should get report exports with filter, metadata, and pagination', async () => {
    const filter = QueryFilter.fromString('owner="alice"');
    const httpResponse = createEntitiesResponseWithFilter(
      'report_export',
      [
        {
          _id: 'export-uuid',
          _type: 'scan',
          owner: {name: 'alice'},
          creation_time: '2026-09-01T08:40:50Z',
          status: 'done',
        },
        {
          _id: 'audit-export-uuid',
          _type: 'audit',
          status: 'running',
          progress: 'generating',
        },
      ],
      filter,
    );
    const fakeHttp = createHttp(httpResponse);
    const command = new ReportExportsCommand(fakeHttp);
    const response = await command.get({
      filter,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_exports',
        filter: 'owner="alice"',
      },
    });
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toMatchObject({
      id: 'export-uuid',
      type: 'scan',
      owner: {name: 'alice'},
      status: 'done',
    });
    expect(response.data[0].creationTime?.toISOString()).toBe(
      '2026-09-01T08:40:50.000Z',
    );
    expect(response.data[1]).toMatchObject({
      id: 'audit-export-uuid',
      type: 'audit',
      status: 'running',
      progress: 'generating',
    });
    expect(response.meta.filter.toFilterString()).toBe('owner="alice"');
    expect(response.meta.counts).toMatchObject({
      first: 1,
      rows: 1000,
      length: 0,
      all: 2,
      filtered: 0,
      last: 0,
    });
  });

  test('should handle a single export and discard exports without an id', async () => {
    const response = createEntitiesResponse('report_export', [
      {_id: 'export-uuid', status: 'done'},
      {status: 'done'},
    ]);
    const fakeHttp = createHttp(response);
    const command = new ReportExportsCommand(fakeHttp);

    const result = await command.get({filter: QueryFilter.fromString('')});

    expect(result.data).toEqual([
      expect.objectContaining({id: 'export-uuid', status: 'done'}),
    ]);
  });

  test('should handle a single export object', async () => {
    const response = createEntityResponse(
      'report_export',
      {_id: 'export-uuid', status: 'done'},
      {
        getName: 'get_report_exports',
        responseName: 'get_report_exports_response',
      },
    );
    const fakeHttp = createHttp(response);
    const command = new ReportExportsCommand(fakeHttp);

    const result = await command.get({filter: QueryFilter.fromString('')});

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('export-uuid');
    expect(result.data[0].status).toBe('done');
  });

  test('should return empty data and default counts when no exports are returned', async () => {
    const response = createEntitiesResponse('report_export', []);
    const fakeHttp = createHttp(response);
    const command = new ReportExportsCommand(fakeHttp);

    const result = await command.get({filter: QueryFilter.fromString('')});

    expect(result.data).toEqual([]);
    expect(result.meta.counts).toMatchObject({
      first: 1,
      rows: 1000,
      length: 0,
      all: 0,
      filtered: 0,
      last: 0,
    });
  });

  test('should reject an invalid collection response', async () => {
    const fakeHttp = createHttp(createResponse({}));
    const command = new ReportExportsCommand(fakeHttp);

    await expect(
      command.get({filter: QueryFilter.fromString('')}),
    ).rejects.toThrow('Invalid report export collection response');
  });
});
