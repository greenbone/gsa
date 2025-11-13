/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportCommand from 'gmp/commands/report';
import {
  createHttp,
  createEntityResponse,
  createHttpError,
} from 'gmp/commands/testing';
import {ResponseRejection} from 'gmp/http/rejection';

describe('ReportCommand tests', () => {
  test('should request single report', async () => {
    const response = createEntityResponse('report', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new ReportCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        report_id: 'foo',
        ignore_pagination: 1,
        details: 1,
        lean: 1,
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to download a report', async () => {
    const data = new ArrayBuffer(8);
    const fakeHttp = createHttp(data);
    const cmd = new ReportCommand(fakeHttp);
    const response = await cmd.download(
      {id: 'report-uuid'},
      {
        reportConfigId: 'config-uuid',
        reportFormatId: 'format-uuid',
      },
    );
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        details: 1,
        report_id: 'report-uuid',
        delta_report_id: undefined,
        report_config_id: 'config-uuid',
        report_format_id: 'format-uuid',
        filter: 'first=1 rows=-1',
      },
      responseType: 'arraybuffer',
    });
    expect(response).toBe(data);
  });

  test('should transform error during report download', async () => {
    const error = new ResponseRejection<string>(
      {status: 500} as XMLHttpRequest,
      'some error',
      '<gsad_message>Some error</gsad_message>',
    );
    const http = createHttpError(error);
    const cmd = new ReportCommand(http);
    await expect(
      cmd.download(
        {id: 'report-uuid'},
        {
          reportConfigId: 'config-uuid',
          reportFormatId: 'format-uuid',
        },
      ),
    ).rejects.toThrow('some error');
  });
});
