/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {createHttp, createEntitiesResponse} from '../testing';
import {ReportConfigsCommand} from '../reportconfigs';
import {ALL_FILTER} from 'gmp/models/filter';

describe('ReportConfigsCommand tests', () => {
  test('should return all report configs', () => {
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
    return cmd.getAll().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_report_configs',
          filter: ALL_FILTER.toFilterString(),
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should return report configs', () => {
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
    return cmd.get().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_report_configs',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });

  test('should return filtered report configs', () => {
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
    return cmd.get({filter: 'test filter'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_report_configs',
          filter: 'test filter',
        },
      });
      const {data} = resp;
      expect(data.length).toEqual(2);
    });
  });
});
