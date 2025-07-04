/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {testModel} from 'gmp/models/testing';
import TlsCertificate, {TIME_STATUS} from 'gmp/models/tlscertificate';
import {parseDate} from 'gmp/parser';

describe('TlsCertificate Model tests', () => {
  testModel(TlsCertificate, 'tlscertificate', {testName: false});

  test('should use defaults', () => {
    const tlsCertificate = new TlsCertificate();
    expect(tlsCertificate.activationTime).toBeUndefined();
    expect(tlsCertificate.certificate).toBeUndefined();
    expect(tlsCertificate.expirationTime).toBeUndefined();
    expect(tlsCertificate.issuerDn).toBeUndefined();
    expect(tlsCertificate.lastSeen).toBeUndefined();
    expect(tlsCertificate.md5Fingerprint).toBeUndefined();
    expect(tlsCertificate.serial).toBeUndefined();
    expect(tlsCertificate.sha256Fingerprint).toBeUndefined();
    expect(tlsCertificate.sourceHosts).toEqual([]);
    expect(tlsCertificate.sourcePorts).toEqual([]);
    expect(tlsCertificate.sourceReports).toEqual([]);
    expect(tlsCertificate.subjectDn).toBeUndefined();
    expect(tlsCertificate.timeStatus).toBeUndefined();
    expect(tlsCertificate.trust).toBeUndefined();
    expect(tlsCertificate.valid).toBeUndefined();
  });

  test('should parse empty element', () => {
    const tlsCertificate = TlsCertificate.fromElement();
    expect(tlsCertificate.activationTime).toBeUndefined();
    expect(tlsCertificate.certificate).toBeUndefined();
    expect(tlsCertificate.expirationTime).toBeUndefined();
    expect(tlsCertificate.issuerDn).toBeUndefined();
    expect(tlsCertificate.lastSeen).toBeUndefined();
    expect(tlsCertificate.md5Fingerprint).toBeUndefined();
    expect(tlsCertificate.serial).toBeUndefined();
    expect(tlsCertificate.sha256Fingerprint).toBeUndefined();
    expect(tlsCertificate.sourceHosts).toEqual([]);
    expect(tlsCertificate.sourcePorts).toEqual([]);
    expect(tlsCertificate.sourceReports).toEqual([]);
    expect(tlsCertificate.subjectDn).toBeUndefined();
    expect(tlsCertificate.timeStatus).toBeUndefined();
    expect(tlsCertificate.trust).toBeUndefined();
    expect(tlsCertificate.valid).toBeUndefined();
  });

  test('should parse certificate', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      certificate: {
        __text: 'CERT123',
      },
    });
    expect(tlsCertificate1.certificate).toEqual('CERT123');
  });

  test('should parse issuer dn', () => {
    const tlsCertificate = TlsCertificate.fromElement({
      issuer_dn: 'CN=issuer',
    });
    expect(tlsCertificate.issuerDn).toEqual('CN=issuer');
  });

  test('should parse subject dn', () => {
    const tlsCertificate = TlsCertificate.fromElement({
      subject_dn: 'CN=subject',
    });
    expect(tlsCertificate.subjectDn).toEqual('CN=subject');
  });

  test('should parse activation_time', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      activation_time: '2019-10-10T11:09:23.022Z',
    });
    const tlsCertificate2 = TlsCertificate.fromElement({
      activation_time: 'undefined',
    });
    const tlsCertificate3 = TlsCertificate.fromElement({
      activation_time: 'unlimited',
    });

    expect(tlsCertificate1.activationTime).toEqual(
      parseDate('2019-10-10T11:09:23.022Z'),
    );
    expect(tlsCertificate2.activationTime).toBeUndefined();
    expect(tlsCertificate3.activationTime).toBeUndefined();
  });

  test('should parse expiration time', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      expiration_time: '2019-10-10T11:09:23.022Z',
    });
    const tlsCertificate2 = TlsCertificate.fromElement({
      expiration_time: 'undefined',
    });
    const tlsCertificate3 = TlsCertificate.fromElement({
      expiration_time: 'unlimited',
    });

    expect(tlsCertificate1.expirationTime).toEqual(
      parseDate('2019-10-10T11:09:23.022Z'),
    );
    expect(tlsCertificate2.expirationTime).toBeUndefined();
    expect(tlsCertificate3.expirationTime).toBeUndefined();
  });

  test('should parse last seen', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      last_seen: '2019-10-10T11:09:23.022Z',
    });
    const tlsCertificate2 = TlsCertificate.fromElement({
      last_seen: 'undefined',
    });
    const tlsCertificate3 = TlsCertificate.fromElement({
      last_seen: 'unlimited',
    });

    expect(tlsCertificate1.lastSeen).toEqual(
      parseDate('2019-10-10T11:09:23.022Z'),
    );
    expect(tlsCertificate2.lastSeen).toBeUndefined();
    expect(tlsCertificate3.lastSeen).toBeUndefined();
  });

  test('should parse time status', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      time_status: TIME_STATUS.inactive,
    });
    const tlsCertificate2 = TlsCertificate.fromElement({
      time_status: TIME_STATUS.valid,
    });
    const tlsCertificate3 = TlsCertificate.fromElement({
      time_status: TIME_STATUS.expired,
    });
    const tlsCertificate4 = TlsCertificate.fromElement({
      time_status: TIME_STATUS.unknown,
    });

    expect(tlsCertificate1.timeStatus).toEqual(TIME_STATUS.inactive);
    expect(tlsCertificate2.timeStatus).toEqual(TIME_STATUS.valid);
    expect(tlsCertificate3.timeStatus).toEqual(TIME_STATUS.expired);
    expect(tlsCertificate4.timeStatus).toEqual(TIME_STATUS.unknown);
  });

  test('should parse valid', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      valid: 1,
    });
    const tlsCertificate2 = TlsCertificate.fromElement({
      valid: 0,
    });

    expect(tlsCertificate1.valid).toEqual(true);
    expect(tlsCertificate2.valid).toEqual(false);
  });

  test('should parse trust', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      trust: 1,
    });
    const tlsCertificate2 = TlsCertificate.fromElement({
      trust: 0,
    });

    expect(tlsCertificate1.trust).toEqual(true);
    expect(tlsCertificate2.trust).toEqual(false);
  });

  test('should parse sha256 fingerprint', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      sha256_fingerprint: 'SHA256',
    });
    expect(tlsCertificate1.sha256Fingerprint).toEqual('SHA256');
  });

  test('should parse md5 fingerprint', () => {
    const tlsCertificate1 = TlsCertificate.fromElement({
      md5_fingerprint: 'MD5',
    });
    expect(tlsCertificate1.md5Fingerprint).toEqual('MD5');
  });

  test('should parse source reports', () => {
    const tlsCertificate = TlsCertificate.fromElement({
      sources: {
        source: [
          {
            origin: {
              origin_id: 'ID123',
              origin_type: 'Report',
              report: {
                date: '2019-10-10T11:09:23.022Z',
              },
            },
          },
          {
            origin: {
              origin_id: 'ID456',
              origin_type: 'Report',
              report: {
                date: '2019-10-10T11:09:23.022Z',
              },
            },
          },
          {
            origin: {
              origin_id: 'ID789',
              origin_type: 'Report',
            },
          },
        ],
      },
    });
    expect(tlsCertificate.sourceReports).toEqual([
      {
        id: 'ID123',
        timestamp: parseDate('2019-10-10T11:09:23.022Z'),
      },
      {
        id: 'ID456',
        timestamp: parseDate('2019-10-10T11:09:23.022Z'),
      },
      {
        id: 'ID789',
      },
    ]);

    const tlsCertificate2 = TlsCertificate.fromElement({
      sources: {
        source: [
          {
            origin: {
              origin_id: 'ID123',
              origin_type: 'Report',
              report: {
                date: '2019-10-10T11:09:23.022Z',
              },
            },
          },
          {
            origin: {
              origin_id: 'ID123',
              origin_type: 'Report',
              report: {
                date: '2019-10-10T11:09:23.022Z',
              },
            },
          },
        ],
      },
    });
    expect(tlsCertificate2.sourceReports).toEqual([
      {
        id: 'ID123',
        timestamp: parseDate('2019-10-10T11:09:23.022Z'),
      },
    ]);
  });

  test('should parse source hosts', () => {
    const tlsCertificate = TlsCertificate.fromElement({
      sources: {
        source: [
          {
            location: {
              host: {
                asset: {
                  _id: 'ID123',
                },
                ip: '123.456.789.0',
              },
            },
          },
          {
            location: {
              host: {
                asset: {
                  _id: 'ID456',
                },
                ip: '123.456.789.42',
              },
            },
          },
        ],
      },
    });
    expect(tlsCertificate.sourceHosts).toEqual([
      {
        id: 'ID123',
        ip: '123.456.789.0',
      },
      {
        id: 'ID456',
        ip: '123.456.789.42',
      },
    ]);

    const tlsCertificate2 = TlsCertificate.fromElement({
      certificate: {
        __text: 'CERT123',
      },
      sources: {
        source: [
          {
            location: {
              host: {
                asset: {
                  _id: 'ID123',
                },
                ip: '123.456.789.0',
              },
            },
          },
          {
            location: {
              host: {
                asset: {
                  _id: 'ID123',
                },
                ip: '123.456.789.0',
              },
            },
          },
        ],
      },
    });
    expect(tlsCertificate2.sourceHosts).toEqual([
      {
        id: 'ID123',
        ip: '123.456.789.0',
      },
    ]);
  });

  test('should parse source ports', () => {
    const tlsCertificate = TlsCertificate.fromElement({
      sources: {
        source: [
          {
            location: {
              port: '1234',
            },
          },
          {
            location: {
              port: '5678',
            },
          },
        ],
      },
    });
    expect(tlsCertificate.sourcePorts).toEqual(['1234', '5678']);

    const tlsCertificate2 = TlsCertificate.fromElement({
      sources: {
        source: [
          {
            location: {
              port: '1234',
            },
          },
          {
            location: {
              port: 1234,
            },
          },
        ],
      },
    });
    expect(tlsCertificate2.sourcePorts).toEqual(['1234']);
  });

  test('should parse serial', () => {
    const tlsCertificate = TlsCertificate.fromElement({
      serial: '1234567890',
    });
    expect(tlsCertificate.serial).toEqual('1234567890');
  });
});
