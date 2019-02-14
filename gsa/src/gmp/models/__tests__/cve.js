/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* eslint-disable max-len */

import Cve from 'gmp/models/cve';
import {isDate} from 'gmp/models/date';
import Info from 'gmp/models/info';

import {testModel} from 'gmp/models/testing';

import {parseDate} from 'gmp/parser';

testModel(Cve, 'cve');

describe('CVE model tests', () => {
  test('should be instance of Info', () => {
    const certBundAdv = new Cve({});

    expect(certBundAdv).toBeInstanceOf(Info);
  });

  test('should parse update time', () => {
    const elem = {
      update_time: '2018-10-10T23:00:00.000+0000',
    };
    const cve = new Cve(elem);

    expect(cve.update_time).toBeUndefined();
    expect(cve.updateTime).toEqual(parseDate('2018-10-10T23:00:00.000+0000'));
  });

  test('should parse severity', () => {
    const elem = {
      cvss: '8.5',
    };
    const cve = new Cve(elem);

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
    const cve = new Cve(elem);

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
    const cve = new Cve(elem);

    expect(cve.certs).toEqual(res);
  });

  test('should return empty array if no certs are given', () => {
    const cve = new Cve({});

    expect(cve.certs).toEqual([]);
  });

  test('should parse CVSS metrics', () => {
    const elem = {
      cve: {
        cvss: '10.0',
        vector: 'NETWORK',
        complexity: 'LOW',
        authentication: 'NONE',
        confidentiality_impact: 'COMPLETE',
        integrity_impact: 'COMPLETE',
        availability_impact: 'COMPLETE',
      },
    };
    const cve = new Cve(elem);

    expect(cve.cvssBaseVector).toEqual('AV:N/AC:L/Au:N/C:C/I:C/A:C');
    expect(cve.cvssAccessComplexity).toEqual('LOW');
    expect(cve.cvssAccessVector).toEqual('NETWORK');
    expect(cve.cvssAuthentication).toEqual('NONE');
    expect(cve.cvssAvailabilityImpact).toEqual('COMPLETE');
    expect(cve.cvssConfidentialityImpact).toEqual('COMPLETE');
    expect(cve.cvssIntegrityImpact).toEqual('COMPLETE');
  });

  test('should parse vulnerable products', () => {
    const elem = {
      cve: {
        products: 'foo:bar/dolor ipsum:lorem',
      },
    };
    const cve = new Cve(elem);

    expect(cve.products).toEqual(['foo:bar/dolor', 'ipsum:lorem']);
  });

  test('should return empty array if no vulnerable products are given', () => {
    const cve = new Cve({});

    expect(cve.products).toEqual([]);
  });

  test('should parse cwe, published, and modified date from raw data', () => {
    const elem = {
      cwe: 'foo',
      raw_data: {
        entry: {
          cwe: {
            _id: '123abc',
          },
          'published-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'last-modified-datetime': {__text: '2018-10-10T11:41:23.022Z'},
        },
      },
    };
    const cve = new Cve(elem);

    expect(cve.cwe_id).toEqual('123abc');
    expect(isDate(cve.publishedTime)).toBe(true);
    expect(isDate(cve.lastModifiedTime)).toBe(true);
  });

  test('should parse references', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'last-modified-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          references: {
            source: {
              __text: 'foo',
            },
            _reference_type: 'bar',
            reference: {
              __text: 'lorem',
              _href: 'prot://url',
            },
          },
        },
      },
    };
    const cve = new Cve(elem);
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

  test('should parse cvss source', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'last-modified-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          cvss: {
            base_metrics: {
              source: {
                __text: 'prot://url',
              },
            },
          },
        },
      },
    };
    const cve = new Cve(elem);

    expect(cve.source).toEqual('prot://url');
  });

  test('should parse summary', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'last-modified-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          summary: {
            __text: 'lorem ipsum',
          },
        },
      },
    };
    const cve = new Cve(elem);

    expect(cve.description).toEqual('lorem ipsum');
  });

  test('should parse vulnerable products from raw data', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'last-modified-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'vulnerable-software-list': {
            product: [{__text: 'lorem'}, {__text: 'ipsum'}],
          },
        },
      },
    };
    const cve = new Cve(elem);

    expect(cve.products).toEqual(['lorem', 'ipsum']);
  });

  test('should delete raw data', () => {
    const elem = {
      raw_data: {
        entry: {
          'published-datetime': {__text: '2018-10-10T11:41:23.022Z'},
          'last-modified-datetime': {__text: '2018-10-10T11:41:23.022Z'},
        },
      },
    };
    const cve = new Cve(elem);

    expect(cve.raw_data).toBeUndefined();
  });

  test('should return empty array for references if no raw data is given', () => {
    const cve = new Cve({});

    expect(cve.references).toEqual([]);
  });
});
