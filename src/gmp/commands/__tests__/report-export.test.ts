/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import ReportExportCommand from 'gmp/commands/report-export';
import {
  createActionResultResponse,
  createHttp,
  createPlainResponse,
  createResponse,
} from 'gmp/commands/testing';
import date from 'gmp/models/date';
import QueryFilter from 'gmp/models/filter/query-filter';

const createExportResponse = (command: string, id = 'export-uuid') =>
  createResponse({
    [command]: {
      [`${command}_response`]: {_id: id},
    },
  });

describe('ReportExportCommand tests', () => {
  test.each([
    ['exportScanReport', 'export_scan_report'],
    ['exportAuditReport', 'export_audit_report'],
    ['exportDeltaScanReport', 'export_delta_scan_report'],
    ['exportDeltaAuditReport', 'export_delta_audit_report'],
  ])('should create an export with %s', async (method, command) => {
    const fakeHttp = createHttp(createExportResponse(command));
    const exportCommand = new ReportExportCommand(fakeHttp);
    const filter = QueryFilter.fromString('severity>5');

    const response = await exportCommand[method]({
      reportId: 'report-uuid',
      reportFormatId: 'format-uuid',
      reportConfigId: 'config-uuid',
      deltaReportId: 'delta-uuid',
      filter,
      ignorePagination: true,
      lean: false,
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
    expect(response.data).toEqual({id: 'export-uuid'});
  });

  test('should reject an export id from another command envelope', async () => {
    const fakeHttp = createHttp(createExportResponse('export_audit_report'));
    const exportCommand = new ReportExportCommand(fakeHttp);

    await expect(
      exportCommand.exportScanReport({
        reportId: 'report-uuid',
        reportFormatId: 'format-uuid',
      }),
    ).rejects.toThrow('report_export_id not found');
  });

  test('should create an export with a filter id and false boolean options', async () => {
    const fakeHttp = createHttp(createExportResponse('export_scan_report'));
    const exportCommand = new ReportExportCommand(fakeHttp);

    await exportCommand.exportScanReport({
      reportId: 'report-uuid',
      reportFormatId: 'format-uuid',
      filterId: 'filter-uuid',
      ignorePagination: false,
      lean: true,
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'export_scan_report',
        report_id: 'report-uuid',
        format_id: 'format-uuid',
        filter_id: 'filter-uuid',
        ignore_pagination: 0,
        lean: 1,
      },
    });
  });

  test('should parse report export status and metadata', async () => {
    const fakeHttp = createHttp(
      createResponse({
        get_report_export: {
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

    const response = await exportCommand.get({
      reportExportId: 'export-uuid',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_export',
        report_export_id: 'export-uuid',
      },
    });
    expect(response.data).toMatchObject({
      id: 'export-uuid',
      type: 'scan',
      status: 'running',
      progress: 'generating',
      reportId: 'report-uuid',
      reportFormatId: 'format-uuid',
      fileSize: 0,
      attemptCount: 1,
    });
    expect(response.data?.startTime).toEqual(date('2026-09-01T08:40:50.000Z'));
  });

  test('should map unknown status and progress', async () => {
    const fakeHttp = createHttp(
      createResponse({
        get_report_export: {
          get_report_exports_response: {
            report_export: {
              _id: 'export-uuid',
              status: 'paused',
              progress: '50',
            },
          },
        },
      }),
    );
    const exportCommand = new ReportExportCommand(fakeHttp);

    const response = await exportCommand.get({
      reportExportId: 'export-uuid',
    });

    expect(response.data).toMatchObject({
      id: 'export-uuid',
      status: 'unknown',
      progress: undefined,
    });
  });

  test.each([
    ['an absent export', {}],
    [
      'an export without an id',
      {
        report_export: {
          status: 'done',
        },
      },
    ],
  ])('should return undefined for %s', async (_description, reportExport) => {
    const fakeHttp = createHttp(
      createResponse({
        get_report_export: {
          get_report_exports_response: reportExport,
        },
      }),
    );
    const exportCommand = new ReportExportCommand(fakeHttp);

    const response = await exportCommand.get({
      reportExportId: 'export-uuid',
    });

    expect(response.data).toBeUndefined();
  });

  test('should download a completed export', async () => {
    const data = new ArrayBuffer(8);
    const fakeHttp = createHttp(createPlainResponse(data));
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
    expect(response.data).toBe(data);
  });

  test('should decode the base64 file content of a XML wrapped download', async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    const base64 = btoa('%PDF');
    const fakeHttp = createHttp(
      createPlainResponse(
        new TextEncoder().encode(
          `<envelope><download_report_export_response status="200" status_text="OK"><report_export id="export-uuid"><content>${base64}</content></report_export></download_report_export_response></envelope>`,
        ).buffer as ArrayBuffer,
      ),
    );
    const exportCommand = new ReportExportCommand(fakeHttp);

    const response = await exportCommand.downloadReportExport({
      reportExportId: 'export-uuid',
    });

    expect(response.data).toEqual(bytes.buffer as ArrayBuffer);
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
    const fakeHttp = createHttp(createResponse({export_scan_report: {}}));
    const exportCommand = new ReportExportCommand(fakeHttp);

    await expect(
      exportCommand.exportScanReport({
        reportId: 'report-uuid',
        reportFormatId: 'format-uuid',
      }),
    ).rejects.toThrow('report_export_id not found');
  });
});
