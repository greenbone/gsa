/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportCommand from 'gmp/commands/report';
import {
  createHttp,
  createEntityResponse,
  createActionResultResponse,
  createHttpError,
} from 'gmp/commands/testing';
import {ResponseRejection} from 'gmp/http/rejection';
import QueryFilter from 'gmp/models/filter/query-filter';

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

  test('should import a report with default asset handling', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportCommand(fakeHttp);

    await cmd.import({task_id: 'task-1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_report',
        task_id: 'task-1',
        in_assets: 1,
        xml_file: undefined,
      },
    });
  });

  test('should import a report with explicit asset handling and XML', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportCommand(fakeHttp);
    const xmlFile = new File(['<report />'], 'report.xml');

    await cmd.import({task_id: 'task-1', in_assets: 0, xml_file: xmlFile});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_report',
        task_id: 'task-1',
        in_assets: 0,
        xml_file: xmlFile,
      },
    });
  });

  test('should download a report with a filter and delta report', async () => {
    const data = new ArrayBuffer(8);
    const fakeHttp = createHttp(data);
    const cmd = new ReportCommand(fakeHttp);
    const filter = QueryFilter.fromString('severity>5');

    await cmd.download(
      {id: 'report-uuid'},
      {
        reportConfigId: 'config-uuid',
        reportFormatId: 'format-uuid',
        deltaReportId: 'delta-uuid',
        filter,
      },
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        details: 1,
        report_id: 'report-uuid',
        delta_report_id: 'delta-uuid',
        report_config_id: 'config-uuid',
        report_format_id: 'format-uuid',
        filter: 'severity>5 first=1 rows=-1',
      },
      responseType: 'arraybuffer',
    });
  });

  test('should add and remove report assets', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportCommand(fakeHttp);

    await cmd.addAssets({id: 'report-1'});
    await cmd.removeAssets({id: 'report-1', filter: 'host=example'});

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'create_asset',
        report_id: 'report-1',
        filter: '',
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        cmd: 'delete_asset',
        report_id: 'report-1',
        filter: 'host=example',
      },
    });
  });

  test('should send a report alert', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new ReportCommand(fakeHttp);

    await cmd.alert({
      alert_id: 'alert-1',
      report_id: 'report-1',
      filter: 'severity>5',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'report_alert',
        alert_id: 'alert-1',
        report_id: 'report-1',
        filter: 'severity>5',
      },
    });
  });

  test('should get a delta report with custom options', async () => {
    const response = createEntityResponse('report', {_id: 'report-1'});
    const fakeHttp = createHttp(response);
    const cmd = new ReportCommand(fakeHttp);

    const result = await cmd.getDelta(
      {id: 'report-1'},
      {id: 'delta-1'},
      {filter: 'first=1', details: false, custom: 'value'},
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        report_id: 'report-1',
        delta_report_id: 'delta-1',
        filter: 'first=1',
        ignore_pagination: 1,
        details: 0,
      },
      custom: 'value',
    });
    expect(result.data.id).toEqual('report-1');
  });

  test('should get a report with custom flags and options', async () => {
    const response = createEntityResponse('report', {_id: 'report-1'});
    const fakeHttp = createHttp(response);
    const cmd = new ReportCommand(fakeHttp);

    await cmd.get(
      {id: 'report-1', filter: 'name=Report'},
      {
        details: false,
        ignorePagination: false,
        lean: false,
      },
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report',
        report_id: 'report-1',
        filter: 'name=Report',
        lean: 0,
        ignore_pagination: 0,
        details: 0,
      },
    });
  });

  test('should get the report element from the response root', () => {
    const cmd = new ReportCommand(createHttp());
    const report = {_id: 'report-1', name: 'Report'};
    const root = {
      get_report: {
        get_reports_response: {
          report,
        },
      },
    };

    expect(cmd.getElementFromRoot(root)).toEqual(report);
  });
});
