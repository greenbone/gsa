/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportTlsCertificatesCommand from 'gmp/commands/report-tls-certificates';
import {createResponse, createHttp} from 'gmp/commands/testing';

describe('ReportTlsCertificatesCommand tests', () => {
  test('should return TLS certificates', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {
            tls_certificate: [
              {
                name: 'fingerprint-1',
                serial: '123456',
                subject_dn: 'CN=example.com',
                issuer_dn: 'CN=Issuer',
                activation_time: '2024-01-01T00:00:00Z',
                expiration_time: '2025-12-31T23:59:59Z',
                md5_fingerprint: 'md5-1',
                sha256_fingerprint: 'sha256-1',
                valid: 1,
                certificate: {
                  __text: 'cert-data-1',
                  _format: 'PEM',
                },
                host: {
                  ip: '192.168.1.1',
                  hostname: 'host1.example.com',
                },
                ports: {
                  port: [443, 8443],
                },
              },
              {
                name: 'fingerprint-2',
                serial: '654321',
                subject_dn: 'CN=other.example.com',
                issuer_dn: 'CN=Other Issuer',
                activation_time: '2024-06-01T00:00:00Z',
                expiration_time: '2026-06-01T00:00:00Z',
                md5_fingerprint: 'md5-2',
                sha256_fingerprint: 'sha256-2',
                valid: 0,
                host: {
                  ip: '10.0.0.1',
                  hostname: 'host2.example.com',
                },
                ports: {
                  port: 80,
                },
              },
            ],
          },
          ssl_certs: {
            count: 5,
          },
          filters: {
            term: 'first=1 rows=100 sort=dn',
            filter: {
              _id: '',
            },
            keywords: {
              keyword: [
                {column: 'first', relation: '=', value: '1'},
                {column: 'rows', relation: '=', value: '100'},
                {column: 'sort', relation: '=', value: 'dn'},
              ],
            },
          },
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_tls_certificates',
        details: 1,
        report_id: 'r1',
      },
    });

    const {data} = resp;

    // First cert has 2 ports → 2 entries, second cert has 1 port → 1 entry
    expect(data).toHaveLength(3);

    // First entry from cert 1, port 443
    expect(data[0].fingerprint).toEqual('fingerprint-1');
    expect(data[0].serial).toEqual('123456');
    expect(data[0].subjectDn).toEqual('CN=example.com');
    expect(data[0].issuerDn).toEqual('CN=Issuer');
    expect(data[0].md5Fingerprint).toEqual('md5-1');
    expect(data[0].sha256Fingerprint).toEqual('sha256-1');
    expect(data[0].valid).toEqual(true);
    expect(data[0].data).toEqual('cert-data-1');
    expect(data[0].ip).toEqual('192.168.1.1');
    expect(data[0].hostname).toEqual('host1.example.com');
    expect(data[0].port).toEqual('443');
    expect(data[0].ports).toEqual(['443']);

    // Second entry from cert 1, port 8443
    expect(data[1].fingerprint).toEqual('fingerprint-1');
    expect(data[1].port).toEqual('8443');
    expect(data[1].ports).toEqual(['8443']);
    expect(data[1].ip).toEqual('192.168.1.1');

    // Third entry from cert 2, port 80
    expect(data[2].fingerprint).toEqual('fingerprint-2');
    expect(data[2].serial).toEqual('654321');
    expect(data[2].subjectDn).toEqual('CN=other.example.com');
    expect(data[2].valid).toEqual(false);
    expect(data[2].ip).toEqual('10.0.0.1');
    expect(data[2].hostname).toEqual('host2.example.com');
    expect(data[2].port).toEqual('80');
    expect(data[2].ports).toEqual(['80']);

    // Check counts
    const {counts} = resp.meta;
    expect(counts.all).toEqual(5);
    expect(counts.filtered).toEqual(3);
    expect(counts.first).toEqual(1);
    expect(counts.length).toEqual(3);
    expect(counts.rows).toEqual(3);
  });

  test('should handle single TLS certificate element', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {
            tls_certificate: {
              name: 'single-fingerprint',
              serial: '111',
              subject_dn: 'CN=single.example.com',
              host: {
                ip: '10.0.0.2',
                hostname: 'single.example.com',
              },
              ports: {
                port: 443,
              },
            },
          },
          ssl_certs: {
            count: 1,
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
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r2'});

    const {data} = resp;
    expect(data).toHaveLength(1);
    expect(data[0].fingerprint).toEqual('single-fingerprint');
    expect(data[0].serial).toEqual('111');
    expect(data[0].ip).toEqual('10.0.0.2');
    expect(data[0].port).toEqual('443');
  });

  test('should handle empty TLS certificates', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {},
          ssl_certs: {
            count: 0,
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
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r3'});

    const {data} = resp;
    expect(data).toHaveLength(0);

    const {counts} = resp.meta;
    expect(counts.all).toEqual(0);
    expect(counts.filtered).toEqual(0);
  });

  test('should throw error for invalid response', async () => {
    const response = createResponse({});

    const fakeHttp = createHttp(response);
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);

    await expect(cmd.get({report_id: 'r4'})).rejects.toThrow(
      'Invalid response: get_report_tls_certificates not found in response',
    );
  });

  test('should use ssl_certs count as all count', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {
            tls_certificate: [
              {
                name: 'fp-1',
                host: {ip: '1.1.1.1'},
                ports: {port: 443},
              },
            ],
          },
          ssl_certs: {
            count: 10,
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
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r5'});

    const {counts} = resp.meta;
    expect(counts.all).toEqual(10);
    expect(counts.filtered).toEqual(1);
  });

  test('should fallback to filtered count when ssl_certs is missing', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {
            tls_certificate: [
              {
                name: 'fp-1',
                host: {ip: '1.1.1.1'},
                ports: {port: 443},
              },
              {
                name: 'fp-2',
                host: {ip: '2.2.2.2'},
                ports: {port: 8443},
              },
            ],
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
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r6'});

    const {counts} = resp.meta;
    // Without ssl_certs, all should equal filtered count
    expect(counts.all).toEqual(2);
    expect(counts.filtered).toEqual(2);
  });

  test('should pass filter parameter', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {},
          ssl_certs: {count: 0},
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
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    await cmd.get({report_id: 'r7', filter: 'rows=50 first=1'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_tls_certificates',
        details: 1,
        report_id: 'r7',
        filter: 'rows=50 first=1',
      },
    });
  });

  test('should handle activation_time "undefined" and "unlimited"', async () => {
    const response = createResponse({
      get_report_tls_certificates: {
        get_report_tls_certificates_response: {
          tls_certificates: {
            tls_certificate: [
              {
                name: 'fp-undef',
                activation_time: 'undefined',
                expiration_time: 'unlimited',
                host: {ip: '1.1.1.1'},
                ports: {port: 443},
              },
            ],
          },
          ssl_certs: {count: 1},
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
    const cmd = new ReportTlsCertificatesCommand(fakeHttp);
    const resp = await cmd.get({report_id: 'r8'});

    const {data} = resp;
    expect(data[0].activationTime).toBeUndefined();
    expect(data[0].expirationTime).toBeUndefined();
  });
});
