/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportHostsCommand from 'gmp/commands/report-hosts';
import {createResponse, createHttp} from 'gmp/commands/testing';

describe('ReportHostsCommand tests', () => {
  test('should return report hosts', async () => {
    const response = createResponse({
      get_report_hosts: {
        get_report_hosts_response: {
          host: [
            {
              _id: 'host-1',
              ip: '192.168.1.1',
              hostname: 'host1.example.com',
              start: '2019-06-03T11:00:00Z',
              end: '2019-06-03T11:15:00Z',
              result_count: {
                page: 1,
                high: {__text: 5, page: 1},
                medium: {__text: 3, page: 1},
                low: {__text: 0, page: 1},
                log: {__text: 0, page: 1},
                false_positive: {__text: 0, page: 1},
              },
              detail: [
                {name: 'hostname', value: 'host1.example.com'},
                {name: 'best_os_cpe', value: 'cpe:/o:linux'},
              ],
            },
            {
              _id: 'host-2',
              ip: '192.168.1.2',
              hostname: 'host2.example.com',
              start: '2019-06-03T11:00:00Z',
              end: '2019-06-03T11:15:00Z',
              result_count: {
                page: 1,
                high: {__text: 2, page: 1},
                medium: {__text: 1, page: 1},
                low: {__text: 0, page: 1},
                log: {__text: 0, page: 1},
                false_positive: {__text: 0, page: 1},
              },
              detail: [{name: 'hostname', value: 'host2.example.com'}],
            },
          ],
          results: {
            result: [
              {
                host: {__text: '192.168.1.1'},
                severity: {__text: '8.5', _type: 'CVE'},
              },
              {
                host: {__text: '192.168.1.2'},
                severity: {__text: '5.0', _type: 'CVE'},
              },
            ],
          },
          hosts: {count: 2},
          filters: {
            term: 'first=1 rows=100 sort=severity',
            filter: {_id: ''},
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
    const cmd = new ReportHostsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_hosts',
        details: 1,
        report_id: 'r1',
      },
    });

    const {data} = resp;
    expect(data).toHaveLength(2);
    expect(data[0]).toBeDefined();
    expect(data[1]).toBeDefined();
  });

  test('should handle single host element', async () => {
    const response = createResponse({
      get_report_hosts: {
        get_report_hosts_response: {
          host: {
            _id: 'host-single',
            ip: '10.0.0.1',
            hostname: 'single.example.com',
            start: '2019-06-03T11:00:00Z',
            end: '2019-06-03T11:15:00Z',
            result_count: {
              page: 1,
              high: {__text: 1, page: 1},
              medium: {__text: 0, page: 1},
              low: {__text: 0, page: 1},
              log: {__text: 0, page: 1},
              false_positive: {__text: 0, page: 1},
            },
            detail: [{name: 'hostname', value: 'single.example.com'}],
          },
          results: {
            result: [
              {
                host: {__text: '10.0.0.1'},
                severity: {__text: '3.0', _type: 'CVE'},
              },
            ],
          },
          hosts: {count: 1},
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
    const cmd = new ReportHostsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r2'});

    const {data} = resp;
    expect(data).toHaveLength(1);
  });

  test('should handle empty hosts', async () => {
    const response = createResponse({
      get_report_hosts: {
        get_report_hosts_response: {
          hosts: {count: 0},
          results: {},
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
    const cmd = new ReportHostsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r3'});

    const {data} = resp;
    expect(data).toHaveLength(0);
  });

  test('should throw error for invalid response', async () => {
    const response = createResponse({});

    const fakeHttp = createHttp(response);
    const cmd = new ReportHostsCommand(fakeHttp);

    await expect(cmd.get({report_id: 'r4'})).rejects.toThrow(
      'Invalid response: get_report_hosts not found in response',
    );
  });

  test('should pass filter parameter', async () => {
    const response = createResponse({
      get_report_hosts: {
        get_report_hosts_response: {
          hosts: {count: 0},
          results: {},
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
    const cmd = new ReportHostsCommand(fakeHttp);
    await cmd.get({report_id: 'r5', filter: 'rows=50 first=1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_hosts',
        details: 1,
        report_id: 'r5',
        filter: 'rows=50 first=1',
      },
    });
  });

  test('should include filter in meta', async () => {
    const response = createResponse({
      get_report_hosts: {
        get_report_hosts_response: {
          host: {
            _id: 'host-meta',
            ip: '10.0.0.1',
            hostname: 'meta.example.com',
            start: '2019-06-03T11:00:00Z',
            end: '2019-06-03T11:15:00Z',
            result_count: {
              page: 1,
              high: {__text: 0, page: 1},
              medium: {__text: 0, page: 1},
              low: {__text: 0, page: 1},
              log: {__text: 0, page: 1},
              false_positive: {__text: 0, page: 1},
            },
            detail: [{name: 'hostname', value: 'meta.example.com'}],
          },
          results: {
            result: [
              {
                host: {__text: '10.0.0.1'},
                severity: {__text: '2.0', _type: 'CVE'},
              },
            ],
          },
          hosts: {count: 1},
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
    const cmd = new ReportHostsCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r6'});

    const {filter} = resp.meta;
    expect(filter).toBeDefined();
  });
});
