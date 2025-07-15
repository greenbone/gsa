/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {COMPLIANCE} from 'gmp/models/compliance';
import Filter from 'gmp/models/filter';
import AuditReportReport from 'gmp/models/report/auditreport';
import {emptyCollectionList} from 'gmp/models/report/parser';
import {parseDate} from 'gmp/parser';

describe('AuditReportReport tests', () => {
  test('should use defaults', () => {
    const report = new AuditReportReport();
    expect(report.compliance).toBeUndefined();
    expect(report.complianceCounts).toBeUndefined();
    expect(report.delta_report).toBeUndefined();
    expect(report.errors).toBeUndefined();
    expect(report.filter).toBeUndefined();
    expect(report.hosts).toBeUndefined();
    expect(report.operatingSystems).toBeUndefined();
    expect(report.reportType).toBeUndefined();
    expect(report.results).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_run_status).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.task).toBeUndefined();
    expect(report.timezone).toBeUndefined();
    expect(report.timezone_abbrev).toBeUndefined();
    expect(report.tlsCertificates).toBeUndefined();
  });

  test('should parse empty element', () => {
    const report = AuditReportReport.fromElement();
    const filter = new Filter();
    const emptyCollection = emptyCollectionList(filter);
    expect(report.compliance).toBeUndefined();
    expect(report.complianceCounts).toBeUndefined();
    expect(report.delta_report).toBeUndefined();
    expect(report.errors).toEqual(emptyCollection);
    expect(report.filter).toBeDefined();
    expect(report.hosts).toBeDefined();
    expect(report.operatingSystems).toBeDefined();
    expect(report.reportType).toBeUndefined();
    expect(report.results).toBeUndefined();
    expect(report.scan_end).toBeUndefined();
    expect(report.scan_run_status).toBeUndefined();
    expect(report.scan_start).toBeUndefined();
    expect(report.task).toBeDefined();
    expect(report.timezone).toBeUndefined();
    expect(report.timezone_abbrev).toBeUndefined();
    expect(report.tlsCertificates).toBeDefined();
  });

  test('should parse filter', () => {
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
      _type: 'delta',
    });
    expect(report.reportType).toEqual('delta');
  });

  test('should parse scan start', () => {
    const report = AuditReportReport.fromElement({
      scan_start: '2024-01-01T00:00:00Z',
    });
    expect(report.scan_start).toEqual(parseDate('2024-01-01T00:00:00Z'));
  });

  test('should parse scan end', () => {
    const report = AuditReportReport.fromElement({
      scan_end: '2024-01-02T00:00:00Z',
    });
    expect(report.scan_end).toEqual(parseDate('2024-01-02T00:00:00Z'));
  });

  test('should parse task', () => {
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
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

  test('should parse results', () => {
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
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
    const report = AuditReportReport.fromElement({
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
    expect(report.operatingSystems).toBeDefined();
    expect(report.operatingSystems?.counts?.all).toEqual(123);
    expect(report.operatingSystems?.counts?.filtered).toEqual(1);
    expect(report.operatingSystems?.counts?.rows).toEqual(1);
    expect(report.operatingSystems?.counts?.length).toEqual(1);
    expect(report.operatingSystems?.entities.length).toEqual(1);
    expect(report.operatingSystems?.entities[0].id).toEqual('cpe:/foo/os');
    expect(report.operatingSystems?.entities[0].cpe).toEqual('cpe:/foo/os');
    expect(report.operatingSystems?.entities[0].name).toEqual('Foo OS');
    expect(report.operatingSystems?.entities[0].severity).toEqual(5.5);
  });

  test('should parse errors', () => {
    const report = AuditReportReport.fromElement({
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

  test('should parse scan run status', () => {
    const report = AuditReportReport.fromElement({
      scan_run_status: 'completed',
    });
    expect(report.scan_run_status).toEqual('completed');
  });

  test('should parse compliance count', () => {
    const report = AuditReportReport.fromElement({
      compliance_count: {
        full: 20,
        filtered: 5,
        yes: {
          full: 15,
          filtered: 3,
        },
        no: {
          full: 5,
          filtered: 2,
        },
        incomplete: {
          full: 2,
          filtered: 1,
        },
        undefined: {
          full: 3,
          filtered: 1,
        },
      },
    });
    expect(report.complianceCounts).toBeDefined();
    expect(report.complianceCounts?.full).toEqual(20);
    expect(report.complianceCounts?.filtered).toEqual(5);
    expect(report.complianceCounts?.yes?.full).toEqual(15);
    expect(report.complianceCounts?.yes?.filtered).toEqual(3);
    expect(report.complianceCounts?.no?.full).toEqual(5);
    expect(report.complianceCounts?.no?.filtered).toEqual(2);
    expect(report.complianceCounts?.incomplete?.full).toEqual(2);
    expect(report.complianceCounts?.incomplete?.filtered).toEqual(1);
    expect(report.complianceCounts?.undefined?.full).toEqual(3);
    expect(report.complianceCounts?.undefined?.filtered).toEqual(1);
  });

  test('should parse compliance', () => {
    const report = AuditReportReport.fromElement({
      compliance: {
        full: COMPLIANCE.INCOMPLETE,
        filtered: COMPLIANCE.YES,
      },
    });
    expect(report.compliance).toBeDefined();
    expect(report.compliance?.full).toEqual(COMPLIANCE.INCOMPLETE);
    expect(report.compliance?.filtered).toEqual(COMPLIANCE.YES);
  });

  test('should parse timezone', () => {
    const report = AuditReportReport.fromElement({
      timezone: 'Europe/Berlin',
    });
    expect(report.timezone).toEqual('Europe/Berlin');
  });

  test('should parse timezone abbreviation', () => {
    const report = AuditReportReport.fromElement({
      timezone_abbrev: 'CET',
    });
    expect(report.timezone_abbrev).toEqual('CET');
  });
});
