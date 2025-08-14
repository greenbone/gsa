/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import PerformanceCommand, {
  DEFAULT_SENSOR_ID,
  PerformanceReport,
} from 'gmp/commands/performance';
import {
  createHttp,
  createHttpError,
  createResponse,
} from 'gmp/commands/testing';
import date from 'gmp/models/date';

describe('PerformanceReport', () => {
  test('should initialize with name and title', () => {
    const mockData = {
      name: 'Test Report',
      title: 'Test Title',
      report: undefined,
    };

    const performanceReport = new PerformanceReport(mockData);

    expect(performanceReport.name).toBe('Test Report');
    expect(performanceReport.title).toBe('Test Title');
    expect(performanceReport.details).toBeUndefined();
  });

  test('should initialize with details when report is defined', () => {
    const mockData = {
      name: 'Test Report',
      title: 'Test Title',
      report: {
        _format: 'txt',
        _start_time: '2024-01-01T00:00:00Z',
        _end_time: '2024-01-01T01:00:00Z',
        _duration: 3600,
        __text: 'Report content',
      },
    };

    const performanceReport = new PerformanceReport(mockData);

    expect(performanceReport.name).toBe('Test Report');
    expect(performanceReport.title).toBe('Test Title');
    expect(performanceReport.details).toBeDefined();
    expect(performanceReport.details?.format).toBe('txt');
    expect(performanceReport.details?.startTime).toEqual(
      date('2024-01-01T00:00:00.000Z'),
    );
    expect(performanceReport.details?.endTime).toEqual(
      date('2024-01-01T01:00:00.000Z'),
    );
    expect(performanceReport.details?.duration).toBe(3600);
    expect(performanceReport.details?.text).toBe('Report content');
  });
});

describe('PerformanceCommand', () => {
  test('should fetch all performance reports', async () => {
    const response = createResponse({
      get_system_reports: {
        get_system_reports_response: {
          system_report: [
            {name: 'Report1', title: 'Title1'},
            {name: 'Report2', title: 'Title2'},
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);
    const performanceCommand = new PerformanceCommand(fakeHttp);
    const result = await performanceCommand.getAll();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_system_reports',
        slave_id: DEFAULT_SENSOR_ID,
      },
    });
    expect(result.data).toEqual([
      new PerformanceReport({name: 'Report1', title: 'Title1'}),
      new PerformanceReport({name: 'Report2', title: 'Title2'}),
    ]);
  });

  test('should throw an error if getAll has an error', async () => {
    const fakeHttp = createHttpError(new Error('Network error'));
    const performanceCommand = new PerformanceCommand(fakeHttp);

    await expect(performanceCommand.getAll()).rejects.toThrow('Network error');
  });

  test('should fetch a specific performance report by name', async () => {
    const response = createResponse({
      get_system_report: {
        get_system_reports_response: {
          system_report: {
            name: 'Report1',
            title: 'Title1',
            report: {
              _format: 'txt',
              _start_time: '2024-01-01T00:00:00Z',
              _end_time: '2024-01-01T01:00:00Z',
              _duration: 3600,
              __text: 'Report content',
            },
          },
        },
      },
    });
    const fakeHttp = createHttp(response);
    const performanceCommand = new PerformanceCommand(fakeHttp);

    const result = await performanceCommand.get({name: 'Report1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_system_report',
        slave_id: DEFAULT_SENSOR_ID,
        name: 'Report1',
      },
    });
    const report = result.data;
    expect(report.name).toEqual('Report1');
    expect(report.title).toEqual('Title1');
    expect(report.details).toBeDefined();
    expect(report.details?.format).toEqual('txt');
    expect(report.details?.startTime).toEqual(date('2024-01-01T00:00:00.000Z'));
    expect(report.details?.endTime).toEqual(date('2024-01-01T01:00:00.000Z'));
    expect(report.details?.duration).toEqual(3600);
    expect(report.details?.text).toEqual('Report content');
  });

  test('should fetch a specific performance report with start and end date', async () => {
    const startDate = date('2024-01-01T01:00:00Z').tz('Europe/Berlin');
    const endDate = date('2024-01-01T02:00:00Z').tz('Europe/Berlin');
    const response = createResponse({
      get_system_report: {
        get_system_reports_response: {
          system_report: {
            name: 'Report1',
            title: 'Title1',
            report: {
              _format: 'txt',
              _start_time: '2024-01-01T00:00:00Z',
              _end_time: '2024-01-01T01:00:00Z',
              _duration: 3600,
              __text: 'Report content',
            },
          },
        },
      },
    });
    const fakeHttp = createHttp(response);
    const performanceCommand = new PerformanceCommand(fakeHttp);

    const result = await performanceCommand.get({
      name: 'Report1',
      startDate,
      endDate,
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_system_report',
        slave_id: DEFAULT_SENSOR_ID,
        name: 'Report1',
        start_time: '2024-01-01T02:00:00+01:00',
        end_time: '2024-01-01T03:00:00+01:00',
      },
    });
    const report = result.data;
    expect(report.name).toEqual('Report1');
    expect(report.title).toEqual('Title1');
    expect(report.details).toBeDefined();
    expect(report.details?.format).toEqual('txt');
    expect(report.details?.startTime).toEqual(date('2024-01-01T00:00:00.000Z'));
    expect(report.details?.endTime).toEqual(date('2024-01-01T01:00:00.000Z'));
    expect(report.details?.duration).toEqual(3600);
    expect(report.details?.text).toEqual('Report content');
  });
});
