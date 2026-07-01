/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AuditReportCommand from 'gmp/commands/audit-report';
import {
  createHttp,
  createEntityResponse,
  createActionResultResponse,
  createHttpError,
} from 'gmp/commands/testing';
import {ResponseRejection} from 'gmp/http/rejection';

describe('AuditReportCommand tests', () => {
  test('should request single audit report', async () => {
    const response = createEntityResponse('report', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new AuditReportCommand(fakeHttp);
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

  test('should allow to download an audit report', async () => {
    const data = new ArrayBuffer(8);
    const fakeHttp = createHttp(data);
    const cmd = new AuditReportCommand(fakeHttp);

    const response = await cmd.download(
      {id: 'report-uuid'},
      {
        reportFormatId: 'format-uuid',
      },
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        details: 1,
        report_id: 'report-uuid',
        delta_report_id: undefined,
        report_format_id: 'format-uuid',
        filter: 'first=1 rows=-1',
      },
      responseType: 'arraybuffer',
    });
    expect(response).toBe(data);
  });

  test('should transform error during audit report download', async () => {
    const error = new ResponseRejection<string>(
      {status: 500} as XMLHttpRequest,
      'some error',
      '<gsad_message>Some error</gsad_message>',
    );
    const http = createHttpError(error);
    const cmd = new AuditReportCommand(http);

    await expect(
      cmd.download(
        {id: 'report-uuid'},
        {
          reportFormatId: 'format-uuid',
        },
      ),
    ).rejects.toThrow('some error');
  });

  test('should allow to add assets to an audit report', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AuditReportCommand(fakeHttp);

    await cmd.addAssets({
      id: 'report-uuid',
      filter: 'name~foo',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_asset',
        report_id: 'report-uuid',
        filter: 'name~foo',
      },
    });
  });

  test('should allow to remove assets from an audit report', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AuditReportCommand(fakeHttp);

    await cmd.removeAssets({
      id: 'report-uuid',
      filter: 'name~foo',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_asset',
        report_id: 'report-uuid',
        filter: 'name~foo',
      },
    });
  });

  test('should allow to trigger report alert for an audit report', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new AuditReportCommand(fakeHttp);

    await cmd.alert({
      alert_id: 'alert-uuid',
      report_id: 'report-uuid',
      filter: 'severity>5',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'report_alert',
        alert_id: 'alert-uuid',
        report_id: 'report-uuid',
        filter: 'severity>5',
      },
    });
  });

  test('should request audit report delta with default details', async () => {
    const response = createEntityResponse('report', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new AuditReportCommand(fakeHttp);

    const resp = await cmd.getDelta(
      {id: 'report-uuid'},
      {id: 'delta-report-uuid'},
      {filter: 'severity>0'},
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        report_id: 'report-uuid',
        delta_report_id: 'delta-report-uuid',
        filter: 'severity>0',
        ignore_pagination: 1,
        details: 1,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });

  test('should request audit report delta with details disabled', async () => {
    const response = createEntityResponse('report', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new AuditReportCommand(fakeHttp);

    const resp = await cmd.getDelta(
      {id: 'report-uuid'},
      {id: 'delta-report-uuid'},
      {details: false},
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        report_id: 'report-uuid',
        delta_report_id: 'delta-report-uuid',
        filter: undefined,
        ignore_pagination: 1,
        details: 0,
      },
    });
    expect(resp.data.id).toEqual('foo');
  });
});
