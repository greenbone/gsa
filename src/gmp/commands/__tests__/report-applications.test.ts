/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportApplicationsCommand from 'gmp/commands/report-applications';
import {createResponse, createHttp} from 'gmp/commands/testing';

describe('ReportApplicationsCommand tests', () => {
  test('should return report applications', async () => {
    const response = createResponse({
      get_report_applications: {
        get_report_applications_response: {
          applications: {
            count: 2,
            application: [
              {
                name: 'cpe:/a:vendor:product-1:1.0',
                hosts_count: 1,
                occurrences: 3,
                severity: 5.0,
                threat: 'Medium',
              },
              {
                name: 'cpe:/a:vendor:product-2:2.0',
                hosts_count: 2,
                occurrences: 1,
                severity: 0.0,
                threat: 'Log',
              },
            ],
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportApplicationsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_applications',
        details: 1,
        report_id: 'r1',
      },
    });

    const {data} = resp;

    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('cpe:/a:vendor:product-1:1.0');
    expect(data[0].hosts.count).toBe(1);
    expect(data[0].occurrences.total).toBe(3);
    expect(data[0].severity).toBe(5.0);
    expect(data[1].name).toBe('cpe:/a:vendor:product-2:2.0');
  });

  test('should handle single application element', async () => {
    const response = createResponse({
      get_report_applications: {
        get_report_applications_response: {
          applications: {
            count: 1,
            application: {
              name: 'cpe:/a:vendor:single-app:1.0',
              hosts_count: 1,
              occurrences: 1,
              severity: 0.0,
              threat: 'Log',
            },
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportApplicationsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r2'});

    const {data} = resp;
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('cpe:/a:vendor:single-app:1.0');
  });

  test('should handle empty applications', async () => {
    const response = createResponse({
      get_report_applications: {
        get_report_applications_response: {
          applications: {
            count: 0,
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportApplicationsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r3'});

    const {data} = resp;
    expect(data).toHaveLength(0);
  });

  test('should throw error for invalid response', async () => {
    const response = createResponse({});

    const fakeHttp = createHttp(response);
    const cmd = new ReportApplicationsCommand(fakeHttp);

    await expect(cmd.get({report_id: 'r4'})).rejects.toThrow(
      'Invalid response: get_report_applications not found in response',
    );
  });

  test('should pass filter parameter', async () => {
    const response = createResponse({
      get_report_applications: {
        get_report_applications_response: {
          applications: {
            count: 0,
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportApplicationsCommand(fakeHttp);
    await cmd.get({report_id: 'r5', filter: 'first=1 rows=100'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_applications',
        details: 1,
        report_id: 'r5',
        filter: 'first=1 rows=100',
      },
    });
  });

  test('should include filter in meta', async () => {
    const response = createResponse({
      get_report_applications: {
        get_report_applications_response: {
          applications: {
            count: 1,
            application: {
              name: 'cpe:/a:vendor:app:1.0',
              hosts_count: 1,
              occurrences: 1,
              severity: 0.0,
              threat: 'Log',
            },
          },
          filters: {
            term: 'first=1 rows=100',
            filter: {_id: ''},
            keywords: {
              keyword: [
                {column: 'first', relation: '=', value: '1'},
                {column: 'rows', relation: '=', value: '100'},
              ],
            },
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportApplicationsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r6'});

    const {filter} = resp.meta;
    expect(filter).toBeDefined();
  });
});
