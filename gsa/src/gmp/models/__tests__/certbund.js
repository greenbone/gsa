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

import CertBundAdv from 'gmp/models/certbund';
import Info from 'gmp/models/info';
import {testModel} from 'gmp/models/testing';

import {parseDate} from 'gmp/parser';

testModel(CertBundAdv, 'certbund');

describe('CertBundAdv model tests', () => {
  test('should be instance of Info', () => {
    const certBundAdv = new CertBundAdv({});

    expect(certBundAdv).toBeInstanceOf(Info);
  });

  test('should parse severity', () => {
    const elem = {
      max_cvss: '8.5',
    };
    const certBundAdv = new CertBundAdv(elem);

    expect(certBundAdv.severity).toEqual(8.5);
    expect(certBundAdv.max_cvss).toBeUndefined();
  });

  test('should return empty categories array if no advisory is given', () => {
    const certBundAdv = new CertBundAdv({});
    expect(certBundAdv.categories).toEqual([]);
  });

  test('should return array of categories', () => {
    const elem = {
      raw_data: {
        Advisory: {
          CategoryTree: ['foo', 'bar'],
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    expect(certBundAdv.categories).toEqual(['foo', 'bar']);
  });

  test('should return array also if single CategoryTree is given', () => {
    const elem = {
      raw_data: {
        Advisory: {
          CategoryTree: 'foo',
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    expect(certBundAdv.categories).toEqual(['foo']);
  });

  test('should return empty descriptions array if no advisory is given', () => {
    const certBundAdv = new CertBundAdv({});
    expect(certBundAdv.description).toEqual([]);
  });

  test('should return array of textblock descriptions', () => {
    const elem = {
      raw_data: {
        Advisory: {
          Description: {
            Element: [{TextBlock: 'foo'}, {TextBlock: 'bar'}],
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    expect(certBundAdv.description).toEqual(['foo', 'bar']);
  });

  test('should return array even for single textblock description', () => {
    const elem = {
      raw_data: {
        Advisory: {
          Description: {
            Element: {
              TextBlock: 'foo',
            },
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    expect(certBundAdv.description).toEqual(['foo']);
  });

  test('should return empty additional_information array if no advisory is given', () => {
    const certBundAdv = new CertBundAdv({});
    expect(certBundAdv.additional_information).toEqual([]);
  });

  test('should return array of additional_information', () => {
    const elem = {
      raw_data: {
        Advisory: {
          Description: {
            Element: [
              {
                Infos: {
                  Info: [
                    {
                      _Info_Issuer: 'foo',
                      _Info_URL: 'bar',
                    },
                    {
                      _Info_Issuer: 'lorem',
                      _Info_URL: 'ipsum',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    const res = [
      {
        issuer: 'foo',
        url: 'bar',
      },
      {
        issuer: 'lorem',
        url: 'ipsum',
      },
    ];
    expect(certBundAdv.additional_information).toEqual(res);
  });

  test('should return array even for single additional_information', () => {
    const elem = {
      raw_data: {
        Advisory: {
          Description: {
            Element: [
              {
                Infos: {
                  Info: {
                    _Info_Issuer: 'foo',
                    _Info_URL: 'bar',
                  },
                },
              },
            ],
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    const res = [
      {
        issuer: 'foo',
        url: 'bar',
      },
    ];
    expect(certBundAdv.additional_information).toEqual(res);
  });

  test('should return Ref_Num as version', () => {
    const elem = {
      raw_data: {
        Advisory: {
          Ref_Num: {
            _update: '5',
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    expect(certBundAdv.version).toEqual('5');
  });

  test('should parse revision history', () => {
    const elem = {
      raw_data: {
        Advisory: {
          RevisionHistory: {
            Revision: [
              {
                Number: '42',
                Description: 'lorem ipsum',
                Date: '2018-10-10T13:30:00+01:00',
              },
              {
                Number: '43',
                Description: 'lorem ipsum dolor',
                Date: '2018-10-10T13:31:00+01:00',
              },
            ],
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);
    const res = [
      {
        revision: '42',
        description: 'lorem ipsum',
        date: parseDate('2018-10-10T13:30:00+01:00'),
      },
      {
        revision: '43',
        description: 'lorem ipsum dolor',
        date: parseDate('2018-10-10T13:31:00+01:00'),
      },
    ];
    expect(certBundAdv.revision_history).toEqual(res);
  });

  test('should return empty cves array if no advisory is given', () => {
    const certBundAdv = new CertBundAdv({});
    expect(certBundAdv.cves).toEqual([]);
  });

  test('should return array of CVEs', () => {
    const elem = {
      raw_data: {
        Advisory: {
          CVEList: {
            CVE: ['foo', 'bar'],
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);

    expect(certBundAdv.cves).toEqual(['foo', 'bar']);
  });

  test('should return array of CVEs even for single CVE', () => {
    const elem = {
      raw_data: {
        Advisory: {
          CVEList: {
            CVE: 'foo',
          },
        },
      },
    };
    const certBundAdv = new CertBundAdv(elem);

    expect(certBundAdv.cves).toEqual(['foo']);
  });
});
