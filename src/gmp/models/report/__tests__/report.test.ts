/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {emptyCollectionList} from 'gmp/models/report/parser';
import ReportReport from 'gmp/models/report/report';
import {parseDate} from 'gmp/parser';

describe('ReportReport tests', () => {
  test('should use defaults', () => {
    const report = new ReportReport();
    expect(report.applications).toBeUndefined();
    expect(report.closedCves).toBeUndefined();
    expect(report.cves).toBeUndefined();
    expect(report.delta_report).toBeUndefined();
    expect(report.errors).toBeUndefined();
    expect(report.filter).toBeUndefined();
    expect(report.hosts).toBeUndefined();
    expect(report.operatingsystems).toBeUndefined();
    expect(report.ports).toBeUndefined();
    expect(report.report_type).toBeUndefined();
    expect(report.results).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.severity).toBeUndefined();
    expect(report.task).toBeUndefined();
    expect(report.tlsCertificates).toBeUndefined();
  });

  test('should parse empty element', () => {
    const report = ReportReport.fromElement();
    const filter = new Filter();
    const emptyCollection = emptyCollectionList(filter);
    expect(report.applications).toEqual(emptyCollection);
    expect(report.closedCves).toEqual(emptyCollection);
    expect(report.cves).toEqual(emptyCollection);
    expect(report.delta_report).toBeUndefined();
    expect(report.errors).toEqual(emptyCollection);
    expect(report.filter).toBeDefined();
    expect(report.hosts).toBeDefined();
    expect(report.operatingsystems).toBeDefined();
    expect(report.ports).toBeDefined();
    expect(report.report_type).toBeUndefined();
    expect(report.results).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.severity).toBeUndefined();
    expect(report.task).toBeDefined();
    expect(report.tlsCertificates).toBeDefined();
  });

  test('should parse filter', () => {
    const report = ReportReport.fromElement({
      filters: {
        _id: 'filter1',
        term: 'foo=bar',
      },
    });
    expect(report.filter).toBeDefined();
    expect(report.filter?.id).toEqual('filter1');
    expect(report.filter?.toFilterString()).toEqual('foo=bar');
  });

  test('should parse report type', () => {
    const report = ReportReport.fromElement({
      _type: 'delta',
    });
    expect(report.report_type).toEqual('delta');
  });

  test('should parse severity', () => {
    const report = ReportReport.fromElement({
      severity: {
        filtered: 5.0,
        full: 7.0,
      },
    });
    expect(report.severity).toBeDefined();
    expect(report.severity?.filtered).toEqual(5.0);
    expect(report.severity?.full).toEqual(7.0);
  });

  test('should parse scan start', () => {
    const report = ReportReport.fromElement({
      scan_start: '2024-01-01T00:00:00Z',
    });
    expect(report.scan_start).toEqual(parseDate('2024-01-01T00:00:00Z'));
  });

  test('should parse scan end', () => {
    const report = ReportReport.fromElement({
      scan_end: '2024-01-02T00:00:00Z',
    });
    expect(report.scan_end).toEqual(parseDate('2024-01-02T00:00:00Z'));
  });

  test('should parse task', () => {
    const report = ReportReport.fromElement({
      task: {
        _id: 'task1',
        name: 'Test Task',
      },
    });
    expect(report.task).toBeDefined();
    expect(report.task?.id).toEqual('task1');
    expect(report.task?.name).toEqual('Test Task');
  });

  test('should parse delta report', () => {
    const report = ReportReport.fromElement({
      delta: {
        report: {
          _id: 'delta1',
          scan_run_status: 'completed',
          scan_start: '2024-01-01T00:00:00Z',
          scan_end: '2024-01-02T00:00:00Z',
        },
      },
    });
    expect(report.delta_report).toBeDefined();
    expect(report.delta_report?.id).toEqual('delta1');
    expect(report.delta_report?.scan_run_status).toEqual('completed');
    expect(report.delta_report?.scan_start).toEqual(
      parseDate('2024-01-01T00:00:00Z'),
    );
    expect(report.delta_report?.scan_end).toEqual(
      parseDate('2024-01-02T00:00:00Z'),
    );
  });

  test('should parse applications', () => {
    const report = ReportReport.fromElement({
      // apps are gathered from the host details
      host: [
        {
          detail: [
            {
              name: 'App',
              value: 'app1',
            },
          ],
          ip: '1.1.1.1',
        },
      ],
      apps: {
        count: 123,
      },
      // results are used to get the app severity
      results: {
        result: [
          {
            severity: 5.5,
            detection: {
              result: {
                details: {
                  detail: [
                    {
                      name: 'product',
                      value: 'app1',
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    });
    expect(report.applications).toBeDefined();
    expect(report.applications?.counts?.all).toEqual(123);
    expect(report.applications?.counts?.filtered).toEqual(1);
    expect(report.applications?.counts?.rows).toEqual(1);
    expect(report.applications?.counts?.length).toEqual(1);
    expect(report.applications?.entities.length).toEqual(1);
    expect(report.applications?.entities[0].id).toEqual('app1');
    expect(report.applications?.entities[0].name).toEqual('app1');
    expect(report.applications?.entities[0].severity).toEqual(5.5);
  });

  test('should parse results', () => {
    const report = ReportReport.fromElement({
      results: {
        result: [
          {
            _id: 'result1',
            severity: 4.0,
          },
        ],
      },
      result_count: {
        __text: '1',
        full: 3,
        filtered: 2,
      },
    });
    expect(report.results).toBeDefined();
    expect(report.results?.counts?.all).toEqual(3);
    expect(report.results?.counts?.filtered).toEqual(2);
    expect(report.results?.counts?.rows).toEqual(2);
    expect(report.results?.counts?.length).toEqual(1);
    expect(report.results?.entities.length).toEqual(1);
    expect(report.results?.entities[0].id).toEqual('result1');
    expect(report.results?.entities[0].severity).toEqual(4.0);
  });

  test('should parse TLS certificates', () => {
    const report = ReportReport.fromElement({
      ssl_certs: {
        count: 43,
      },
      tls_certificates: {
        tls_certificate: [
          {
            name: '57610B6A3C73866870678E638C7825743145B24',
            certificate: {
              __text: '66870678E638C7825743145B247554E0D92C94',
              _format: 'DER',
            },
            sha256_fingerprint: '57610B6A3C73866870678E638C78',
            md5_fingerprint: 'fa:a9:9d:f2:28:cc:2c:c0:80:16',
            activation_time: '2019-08-10T12:51:27Z',
            expiration_time: '2019-09-10T12:51:27Z',
            valid: 1,
            subject_dn: 'CN=LoremIpsumSubject C=Dolor',
            issuer_dn: 'CN=LoremIpsumIssuer C=Dolor',
            serial: '00B49C541FF5A8E1D9',
            host: {ip: '192.168.9.90', hostname: 'foo.bar'},
            ports: {port: [4021, 4023]},
          },
        ],
      },
    });
    expect(report.tlsCertificates).toBeDefined();
    expect(report.tlsCertificates?.counts?.all).toEqual(43);
    expect(report.tlsCertificates?.counts?.filtered).toEqual(2);
    expect(report.tlsCertificates?.counts?.rows).toEqual(2);
    expect(report.tlsCertificates?.counts?.length).toEqual(2);
    expect(report.tlsCertificates?.entities?.length).toEqual(2);
    expect(report.tlsCertificates?.entities[0].id).toEqual(
      '192.168.9.90:4021:57610B6A3C73866870678E638C7825743145B24',
    );
  });

  test('should parse hosts', () => {
    const report = ReportReport.fromElement({
      host: [
        {
          ip: '1.1.1.1',
        },
      ],
      hosts: {
        count: 123,
      },
      results: {
        result: [
          {
            _id: '123',
            host: {
              __text: '1.1.1.1',
            },
            severity: 7,
          },
        ],
      },
    });
    expect(report.hosts).toBeDefined();
    expect(report.hosts?.counts?.all).toEqual(123);
    expect(report.hosts?.counts?.filtered).toEqual(1);
    expect(report.hosts?.counts?.rows).toEqual(1);
    expect(report.hosts?.counts?.length).toEqual(1);
    expect(report.hosts?.entities.length).toEqual(1);
    expect(report.hosts?.entities[0].id).toEqual('1.1.1.1');
    expect(report.hosts?.entities[0].ip).toEqual('1.1.1.1');
    expect(report.hosts?.entities[0].severity).toEqual(7);
  });

  test('should parse operating systems', () => {
    const report = ReportReport.fromElement({
      os: {
        count: 123,
      },
      results: {
        result: [
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: 5.5,
          },
        ],
      },
      host: [
        {
          ip: '1.1.1.1',
          detail: [
            {
              name: 'best_os_cpe',
              value: 'cpe:/foo/os',
            },
            {
              name: 'best_os_txt',
              value: 'Foo OS',
            },
          ],
        },
      ],
    });
    expect(report.operatingsystems).toBeDefined();
    expect(report.operatingsystems?.counts?.all).toEqual(123);
    expect(report.operatingsystems?.counts?.filtered).toEqual(1);
    expect(report.operatingsystems?.counts?.rows).toEqual(1);
    expect(report.operatingsystems?.counts?.length).toEqual(1);
    expect(report.operatingsystems?.entities.length).toEqual(1);
    expect(report.operatingsystems?.entities[0].id).toEqual('cpe:/foo/os');
    expect(report.operatingsystems?.entities[0].cpe).toEqual('cpe:/foo/os');
    expect(report.operatingsystems?.entities[0].name).toEqual('Foo OS');
    expect(report.operatingsystems?.entities[0].severity).toEqual(5.5);
  });

  test('should parse ports', () => {
    const report = ReportReport.fromElement({
      ports: {
        count: 123,
        port: [{__text: '123/tcp', host: '1.2.3.4', severity: 5.5}],
      },
    });
    expect(report.ports).toBeDefined();
    expect(report.ports?.counts?.all).toEqual(123);
    expect(report.ports?.counts?.filtered).toEqual(1);
    expect(report.ports?.counts?.rows).toEqual(1);
    expect(report.ports?.counts?.length).toEqual(1);
    expect(report.ports?.entities.length).toEqual(1);
    expect(report.ports?.entities[0].id).toEqual('123/tcp');
    expect(report.ports?.entities[0].severity).toEqual(5.5);
  });

  test('should parse cves', () => {
    const report = ReportReport.fromElement({
      results: {
        result: [
          {
            nvt: {
              _oid: '1.2.3',
              name: 'Foo',
              refs: {
                ref: [
                  {
                    _type: 'cve',
                    _id: 'CVE-123',
                  },
                ],
              },
            },
            host: {
              __text: '1.1.1.1',
            },
            severity: 4.5,
          },
        ],
      },
    });
    expect(report.cves).toBeDefined();
    expect(report.cves?.counts?.all).toEqual(1);
    expect(report.cves?.counts?.filtered).toEqual(1);
    expect(report.cves?.counts?.rows).toEqual(1);
    expect(report.cves?.counts?.length).toEqual(1);
    expect(report.cves?.entities.length).toEqual(1);
    expect(report.cves?.entities[0].id).toEqual('1.2.3');
    expect(report.cves?.entities[0].nvtName).toEqual('Foo');
    expect(report.cves?.entities[0].cves).toEqual(['CVE-123']);
    expect(report.cves?.entities[0].severity).toEqual(4.5);
    expect(report.cves?.entities[0].occurrences).toEqual(1);
  });

  test('should parse closed CVEs', () => {
    const report = ReportReport.fromElement({
      closed_cves: {
        count: 123,
      },
      host: [
        {
          ip: '1.1.1.1',
          detail: [
            {
              name: 'hostname',
              value: 'foo.bar',
            },
            {
              name: 'Closed CVE',
              value: 'CVE-2000-1234',
              source: {
                name: '201',
                description: 'This is a description',
              },
              extra: 10.0,
            },
          ],
        },
      ],
    });
    expect(report.closedCves).toBeDefined();
    expect(report.closedCves?.counts?.all).toEqual(123);
    expect(report.closedCves?.counts?.filtered).toEqual(1);
    expect(report.closedCves?.counts?.rows).toEqual(1);
    expect(report.closedCves?.counts?.length).toEqual(1);
    expect(report.closedCves?.entities.length).toEqual(1);
    expect(report.closedCves?.entities[0].id).toEqual(
      'CVE-2000-1234-1.1.1.1-201',
    );
    expect(report.closedCves?.entities[0].host.ip).toEqual('1.1.1.1');
    expect(report.closedCves?.entities[0].cveId).toEqual('CVE-2000-1234');
  });

  test('should parse errors', () => {
    const report = ReportReport.fromElement({
      errors: {
        count: 123,
        error: [
          {
            host: {
              __text: '1.1.1.1',
              asset: {_asset_id: '123'},
            },
            port: '123/tcp',
            description: 'This is an error.',
            nvt: {
              _oid: '314',
              name: 'NVT1',
            },
          },
        ],
      },
    });
    expect(report.errors).toBeDefined();
    expect(report.errors?.counts?.all).toEqual(123);
    expect(report.errors?.counts?.filtered).toEqual(1);
    expect(report.errors?.counts?.rows).toEqual(1);
    expect(report.errors?.counts?.length).toEqual(1);
    expect(report.errors?.entities.length).toEqual(1);
    expect(report.errors?.entities[0].id).toEqual('1.1.1.1:314');
    expect(report.errors?.entities[0].description).toEqual('This is an error.');
    expect(report.errors?.entities[0].host?.ip).toEqual('1.1.1.1');
    expect(report.errors?.entities[0].host?.id).toEqual('123');
    expect(report.errors?.entities[0].port).toEqual('123/tcp');
    expect(report.errors?.entities[0].nvt?.id).toEqual('314');
    expect(report.errors?.entities[0].nvt?.name).toEqual('NVT1');
  });
});
