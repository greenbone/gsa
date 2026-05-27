/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportCvesCommand from 'gmp/commands/report-cves';
import {createResponse, createHttp} from 'gmp/commands/testing';

const baseFilters = {
  term: 'first=1 rows=100 sort=severity',
  filter: {_id: ''},
  keywords: {
    keyword: [
      {column: 'first', relation: '=', value: '1'},
      {column: 'rows', relation: '=', value: '100'},
      {column: 'sort', relation: '=', value: 'severity'},
    ],
  },
};

describe('ReportCvesCommand tests', () => {
  test('should return report CVEs from endpoint format', async () => {
    const response = createResponse({
      get_report_cves: {
        get_report_cves_response: {
          cves: {
            cve: [
              {
                host: '192.168.1.1',
                name: 'CVE-2019-1234',
                nvt: {_oid: '1.2.3', name: 'TestNVT'},
                severity: 7.5,
                threat: 'High',
              },
              {
                host: '192.168.1.2',
                name: 'CVE-2020-5678',
                nvt: {_oid: '2.3.4', name: 'AnotherNVT'},
                severity: 5.0,
                threat: 'Medium',
              },
            ],
          },
          filters: baseFilters,
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportCvesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_cves',
        details: 1,
        report_id: 'r1',
      },
    });

    const {data} = resp;
    expect(data).toHaveLength(2);
    expect(data[0].cveId).toEqual('CVE-2019-1234');
    expect(data[0].host.ip).toEqual('192.168.1.1');
    expect(data[0].source?.name).toEqual('1.2.3');
    expect(data[0].source?.description).toEqual('TestNVT');
    expect(data[0].severity).toEqual(7.5);

    expect(data[1].cveId).toEqual('CVE-2020-5678');
    expect(data[1].host.ip).toEqual('192.168.1.2');
    expect(data[1].severity).toEqual(5.0);
  });

  test('should handle single cve element (not array)', async () => {
    const response = createResponse({
      get_report_cves: {
        get_report_cves_response: {
          cves: {
            cve: {
              host: '10.0.0.1',
              name: 'CVE-2021-9999',
              nvt: {_oid: '1.2.3', name: 'SingleNVT'},
              severity: 3.0,
              threat: 'Low',
            },
          },
          filters: baseFilters,
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportCvesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r2'});

    const {data} = resp;
    expect(data).toHaveLength(1);
    expect(data[0].cveId).toEqual('CVE-2021-9999');
    expect(data[0].host.ip).toEqual('10.0.0.1');
    expect(data[0].severity).toEqual(3.0);
  });

  test('should handle missing cves container', async () => {
    const response = createResponse({
      get_report_cves: {
        get_report_cves_response: {
          filters: baseFilters,
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportCvesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r3'});

    expect(resp.data).toHaveLength(0);
  });

  test('should throw error for invalid response', async () => {
    const response = createResponse({});

    const fakeHttp = createHttp(response);
    const cmd = new ReportCvesCommand(fakeHttp);

    await expect(cmd.get({report_id: 'r4'})).rejects.toThrow(
      'Invalid response: get_report_cves not found in response',
    );
  });

  test('should pass filter parameter', async () => {
    const response = createResponse({
      get_report_cves: {
        get_report_cves_response: {
          filters: baseFilters,
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportCvesCommand(fakeHttp);
    await cmd.get({report_id: 'r5', filter: 'rows=50 first=1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_cves',
        details: 1,
        report_id: 'r5',
        filter: 'rows=50 first=1',
      },
    });
  });

  test('should handle nvt text content as description fallback', async () => {
    const response = createResponse({
      get_report_cves: {
        get_report_cves_response: {
          cves: {
            cve: {
              host: '10.0.0.1',
              name: 'CVE-2022-0001',
              nvt: {_oid: '9.9.9', __text: 'NVT from text'},
              severity: 6.0,
              threat: 'Medium',
            },
          },
          filters: baseFilters,
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportCvesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r6'});

    const {data} = resp;
    expect(data).toHaveLength(1);
    expect(data[0].source?.description).toEqual('NVT from text');
  });
});
