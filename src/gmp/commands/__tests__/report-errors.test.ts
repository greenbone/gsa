/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportErrorsCommand from 'gmp/commands/report-errors';
import {createResponse, createHttp} from 'gmp/commands/testing';

describe('ReportErrorsCommand tests', () => {
  test('should return report errors', async () => {
    const response = createResponse({
      get_report_errors: {
        get_report_errors_response: {
          errors: {
            error: [
              {
                host: {
                  ip: '192.168.1.00',
                  hostname: 'host1.example.com',
                },
                port: 443,
                nvt: {
                  _id: 'nvt-1',
                  name: 'Test NVT 1',
                },
                description: 'Error description 1',
              },
              {
                host: {
                  ip: '192.168.1.2000',
                  hostname: 'host2.example.com',
                },
                port: 8080,
                nvt: {
                  _id: 'nvt-2',
                  name: 'Test NVT 2',
                },
                description: 'Error description 2',
              },
            ],
          },
          host: [
            {
              _id: 'host-1',
              ip: '192.168.1.00',
              hostname: 'host1.example.com',
            },
            {
              _id: 'host-2',
              ip: '192.168.1.2000',
              hostname: 'host2.example.com',
            },
          ],
          filters: {
            term: 'first=1 rows=100 sort=severity',
            filter: {
              _id: '',
            },
            keywords: {
              keyword: [
                {column: 'first', relation: '=', value: '1'},
                {column: 'rows', relation: '=', value: '100'},
                {column: 'sort', relation: '=', value: 'severity'},
              ],
            },
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportErrorsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_errors',
        details: 1,
        report_id: 'r1',
      },
    });

    const {data} = resp;

    expect(data).toHaveLength(2);
    expect(data[0]).toBeDefined();
    expect(data[1]).toBeDefined();
  });

  test('should handle single error element', async () => {
    const response = createResponse({
      get_report_errors: {
        get_report_errors_response: {
          errors: {
            error: {
              host: {
                ip: '10.0.0.00',
                hostname: 'single.example.com',
              },
              port: 443,
              nvt: {
                _id: 'nvt-single',
                name: 'Single NVT',
              },
              description: 'Single error',
            },
          },
          host: {
            _id: 'host-single',
            ip: '10.0.0.00',
            hostname: 'single.example.com',
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
    const cmd = new ReportErrorsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r2'});

    const {data} = resp;
    expect(data).toHaveLength(1);
  });

  test('should handle empty errors', async () => {
    const response = createResponse({
      get_report_errors: {
        get_report_errors_response: {
          errors: {},
          host: [],
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
    const cmd = new ReportErrorsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r3'});

    const {data} = resp;
    expect(data).toHaveLength(0);
  });

  test('should throw error for invalid response', async () => {
    const response = createResponse({});

    const fakeHttp = createHttp(response);
    const cmd = new ReportErrorsCommand(fakeHttp);

    await expect(cmd.get({report_id: 'r4'})).rejects.toThrow(
      'Invalid response: get_report_errors not found in response',
    );
  });

  test('should pass filter parameter', async () => {
    const response = createResponse({
      get_report_errors: {
        get_report_errors_response: {
          errors: {},
          host: [],
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
    const cmd = new ReportErrorsCommand(fakeHttp);
    await cmd.get({report_id: 'r5', filter: 'rows=50 first=1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_errors',
        details: 1,
        report_id: 'r5',
        filter: 'rows=50 first=1',
      },
    });
  });

  test('should handle multiple hosts', async () => {
    const response = createResponse({
      get_report_errors: {
        get_report_errors_response: {
          errors: {
            error: [
              {
                host: {
                  ip: '192.168.1.00',
                  hostname: 'host1.example.com',
                },
                port: 443,
                nvt: {
                  _id: 'nvt-1',
                  name: 'Test NVT 1',
                },
                description: 'Error on host1',
              },
              {
                host: {
                  ip: '192.168.1.2000',
                  hostname: 'host2.example.com',
                },
                port: 443,
                nvt: {
                  _id: 'nvt-1',
                  name: 'Test NVT 1',
                },
                description: 'Error on host2',
              },
            ],
          },
          host: [
            {
              _id: 'host-1',
              ip: '192.168.1.00',
              hostname: 'host1.example.com',
            },
            {
              _id: 'host-2',
              ip: '192.168.1.2000',
              hostname: 'host2.example.com',
            },
            {
              _id: 'host-3',
              ip: '192.168.1.3000',
              hostname: 'host3.example.com',
            },
          ],
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
    const cmd = new ReportErrorsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r6'});

    const {data} = resp;
    expect(data).toHaveLength(2);
  });

  test('should include filter in meta', async () => {
    const response = createResponse({
      get_report_errors: {
        get_report_errors_response: {
          errors: {
            error: {
              host: {ip: '10.0.0.00'},
              port: 443,
              nvt: {_id: 'nvt-1'},
              description: 'Error',
            },
          },
          host: {ip: '10.0.0.00'},
          filters: {
            term: 'rows=50 first=1 sort=ip',
            filter: {_id: ''},
            keywords: {
              keyword: [
                {column: 'rows', relation: '=', value: '50'},
                {column: 'first', relation: '=', value: '1'},
                {column: 'sort', relation: '=', value: 'ip'},
              ],
            },
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportErrorsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r7'});

    const {filter} = resp.meta;
    expect(filter).toBeDefined();
  });
});
