/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ReportConfigCommand} from 'gmp/commands/reportconfigs';
import {
  createHttp,
  createEntityResponse,
  createActionResultResponse,
} from 'gmp/commands/testing';

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
        reportFormatId: 'baz',
        params: {
          'param 1': 'value 1',
          'param 2': 'value 2',
          'param 3': ['report-format-1', 'report-format-2'],
          'param 4': ['option-1', 'option-2'],
        },
        paramsUsingDefault: {
          'param 1': false,
          'param 2': true,
          'param 3': false,
          'param 4': false,
        },
        paramTypes: {
          'param 1': 'string',
          'param 2': 'text',
          'param 3': 'report_format_list',
          'param 4': 'multi_selection',
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
            'param:param 4': '["option-1","option-2"]',
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
        reportFormatId: 'should-be-ignored-in-save',
        params: {
          'param 1': 'value A',
          'param 2': 'value B',
          'param 3': ['report-format-A', 'report-format-B'],
          'param 4': ['option-1', 'option-2'],
        },
        paramsUsingDefault: {
          'param 1': true,
          'param 2': false,
          'param 3': false,
          'param 4': false,
        },
        paramTypes: {
          'param 1': 'string',
          'param 2': 'text',
          'param 3': 'report_format_list',
          'param 4': 'multi_selection',
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
            'param:param 4': '["option-1","option-2"]',
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
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'delete_report_config',
            report_config_id: 'foo',
          },
        });
      });
  });
});
