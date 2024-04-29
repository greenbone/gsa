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
