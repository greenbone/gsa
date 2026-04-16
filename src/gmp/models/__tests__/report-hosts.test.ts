/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import ReportHostsResponse from 'gmp/models/report-host';
import Result from 'gmp/models/result';
import {testModel} from 'gmp/models/testing';

describe('ReportHostsResponse model tests', () => {
  testModel(ReportHostsResponse, 'reporthost');

  test('should use defaults', () => {
    const response = new ReportHostsResponse();

    expect(response.host).toBeUndefined();
    expect(response.report_hosts).toBeUndefined();
    expect(response.report_host_count).toBeUndefined();
    expect(response.filters).toBeUndefined();
    expect(response.sort).toBeUndefined();
    expect(response._status).toBeUndefined();
    expect(response._status_text).toBeUndefined();
  });

  test('should parse empty element', () => {
    const response = ReportHostsResponse.fromElement();

    expect(response.host).toBeUndefined();
    expect(response.report_hosts).toBeUndefined();
    expect(response.report_host_count).toBeUndefined();
    expect(response.filters).toBeUndefined();
    expect(response.sort).toBeUndefined();
    expect(response._status).toBeUndefined();
    expect(response._status_text).toBeUndefined();
  });

  test('should parse response properties', () => {
    const response = ReportHostsResponse.fromElement({
      host: {
        ip: '192.168.1.10',
      } as never,
      report_hosts: {
        _start: '1',
        _max: '10',
      },
      report_host_count: {
        __text: 15,
        filtered: 7,
        page: 10,
      },
      filters: {term: 'rows=10'},
      sort: {field: 'name'},
      _status: '200',
      _status_text: 'OK',
    });

    expect(response.host).toEqual({
      ip: '192.168.1.10',
    });
    expect(response.report_hosts).toEqual({
      _start: '1',
      _max: '10',
    });
    expect(response.report_host_count).toEqual({
      __text: 15,
      filtered: 7,
      page: 10,
    });
    expect(response.filters).toEqual({term: 'rows=10'});
    expect(response.sort).toEqual({field: 'name'});
    expect(response._status).toEqual('200');
    expect(response._status_text).toEqual('OK');
  });

  test('toHostsCollection should use actual host entries for count', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [],
        },
      ] as never,
      report_host_count: {
        __text: 10,
        filtered: 3,
      },
    });

    const collection = response.toHostsCollection(new Filter());

    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(1);
  });

  test('toHostsCollection should use actual host entries for count when filtered is not available', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [],
        },
      ] as never,
      report_host_count: {
        __text: 8,
      },
    });

    const collection = response.toHostsCollection(new Filter());

    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(1);
  });

  test('toClosedCvesCollection should match current parser counting behavior', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [
            {name: 'Closed CVE', value: 'CVE-2024-0001, , CVE-2024-0002  , '},
          ],
        },
      ] as never,
    });

    const collection = response.toClosedCvesCollection(new Filter());

    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(3);
  });

  test('toAppsCollection should count unique apps', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [
            {name: 'App', value: 'nginx'},
            {name: 'App', value: 'postgresql'},
            {name: 'App', value: 'nginx'},
          ],
        },
        {
          ip: '192.168.1.11',
          detail: [
            {name: 'App', value: 'redis'},
            {name: 'App', value: 'postgresql'},
          ],
        },
      ] as never,
    });

    const collection = response.toAppsCollection(new Filter());

    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(3);
  });

  test('toOperatingSystemsCollection should count unique best_os_cpe values', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [
            {name: 'best_os_cpe', value: 'cpe:/o:debian:debian_linux:12'},
          ],
        },
        {
          ip: '192.168.1.11',
          detail: [
            {name: 'best_os_cpe', value: 'cpe:/o:debian:debian_linux:12'},
          ],
        },
        {
          ip: '192.168.1.12',
          detail: [
            {name: 'best_os_cpe', value: 'cpe:/o:canonical:ubuntu_linux:24.04'},
          ],
        },
      ] as never,
    });

    const collection = response.toOperatingSystemsCollection(new Filter());

    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(2);
  });

  test('toClosedCvesCollection should count all closed CVEs', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [
            {name: 'Closed CVE', value: 'CVE-2024-0001, CVE-2024-0002'},
            {name: 'Closed CVE 1', value: 'CVE-2024-0003'},
          ],
        },
        {
          ip: '192.168.1.11',
          detail: [{name: 'Closed CVE', value: 'CVE-2024-0004, CVE-2024-0005'}],
        },
      ] as never,
    });

    const collection = response.toClosedCvesCollection(new Filter());

    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(5);
  });

  test('toHostsCollection should transform result host and detection fields', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [],
        },
      ] as never,
      report_host_count: {
        __text: 1,
      },
    });

    const results = [
      new Result({
        host: {
          name: '192.168.1.10',
          id: 'asset-1',
          hostname: 'server-1',
        },
        severity: 7.5,
        port: '80/tcp',
        scan_nvt_version: '2026-01-01',
        description: 'Test vulnerability',
        compliance: 'incomplete',
        detection: {
          result: {
            id: 'det-1',
            details: {
              source_name: 'banner',
              source_oid: '1.3.6.1.4.1',
            },
          },
        },
      }),
    ];

    const collection = response.toHostsCollection(new Filter(), results);
    const entity = collection.entities?.[0];

    expect(entity).toBeDefined();
  });

  test('toAppsCollection should transform NVT information from results', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
          detail: [{name: 'App', value: 'nginx'}],
        },
      ] as never,
    });

    const results = [
      new Result({
        host: {
          name: '192.168.1.10',
        },
        information: {
          id: '1.3.6.1.4.1.25623.1.0.12345',
          name: 'Test NVT',
        } as never,
        severity: 5.0,
      }),
    ];

    const collection = response.toAppsCollection(new Filter(), results);

    expect(collection).toBeDefined();
    expect(collection.counts?.filtered ?? collection.counts?.all).toEqual(1);
  });

  test('should handle single host object', () => {
    const response = ReportHostsResponse.fromElement({
      host: {
        ip: '192.168.1.10',
        detail: [
          {name: 'App', value: 'nginx'},
          {name: 'best_os_cpe', value: 'cpe:/o:debian:debian_linux:12'},
          {name: 'Closed CVE', value: 'CVE-2024-0001, CVE-2024-0002'},
        ],
      } as never,
      report_host_count: {
        __text: 1,
      },
    });

    const hosts = response.toHostsCollection(new Filter());
    const apps = response.toAppsCollection(new Filter());
    const os = response.toOperatingSystemsCollection(new Filter());
    const cves = response.toClosedCvesCollection(new Filter());

    expect(hosts.counts?.filtered ?? hosts.counts?.all).toEqual(1);
    expect(apps.counts?.filtered ?? apps.counts?.all).toEqual(1);
    expect(os.counts?.filtered ?? os.counts?.all).toEqual(1);
    expect(cves.counts?.filtered ?? cves.counts?.all).toEqual(2);
  });

  test('should handle missing host details', () => {
    const response = ReportHostsResponse.fromElement({
      host: [
        {
          ip: '192.168.1.10',
        },
      ] as never,
    });

    const apps = response.toAppsCollection(new Filter());
    const os = response.toOperatingSystemsCollection(new Filter());
    const cves = response.toClosedCvesCollection(new Filter());

    expect(apps.counts?.filtered ?? apps.counts?.all).toEqual(0);
    expect(os.counts?.filtered ?? os.counts?.all).toEqual(0);
    expect(cves.counts?.filtered ?? cves.counts?.all).toEqual(0);
  });
});
