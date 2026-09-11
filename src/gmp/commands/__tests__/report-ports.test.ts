/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportPortsCommand from 'gmp/commands/report-ports';
import {createHttp, createResponse} from 'gmp/commands/testing';

describe('ReportPortsCommand tests', () => {
  test('should deduplicate, aggregate, filter, and sort report ports', async () => {
    const response = createResponse({
      get_report_ports: {
        get_report_ports_response: {
          ports: {
            count: 4,
            _start: 2,
            _max: 100,
            port: [
              {
                __text: '443/tcp',
                host: '192.168.1.1',
                severity: 2.5,
                threat: 'Medium',
              },
              {
                __text: '443/tcp',
                host: '192.168.1.2',
                severity: 7.5,
              },
              {
                __text: '22/tcp',
                host: '192.168.1.1',
                severity: 5.0,
                threat: 'High',
              },
              {
                __text: 'general/tcp',
                host: '192.168.1.3',
                severity: 10,
              },
              {
                host: '192.168.1.4',
                severity: 10,
              },
            ],
          },
          filters: {
            term: 'first=2 rows=100',
            filter: {_id: ''},
            keywords: {
              keyword: [
                {column: 'first', relation: '=', value: '2'},
                {column: 'rows', relation: '=', value: '100'},
              ],
            },
          },
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportPortsCommand(fakeHttp);

    const result = await cmd.get({report_id: 'report-1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_ports',
        details: 1,
        report_id: 'report-1',
      },
    });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('443/tcp');
    expect(result.data[0].number).toBe(443);
    expect(result.data[0].protocol).toBe('tcp');
    expect(result.data[0].severity).toBe(7.5);
    expect(result.data[0].hosts.count).toBe(2);
    expect(result.data[1].id).toBe('22/tcp');
    expect(result.data[1].severity).toBe(5);
    expect(result.data[1].hosts.count).toBe(1);
    expect(result.meta.counts.all).toBe(4);
    expect(result.meta.counts.first).toBe(2);
    expect(result.meta.counts.rows).toBe(100);
    expect(result.meta.filter).toBeDefined();
  });

  test('should handle a single report port', async () => {
    const response = createResponse({
      get_report_ports: {
        get_report_ports_response: {
          ports: {
            port: {
              __text: '80/tcp',
              host: '192.168.1.1',
              severity: 3,
            },
          },
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportPortsCommand(fakeHttp);

    const result = await cmd.get();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('80/tcp');
    expect(result.data[0].hosts.count).toBe(1);
  });

  test('should handle empty report ports', async () => {
    const fakeHttp = createHttp(
      createResponse({
        get_report_ports: {
          get_report_ports_response: {
            ports: {count: 0},
          },
        },
      }),
    );
    const cmd = new ReportPortsCommand(fakeHttp);

    const result = await cmd.get({filter: 'first=1 rows=100'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_ports',
        details: 1,
        filter: 'first=1 rows=100',
      },
    });
    expect(result.data).toEqual([]);
    expect(result.meta.counts.all).toBe(0);
  });

  test('should throw an error for an invalid response', async () => {
    const fakeHttp = createHttp(createResponse({}));
    const cmd = new ReportPortsCommand(fakeHttp);

    await expect(cmd.get()).rejects.toThrow(
      'Invalid response: get_report_ports not found in response',
    );
  });
});
