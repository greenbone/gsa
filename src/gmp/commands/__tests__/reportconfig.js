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

import {
  createHttp,
  createEntityResponse,
  createActionResultResponse,
} from '../testing';
import {ReportConfigCommand} from '../reportconfigs';

describe('ReportConfigCommand tests', () => {
  test('should return single report config', () => {
    const response = createEntityResponse('report_config', {
      _id: 'foo',
    });

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ReportConfigCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_report_config',
          report_config_id: 'foo',
        },
      });
      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });

  test('should create report config', () => {
    const response = createActionResultResponse();

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ReportConfigCommand(fakeHttp);
    return cmd
      .create({
        name: 'foo',
        comment: 'bar',
        report_format_id: 'baz',
        params: {
          'param 1': 'value 1',
          'param 2': 'value 2',
          'param 3': ['report-format-1', 'report-format-2'],
        },
        params_using_default: {
          'param 1': false,
          'param 2': true,
          'param 3': false,
        },
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'create_report_config',
            name: 'foo',
            comment: 'bar',
            report_format_id: 'baz',
            'param:param 1': 'value 1',
            'param:param 2': 'value 2',
            'param:param 3': 'report-format-1,report-format-2',
            'param_using_default:param 2': 1,
          },
        });
        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should save report config', () => {
    const response = createActionResultResponse();

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ReportConfigCommand(fakeHttp);
    return cmd
      .save({
        name: 'foo',
        comment: 'bar',
        report_format_id: 'should-be-ignored-in-save',
        params: {
          'param 1': 'value A',
          'param 2': 'value B',
          'param 3': ['report-format-A', 'report-format-B'],
        },
        params_using_default: {
          'param 1': true,
          'param 2': false,
          'param 3': false,
        },
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_report_config',
            name: 'foo',
            comment: 'bar',
            'param:param 1': 'value A',
            'param:param 2': 'value B',
            'param:param 3': 'report-format-A,report-format-B',
            'param_using_default:param 1': 1,
          },
        });
        const {data} = resp;
        expect(data.id).toEqual('foo');
      });
  });

  test('should delete report config', () => {
    const response = createActionResultResponse();

    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ReportConfigCommand(fakeHttp);
    return cmd
      .delete({
        id: 'foo',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'delete_report_config',
            report_config_id: 'foo',
          },
        });
      });
  });
});
