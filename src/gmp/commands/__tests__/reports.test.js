/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportsCommand from 'gmp/commands/reports';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import transform from 'gmp/http/transform/fastxml';
import {ALL_FILTER} from 'gmp/models/filter';

describe('ReportsCommand tests', () => {
  test('should return all reports', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new ReportsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_reports',
        details: 0,
        filter: ALL_FILTER.toFilterString(),
        usage_type: 'scan',
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return results', async () => {
    const response = createEntitiesResponse('report', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);
    const fakeHttp = createHttp(response);
    const cmd = new ReportsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_reports',
        details: 0,
        usage_type: 'scan',
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });
});
