/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ReportFormatCommand} from 'gmp/commands/report-format';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';

describe('ReportFormatCommand tests', () => {
  test('should import a report format', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportFormatCommand(fakeHttp);

    const result = await cmd.import({xmlFile: '<report_format />'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'import_report_format',
        xml_file: '<report_format />',
      },
    });
    expect(result.data.id).toEqual('foo');
  });

  test('should save an active report format', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportFormatCommand(fakeHttp);

    const result = await cmd.save({
      active: true,
      id: 'format-1',
      name: 'HTML Report',
      summary: 'HTML summary',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_report_format',
        enable: true,
        report_format_id: 'format-1',
        name: 'HTML Report',
        summary: 'HTML summary',
      },
    });
    expect(result.data.id).toEqual('foo');
  });

  test('should save an inactive report format', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportFormatCommand(fakeHttp);

    await cmd.save({
      active: false,
      id: 'format-1',
      name: 'HTML Report',
      summary: 'HTML summary',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_report_format',
        enable: false,
        report_format_id: 'format-1',
        name: 'HTML Report',
        summary: 'HTML summary',
      },
    });
  });

  test('should return a single report format', async () => {
    const fakeHttp = createHttp(
      createEntityResponse('report_format', {_id: 'format-1'}),
    );
    const cmd = new ReportFormatCommand(fakeHttp);

    const result = await cmd.get({id: 'format-1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_format',
        report_format_id: 'format-1',
      },
    });
    expect(result.data.id).toEqual('format-1');
  });

  test('should get the report format element from the response root', () => {
    const cmd = new ReportFormatCommand(createHttp());
    const format = {_id: 'format-1', name: 'HTML Report'};
    const root = {
      get_report_format: {
        get_report_formats_response: {
          report_format: format,
        },
      },
    };

    expect(cmd.getElementFromRoot(root)).toEqual(format);
  });

  test('should return an empty report format for an incomplete response root', () => {
    const cmd = new ReportFormatCommand(createHttp());

    expect(cmd.getElementFromRoot(createResponse({}).data)).toEqual({});
  });
});
