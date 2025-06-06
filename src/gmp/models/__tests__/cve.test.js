/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Cve from 'gmp/models/cve';
import {isDate} from 'gmp/models/date';
import Info from 'gmp/models/info';
import {testModel} from 'gmp/models/testing';
import {parseDate} from 'gmp/parser';

testModel(Cve, 'cve');

describe('CVE model tests', () => {
  test('should be instance of Info', () => {
    const certBundAdv = Cve.fromElement({});

    expect(certBundAdv).toBeInstanceOf(Info);
  });

  test('should parse update time', () => {
    const elem = {
      update_time: '2018-10-10T23:00:00.000+0000',
    };
    const cve = Cve.fromElement(elem);

    expect(cve.update_time).toBeUndefined();
    expect(cve.updateTime).toEqual(parseDate('2018-10-10T23:00:00.000+0000'));
  });

  test('should parse severity', () => {
    const elem = {
      severity: '8.5',
    };
    const cve = Cve.fromElement(elem);

    expect(cve.severity).toEqual(8.5);
    expect(cve.cvss).toBeUndefined();
  });

  test('should parse NVTs', () => {
    const elem = {
      cve: {
        nvts: {
          nvt: [
            {
              _oid: '42.1337',
              name: 'foo',
            },
            {
              _oid: '1337.42',
              name: 'bar',
            },
          ],
        },
      },
    };
    const res = [
      {
        name: 'foo',
        id: '42.1337',
        oid: '42.1337',
      },
      {
        name: 'bar',
        id: '1337.42',
        oid: '1337.42',
      },
    ];
    const cve = Cve.fromElement(elem);

    expect(cve.nvts).toEqual(res);
  });

  test('should parse CERT-Bund Advs', () => {
    const elem = {
      cve: {
        cert: {
          cert_ref: [
            {
              _type: 'foo',
              name: 'bar',
              title: 'lorem',
            },
            {
              _type: 'ipsum',
              name: 'dolor',
              title: 'sit',
            },
          ],
        },
      },
    };
    const res = [
      {
        cert_type: 'foo',
        name: 'bar',
        title: 'lorem',
      },
      {
        cert_type: 'ipsum',
        name: 'dolor',
        title: 'sit',
      },
    ];
    const cve = Cve.fromElement(elem);

    expect(cve.certs).toEqual(res);
  });

  test('should return empty array if no certs are given', () => {
    const cve = Cve.fromElement({});

    expect(cve.certs).toEqual([]);
  });

  test('should parse CVSS metrics', () => {
    const elem = {
      cve: {
        severity: '10.0',
        cvss_vector: 'AV:N/AC:L/Au:N/C:C/I:C/A:C',
      },
    };
    const cve = Cve.fromElement(elem);

    expect(cve.cvssBaseVector).toEqual('AV:N/AC:L/Au:N/C:C/I:C/A:C');
    expect(cve.cvssAccessComplexity).toEqual('Low');
    expect(cve.cvssAccessVector).toEqual('Network');
    expect(cve.cvssAuthentication).toEqual('None');
    expect(cve.cvssAvailabilityImpact).toEqual('Complete');
    expect(cve.cvssConfidentialityImpact).toEqual('Complete');
    expect(cve.cvssIntegrityImpact).toEqual('Complete');
  });

  test('should parse vulnerable products', () => {
    const elem = {
      cve: {
        products: 'foo:bar/dolor ipsum:lorem',
      },
    };
    const cve = Cve.fromElement(elem);
    expect(cve.products).toEqual(['foo:bar/dolor', 'ipsum:lorem']);
  });

  test('should return empty array if no vulnerable products are given', () => {
    const cve = Cve.fromElement({});

    expect(cve.products).toEqual([]);
  });

  test('should parse published and modified date from raw data', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': '2018-10-10T11:41:23.022Z',
          'last-modified-datetime': '2018-10-10T11:41:23.022Z',
        },
      },
    };
    const cve = Cve.fromElement(elem);

    expect(isDate(cve.publishedTime)).toBe(true);
    expect(isDate(cve.lastModifiedTime)).toBe(true);
  });

  test('should parse references', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': '2018-10-10T11:41:23.022Z',
          'last-modified-datetime': '2018-10-10T11:41:23.022Z',
          references: {
            source: 'foo',
            _reference_type: 'bar',
            reference: {
              __text: 'lorem',
              _href: 'prot://url',
            },
          },
        },
      },
    };
    const cve = Cve.fromElement(elem);
    const res = [
      {
        name: 'lorem',
        href: 'prot://url',
        source: 'foo',
        reference_type: 'bar',
      },
    ];
    expect(cve.references).toEqual(res);
  });

  test('should parse vulnerable products from raw data', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': '2018-10-10T11:41:23.022Z',
          'last-modified-datetime': '2018-10-10T11:41:23.022Z',
          'vulnerable-software-list': {
            product: ['lorem', 'ipsum'],
          },
        },
      },
    };
    const cve = Cve.fromElement(elem);

    expect(cve.products).toEqual(['lorem', 'ipsum']);
  });

  test('should return empty array for references if no raw data is given', () => {
    const cve = Cve.fromElement({});

    expect(cve.references).toEqual([]);
  });

  test('should parse result cve', () => {
    const elem = {
      name: 'CVE-1234',
    };

    const cve = Cve.fromResultElement(elem);

    expect(cve.name).toBe('CVE-1234');
    expect(cve.id).toBe('CVE-1234');
  });

  test('should parse CVSS4 metrics', () => {
    const elem = {
      cve: {
        cvss_vector:
          'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:H/VI:L/VA:N/SC:L/SI:H/SA:N',
      },
    };
    const cve = Cve.fromElement(elem);

    expect(cve.cvssAttackVector).toEqual('Network');
    expect(cve.cvssAttackComplexity).toEqual('Low');
    expect(cve.cvssAttackRequirements).toEqual('Present');
    expect(cve.cvssPrivilegesRequired).toEqual('Low');
    expect(cve.cvssUserInteraction).toEqual('Active');
    expect(cve.cvssConfidentialityVS).toEqual('High');
    expect(cve.cvssIntegrityVS).toEqual('Low');
    expect(cve.cvssAvailabilityVS).toEqual('None');
    expect(cve.cvssConfidentialitySS).toEqual('Low');
    expect(cve.cvssIntegritySS).toEqual('High');
    expect(cve.cvssAvailabilitySS).toEqual('None');
  });
});
