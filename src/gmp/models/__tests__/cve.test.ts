/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Cve from 'gmp/models/cve';
import {isDate} from 'gmp/models/date';
import {testModel} from 'gmp/models/testing';
import {parseDate} from 'gmp/parser';

testModel(Cve, 'cve');

describe('CVE model tests', () => {
  test('should use defaults', () => {
    const cve = new Cve();
    expect(cve.certs).toEqual([]);
    expect(cve.cvssAccessComplexity).toBeUndefined();
    expect(cve.cvssAccessVector).toBeUndefined();
    expect(cve.cvssAttackComplexity).toBeUndefined();
    expect(cve.cvssAttackRequirements).toBeUndefined();
    expect(cve.cvssAttackVector).toBeUndefined();
    expect(cve.cvssAuthentication).toBeUndefined();
    expect(cve.cvssAvailabilityImpact).toBeUndefined();
    expect(cve.cvssAvailabilitySS).toBeUndefined();
    expect(cve.cvssAvailabilityVS).toBeUndefined();
    expect(cve.cvssBaseVector).toBeUndefined();
    expect(cve.cvssConfidentialityImpact).toBeUndefined();
    expect(cve.cvssConfidentialitySS).toBeUndefined();
    expect(cve.cvssConfidentialityVS).toBeUndefined();
    expect(cve.cvssIntegrityImpact).toBeUndefined();
    expect(cve.cvssIntegritySS).toBeUndefined();
    expect(cve.cvssIntegrityVS).toBeUndefined();
    expect(cve.cvssPrivilegesRequired).toBeUndefined();
    expect(cve.cvssPrivilegesRequired).toBeUndefined();
    expect(cve.cvssScope).toBeUndefined();
    expect(cve.cvssUserInteraction).toBeUndefined();
    expect(cve.description).toBeUndefined();
    expect(cve.epss).toBeUndefined();
    expect(cve.id).toBeUndefined();
    expect(cve.lastModifiedTime).toBeUndefined();
    expect(cve.nvts).toEqual([]);
    expect(cve.products).toEqual([]);
    expect(cve.publishedTime).toBeUndefined();
    expect(cve.references).toEqual([]);
    expect(cve.severity).toBeUndefined();
    expect(cve.updateTime).toBeUndefined();
  });

  test('should parse empty element', () => {
    const cve = Cve.fromElement();
    expect(cve.certs).toEqual([]);
    expect(cve.cvssAccessComplexity).toBeUndefined();
    expect(cve.cvssAccessVector).toBeUndefined();
    expect(cve.cvssAttackComplexity).toBeUndefined();
    expect(cve.cvssAttackRequirements).toBeUndefined();
    expect(cve.cvssAttackVector).toBeUndefined();
    expect(cve.cvssAuthentication).toBeUndefined();
    expect(cve.cvssAvailabilityImpact).toBeUndefined();
    expect(cve.cvssAvailabilitySS).toBeUndefined();
    expect(cve.cvssAvailabilityVS).toBeUndefined();
    expect(cve.cvssBaseVector).toBeUndefined();
    expect(cve.cvssConfidentialityImpact).toBeUndefined();
    expect(cve.cvssConfidentialitySS).toBeUndefined();
    expect(cve.cvssConfidentialityVS).toBeUndefined();
    expect(cve.cvssIntegrityImpact).toBeUndefined();
    expect(cve.cvssIntegritySS).toBeUndefined();
    expect(cve.cvssIntegrityVS).toBeUndefined();
    expect(cve.cvssPrivilegesRequired).toBeUndefined();
    expect(cve.cvssPrivilegesRequired).toBeUndefined();
    expect(cve.cvssScope).toBeUndefined();
    expect(cve.cvssUserInteraction).toBeUndefined();
    expect(cve.description).toBeUndefined();
    expect(cve.epss).toBeUndefined();
    expect(cve.id).toBeUndefined();
    expect(cve.lastModifiedTime).toBeUndefined();
    expect(cve.nvts).toEqual([]);
    expect(cve.products).toEqual([]);
    expect(cve.publishedTime).toBeUndefined();
    expect(cve.references).toEqual([]);
    expect(cve.severity).toBeUndefined();
    expect(cve.updateTime).toBeUndefined();
  });

  test('should parse update time', () => {
    const elem = {
      update_time: '2018-10-10T23:00:00.000+0000',
    };
    const cve = Cve.fromElement(elem);
    expect(cve.updateTime).toEqual(parseDate('2018-10-10T23:00:00.000+0000'));
  });

  test('should parse severity', () => {
    const elem = {cve: {severity: 8.5}};
    const cve = Cve.fromElement(elem);

    expect(cve.severity).toEqual(8.5);
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

  test('should parse CVSS metrics', () => {
    const elem = {
      cve: {
        severity: 10.0,
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

  test('should parse products', () => {
    const elem = {
      cve: {
        products: 'foo:bar/dolor ipsum:lorem',
      },
    };
    const cve = Cve.fromElement(elem);
    expect(cve.products).toEqual(['foo:bar/dolor', 'ipsum:lorem']);

    const cve2 = Cve.fromElement({cve: {products: ''}});
    expect(cve2.products).toEqual([]);

    const cve3 = Cve.fromElement({
      cve: {
        configuration_nodes: {
          node: [
            {
              match_string: {
                vulnerable: 1,
                matched_cpes: {
                  cpe: [{_id: 'cpe:/a:foo:bar'}, {_id: 'cpe:/a:foo:baz'}],
                },
              },
            },
          ],
        },
      },
    });
    expect(cve3.products).toEqual(['cpe:/a:foo:bar', 'cpe:/a:foo:baz']);

    const cve4 = Cve.fromElement({
      cve: {
        products: 'foo:bar/dolor ipsum:lorem',
        configuration_nodes: {
          node: [
            {
              match_string: {
                vulnerable: 1,
                matched_cpes: {
                  cpe: [{_id: 'cpe:/a:foo:bar'}, {_id: 'cpe:/a:foo:baz'}],
                },
              },
            },
          ],
        },
      },
    });
    expect(cve4.products).toEqual(['foo:bar/dolor', 'ipsum:lorem']);

    const cve5 = Cve.fromElement({
      cve: {
        raw_data: {
          entry: {
            'published-datetime': '2018-10-10T11:41:23.022Z',
            'last-modified-datetime': '2018-10-10T11:41:23.022Z',
            'vulnerable-software-list': {
              product: ['lorem', 'ipsum'],
            },
          },
        },
      },
    });
    expect(cve5.products).toEqual(['lorem', 'ipsum']);
  });

  test('should parse published and modified date', () => {
    const elem = {
      cve: {
        raw_data: {
          entry: {
            'published-datetime': '2018-10-10T11:41:23.022Z',
            'last-modified-datetime': '2018-10-10T11:41:23.022Z',
          },
        },
      },
    };
    const cve = Cve.fromElement(elem);

    expect(isDate(cve.publishedTime)).toBe(true);
    expect(isDate(cve.lastModifiedTime)).toBe(true);
  });

  test('should parse references', () => {
    const cve = Cve.fromElement({
      cve: {
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
      },
    });
    expect(cve.references).toEqual([
      {
        name: 'lorem',
        href: 'prot://url',
        source: 'foo',
        reference_type: 'bar',
      },
    ]);

    const cve2 = Cve.fromElement({
      cve: {
        references: {
          reference: [
            {
              url: 'https://example.com',
              tags: {
                tag: ['tag1', 'tag2'],
              },
            },
            {
              url: 'http://example.org',
              tags: {
                tag: 'tag3',
              },
            },
          ],
        },
      },
    });
    expect(cve2.references).toEqual([
      {
        name: 'https://example.com',
        href: 'https://example.com',
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'http://example.org',
        href: 'http://example.org',
        tags: ['tag3'],
      },
    ]);
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
