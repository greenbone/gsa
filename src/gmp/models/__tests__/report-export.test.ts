/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import date from 'gmp/models/date';
import ReportExport, {
  type ReportExportProperties,
} from 'gmp/models/report-export';

describe('ReportExport model tests', () => {
  test('should initialize all properties in the constructor', () => {
    const creationTime = date('2026-09-01T08:40:50.000Z');
    const modificationTime = date('2026-09-01T08:41:50.000Z');
    const startTime = date('2026-09-01T08:40:50.000Z');
    const endTime = date('2026-09-01T08:42:50.000Z');
    const properties: ReportExportProperties = {
      _type: 'delta_audit',
      creationTime,
      modificationTime,
      id: 'export-uuid',
      type: 'delta_audit',
      owner: {name: 'alice'},
      name: 'Nightly export',
      attemptCount: 2,
      contentType: 'application/pdf',
      deltaReportId: 'delta-report-uuid',
      endTime,
      errorMessage: 'failed once',
      extension: 'pdf',
      fileSize: 2048,
      progress: 'completed',
      reportConfigId: 'config-uuid',
      reportFormatId: 'format-uuid',
      reportId: 'report-uuid',
      startTime,
      status: 'done',
    };

    const reportExport = new ReportExport(properties);

    expect(reportExport._type).toBe('delta_audit');
    expect(reportExport.creationTime).toBe(creationTime);
    expect(reportExport.modificationTime).toBe(modificationTime);
    expect(reportExport.id).toBe('export-uuid');
    expect(reportExport.type).toBe('delta_audit');
    expect(reportExport.owner).toEqual({name: 'alice'});
    expect(reportExport.name).toBe('Nightly export');
    expect(reportExport.attemptCount).toBe(2);
    expect(reportExport.contentType).toBe('application/pdf');
    expect(reportExport.deltaReportId).toBe('delta-report-uuid');
    expect(reportExport.endTime).toBe(endTime);
    expect(reportExport.errorMessage).toBe('failed once');
    expect(reportExport.extension).toBe('pdf');
    expect(reportExport.fileSize).toBe(2048);
    expect(reportExport.progress).toBe('completed');
    expect(reportExport.reportConfigId).toBe('config-uuid');
    expect(reportExport.reportFormatId).toBe('format-uuid');
    expect(reportExport.reportId).toBe('report-uuid');
    expect(reportExport.startTime).toBe(startTime);
    expect(reportExport.status).toBe('done');
  });

  test('should leave optional properties undefined in the constructor', () => {
    const reportExport = new ReportExport({
      id: 'export-uuid',
      type: 'unknown',
      status: 'unknown',
    });

    expect(reportExport._type).toBeUndefined();
    expect(reportExport.creationTime).toBeUndefined();
    expect(reportExport.modificationTime).toBeUndefined();
    expect(reportExport.owner).toBeUndefined();
    expect(reportExport.name).toBeUndefined();
    expect(reportExport.attemptCount).toBeUndefined();
    expect(reportExport.contentType).toBeUndefined();
    expect(reportExport.deltaReportId).toBeUndefined();
    expect(reportExport.endTime).toBeUndefined();
    expect(reportExport.errorMessage).toBeUndefined();
    expect(reportExport.extension).toBeUndefined();
    expect(reportExport.fileSize).toBeUndefined();
    expect(reportExport.progress).toBeUndefined();
    expect(reportExport.reportConfigId).toBeUndefined();
    expect(reportExport.reportFormatId).toBeUndefined();
    expect(reportExport.reportId).toBeUndefined();
    expect(reportExport.startTime).toBeUndefined();
  });

  test('should parse a report export with all properties', () => {
    const reportExport = ReportExport.fromElement({
      _id: 'export-uuid',
      type: 'delta_audit',
      name: 'Nightly export',
      owner: {name: 'alice'},
      creation_time: '2026-09-01T08:40:50Z',
      modification_time: '2026-09-01T08:41:50Z',
      status: 'done',
      progress: 'completed',
      report: {_id: 'report-uuid'},
      delta_report: {_id: 'delta-report-uuid'},
      report_format: {_id: 'format-uuid'},
      report_config: {_id: 'config-uuid'},
      file_size: '2048',
      content_type: 'application/pdf',
      extension: 'pdf',
      error_message: ' ',
      attempt_count: '2',
      start_time: '2026-09-01T08:40:50Z',
      end_time: '2026-09-01T08:42:50Z',
    });

    expect(reportExport).toBeInstanceOf(ReportExport);
    expect(reportExport.id).toBe('export-uuid');
    expect(reportExport.type).toBe('delta_audit');
    expect(reportExport.name).toBe('Nightly export');
    expect(reportExport.owner).toEqual({name: 'alice'});
    expect(reportExport.status).toBe('done');
    expect(reportExport.progress).toBe('completed');
    expect(reportExport.reportId).toBe('report-uuid');
    expect(reportExport.deltaReportId).toBe('delta-report-uuid');
    expect(reportExport.reportFormatId).toBe('format-uuid');
    expect(reportExport.reportConfigId).toBe('config-uuid');
    expect(reportExport.fileSize).toBe(2048);
    expect(reportExport.contentType).toBe('application/pdf');
    expect(reportExport.extension).toBe('pdf');
    expect(reportExport.errorMessage).toBe(' ');
    expect(reportExport.attemptCount).toBe(2);
    expect(reportExport.creationTime).toEqual(date('2026-09-01T08:40:50.000Z'));
    expect(reportExport.modificationTime).toEqual(
      date('2026-09-01T08:41:50.000Z'),
    );
    expect(reportExport.startTime).toEqual(date('2026-09-01T08:40:50.000Z'));
    expect(reportExport.endTime).toEqual(date('2026-09-01T08:42:50.000Z'));
  });

  test('should map unknown status, progress, and type', () => {
    const reportExport = ReportExport.fromElement({
      _id: 'export-uuid',
      type: 'other',
      status: 'paused',
      progress: '50',
    });

    expect(reportExport.id).toBe('export-uuid');
    expect(reportExport.status).toBe('unknown');
    expect(reportExport.progress).toBeUndefined();
    expect(reportExport.type).toBe('unknown');
  });

  test('should parse an export with optional properties omitted', () => {
    const reportExport = ReportExport.fromElement({_id: 'export-uuid'});

    expect(reportExport.id).toBe('export-uuid');
    expect(reportExport.status).toBe('unknown');
    expect(reportExport.progress).toBeUndefined();
    expect(reportExport.type).toBe('unknown');
    expect(reportExport.reportId).toBeUndefined();
    expect(reportExport.fileSize).toBeUndefined();
    expect(reportExport.attemptCount).toBeUndefined();
    expect(reportExport.startTime).toBeUndefined();
    expect(reportExport.endTime).toBeUndefined();
  });
});
