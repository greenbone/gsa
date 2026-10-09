/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import ReportExportCommand from 'gmp/commands/report-export';
import {
  createActionResultResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import QueryFilter from 'gmp/models/filter/query-filter';

const createExportResponse = (id = 'export-uuid') =>
  createResponse({
    action_result: {
      report_export_id: id,
    },
  });

describe('ReportExportCommand tests', () => {
  test.each([
    ['exportScanReport', 'export_scan_report'],
    ['exportAuditReport', 'export_audit_report'],
    ['exportDeltaScanReport', 'export_delta_scan_report'],
    ['exportDeltaAuditReport', 'export_delta_audit_report'],
  ])('should create an export with %s', async (method, command) => {
    const fakeHttp = createHttp(createExportResponse());
    const exportCommand = new ReportExportCommand(fakeHttp);
    const filter = QueryFilter.fromString('severity>5');

    await exportCommand[method]({
      report_id: 'report-uuid',
      format_id: 'format-uuid',
      config_id: 'config-uuid',
      delta_report_id: 'delta-uuid',
      filter,
      ignore_pagination: 1,
      lean: 0,
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: command,
        report_id: 'report-uuid',
        format_id: 'format-uuid',
        config_id: 'config-uuid',
        delta_report_id: 'delta-uuid',
        filter: 'severity>5 first=1 rows=-1',
        ignore_pagination: 1,
        lean: 0,
      },
    });
  });

  test('should return the report export id', async () => {
    const fakeHttp = createHttp(createExportResponse('export-uuid'));
    const exportCommand = new ReportExportCommand(fakeHttp);

    const response = await exportCommand.exportScanReport({
      report_id: 'report-uuid',
      format_id: 'format-uuid',
    });

    expect(response.data).toEqual({id: 'export-uuid'});
  });

  test('should parse the export id from the command response attribute', async () => {
    const fakeHttp = createHttp(
      createResponse({
        export_scan_report: {
          export_scan_report_response: {
            _id: 'export-uuid',
          },
        },
      }),
    );
    const exportCommand = new ReportExportCommand(fakeHttp);

    const response = await exportCommand.exportScanReport({
      report_id: 'report-uuid',
      format_id: 'format-uuid',
    });

    expect(response.data).toEqual({id: 'export-uuid'});
  });

  test.each(['get_report_export', 'get_report_exports'])(
    'should parse report export status and metadata from %s',
    async wrapper => {
      const fakeHttp = createHttp(
        createResponse({
          [wrapper]: {
            get_report_exports_response: {
              report_export: {
                _id: 'export-uuid',
                type: 'scan',
                status: 'running',
                progress: 'generating',
                report: {_id: 'report-uuid'},
                report_format: {_id: 'format-uuid'},
                file_size: '0',
                content_type: '',
                extension: '',
                error_message: '',
                attempt_count: '1',
                start_time: '2026-09-01T08:40:50Z',
              },
            },
          },
        }),
      );
      const exportCommand = new ReportExportCommand(fakeHttp);

      const response = await exportCommand.getReportExport({
        reportExportId: 'export-uuid',
      });

      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_report_export',
          report_export_id: 'export-uuid',
        },
      });
      expect(response.data).toEqual([
        {
          id: 'export-uuid',
          type: 'scan',
          status: 'running',
          progress: 'generating',
          reportId: 'report-uuid',
          reportFormatId: 'format-uuid',
          fileSize: 0,
          contentType: '',
          extension: '',
          errorMessage: '',
          attemptCount: 1,
          startTime: '2026-09-01T08:40:50Z',
        },
      ]);
    },
  );

  test('should download a completed export', async () => {
    const data = new ArrayBuffer(8);
    const fakeHttp = createHttp(data);
    const exportCommand = new ReportExportCommand(fakeHttp);

    const response = await exportCommand.downloadReportExport({
      reportExportId: 'export-uuid',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'download_report_export',
        report_export_id: 'export-uuid',
      },
      responseType: 'arraybuffer',
    });
    expect(response).toBe(data);
  });

  test('lists exports with explicit pagination and owner metadata', async () => {
    const fakeHttp = createHttp(
      createResponse({
        get_report_exports: {
          get_report_exports_response: {
            report_export: {
              _id: 'export-uuid',
              owner: {name: 'alice'},
              creation_time: '2026-09-01T08:40:50Z',
              status: 'done',
            },
            report_exports: {_start: 101, _max: 100},
            report_export_count: {page: 1, filtered: 101, __text: 101},
          },
        },
      }),
    );
    const command = new ReportExportCommand(fakeHttp);
    const response = await command.getReportExports({
      filter: QueryFilter.fromString('owner="alice" first=101 rows=100'),
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_exports',
        filter: 'owner="alice" first=101 rows=100',
      },
    });
    expect(response.data[0]).toMatchObject({
      id: 'export-uuid',
      owner: {name: 'alice'},
    });
    expect(response.data[0].creationTime?.toISOString()).toBe(
      '2026-09-01T08:40:50.000Z',
    );
    expect(response.meta.counts).toMatchObject({
      first: 101,
      filtered: 101,
      length: 1,
    });
  });

  test('should cancel a report export', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const exportCommand = new ReportExportCommand(fakeHttp);

    await exportCommand.cancelReportExport({
      reportExportId: 'export-uuid',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'cancel_report_export',
        report_export_id: 'export-uuid',
      },
    });
  });

  test('should reject a create response without an export id', async () => {
    const fakeHttp = createHttp(createResponse({action_result: {}}));
    const exportCommand = new ReportExportCommand(fakeHttp);

    await expect(
      exportCommand.exportScanReport({
        report_id: 'report-uuid',
        format_id: 'format-uuid',
      }),
    ).rejects.toThrow('report_export_id not found');
  });
});
