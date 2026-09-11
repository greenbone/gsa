/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ReportFormatsCommand} from 'gmp/commands/report-formats';
import {
  createEntitiesResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import {ALL_FILTER} from 'gmp/models/filter';

describe('ReportFormatsCommand tests', () => {
  test('should return all report formats', async () => {
    const fakeHttp = createHttp(
      createEntitiesResponse('report_format', [{_id: '1'}, {_id: '2'}]),
    );
    const cmd = new ReportFormatsCommand(fakeHttp);

    const result = await cmd.getAll();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_formats',
        filter: ALL_FILTER.toFilterString(),
      },
    });
    expect(result.data.map(format => format.id)).toEqual(['1', '2']);
  });

  test('should return report formats', async () => {
    const fakeHttp = createHttp(
      createEntitiesResponse('report_format', [{_id: '1'}, {_id: '2'}]),
    );
    const cmd = new ReportFormatsCommand(fakeHttp);

    const result = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_report_formats'},
    });
    expect(result.data.map(format => format.id)).toEqual(['1', '2']);
  });

  test('should return filtered report formats', async () => {
    const fakeHttp = createHttp(
      createEntitiesResponse('report_format', [{_id: '1'}]),
    );
    const cmd = new ReportFormatsCommand(fakeHttp);

    const result = await cmd.get({filter: 'name=HTML'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_formats',
        filter: 'name=HTML',
      },
    });
    expect(result.data.map(format => format.id)).toEqual(['1']);
  });

  test('should handle an incomplete report formats response', async () => {
    const fakeHttp = createHttp(createResponse({}));
    const cmd = new ReportFormatsCommand(fakeHttp);

    const result = await cmd.get();

    expect(result.data).toEqual([]);
  });
});
