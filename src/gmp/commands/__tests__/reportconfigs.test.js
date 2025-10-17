/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ReportConfigsCommand} from 'gmp/commands/reportconfigs';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import transform from 'gmp/http/transform/fastxml';
import {ALL_FILTER} from 'gmp/models/filter';

describe('ReportConfigsCommand tests', () => {
  test('should return all report configs', async () => {
    const response = createEntitiesResponse('report_config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new ReportConfigsCommand(fakeHttp);
    const resp = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_configs',
        filter: ALL_FILTER.toFilterString(),
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return report configs', async () => {
    const response = createEntitiesResponse('report_config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ReportConfigsCommand(fakeHttp);
    const resp = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_configs',
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });

  test('should return filtered report configs', async () => {
    const response = createEntitiesResponse('report_config', [
      {
        _id: '1',
      },
      {
        _id: '2',
      },
    ]);

    const fakeHttp = createHttp(response);
    const cmd = new ReportConfigsCommand(fakeHttp);
    const resp = await cmd.get({filter: 'test filter'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_configs',
        filter: 'test filter',
      },
      transform,
    });
    const {data} = resp;
    expect(data.length).toEqual(2);
  });
});
