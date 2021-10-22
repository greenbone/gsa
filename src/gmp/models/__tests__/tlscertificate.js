/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import TlsCertificate, {TIME_STATUS} from '../tlscertificate';

import {testModel} from 'gmp/models/testing';

import {parseDate} from 'gmp/parser';

describe('TlsCertificate Model tests', () => {
  testModel(TlsCertificate, 'tlscertificate');

  test('should parse certificate', () => {
    const element = {
      certificate: {
        __text: 'CERT123',
      },
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element);
    const tlsCertificate2 = TlsCertificate.fromElement();

    expect(tlsCertificate1.certificate).toEqual('CERT123');
    expect(tlsCertificate2.certificate).toBeUndefined();
  });

  test('should parse issuer_dn as name', () => {
    const element = {
      certificate: {
        __text: 'CERT123',
      },
      issuer_dn: 'dn',
    };
    const tlsCertificate = TlsCertificate.fromElement(element);

    expect(tlsCertificate.name).toEqual('dn');
    expect(tlsCertificate.issuer_dn).toBeUndefined();
  });

  test('should parse activation_time', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      activation_time: '2019-10-10T11:09:23.022Z',
    };
    const element2 = {
      certificate: {
        __text: 'CERT123',
      },
      activation_time: 'undefined',
    };
    const element3 = {
      certificate: {
        __text: 'CERT123',
      },
      activation_time: 'unlimited',
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);
    const tlsCertificate2 = TlsCertificate.fromElement(element2);
    const tlsCertificate3 = TlsCertificate.fromElement(element3);

    expect(tlsCertificate1.activationTime).toEqual(
      parseDate('2019-10-10T11:09:23.022Z'),
    );
    expect(tlsCertificate1.activation_time).toBeUndefined();
    expect(tlsCertificate2.activationTime).toBeUndefined();
    expect(tlsCertificate3.activationTime).toBeUndefined();
  });

  test('should parse expiration_time', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      expiration_time: '2019-10-10T11:09:23.022Z',
    };
    const element2 = {
      certificate: {
        __text: 'CERT123',
      },
      expiration_time: 'undefined',
    };
    const element3 = {
      certificate: {
        __text: 'CERT123',
      },
      expiration_time: 'unlimited',
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);
    const tlsCertificate2 = TlsCertificate.fromElement(element2);
    const tlsCertificate3 = TlsCertificate.fromElement(element3);

    expect(tlsCertificate1.expirationTime).toEqual(
      parseDate('2019-10-10T11:09:23.022Z'),
    );
    expect(tlsCertificate1.expiration_time).toBeUndefined();
    expect(tlsCertificate2.expirationTime).toBeUndefined();
    expect(tlsCertificate3.expirationTime).toBeUndefined();
  });

  test('should parse last_seen', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      last_seen: '2019-10-10T11:09:23.022Z',
    };
    const element2 = {
      certificate: {
        __text: 'CERT123',
      },
      last_seen: 'undefined',
    };
    const element3 = {
      certificate: {
        __text: 'CERT123',
      },
      last_seen: 'unlimited',
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);
    const tlsCertificate2 = TlsCertificate.fromElement(element2);
    const tlsCertificate3 = TlsCertificate.fromElement(element3);

    expect(tlsCertificate1.lastSeen).toEqual(
      parseDate('2019-10-10T11:09:23.022Z'),
    );
    expect(tlsCertificate1.last_seen).toBeUndefined();
    expect(tlsCertificate2.lastSeen).toBeUndefined();
    expect(tlsCertificate3.lastSeen).toBeUndefined();
  });

  test('should parse time_status', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      time_status: 'inactive',
    };
    const element2 = {
      certificate: {
        __text: 'CERT123',
      },
      time_status: 'valid',
    };
    const element3 = {
      certificate: {
        __text: 'CERT123',
      },
      time_status: 'expired',
    };
    const element4 = {
      certificate: {
        __text: 'CERT123',
      },
      time_status: 'unknown',
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);
    const tlsCertificate2 = TlsCertificate.fromElement(element2);
    const tlsCertificate3 = TlsCertificate.fromElement(element3);
    const tlsCertificate4 = TlsCertificate.fromElement(element4);

    expect(tlsCertificate1.timeStatus).toEqual(TIME_STATUS.inactive);
    expect(tlsCertificate2.timeStatus).toEqual(TIME_STATUS.valid);
    expect(tlsCertificate3.timeStatus).toEqual(TIME_STATUS.expired);
    expect(tlsCertificate4.timeStatus).toEqual(TIME_STATUS.unknown);
    expect(tlsCertificate1.time_status).toBeUndefined();
  });

  test('should parse valid', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      valid: '1',
    };
    const element2 = {
      certificate: {
        __text: 'CERT123',
      },
      valid: '0',
    };
    const element3 = {
      certificate: {
        __text: 'CERT123',
      },
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);
    const tlsCertificate2 = TlsCertificate.fromElement(element2);
    const tlsCertificate3 = TlsCertificate.fromElement(element3);

    expect(tlsCertificate1.valid).toEqual(true);
    expect(tlsCertificate2.valid).toEqual(false);
    expect(tlsCertificate3.valid).toEqual(false);
  });

  test('should parse trust', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      trust: '1',
    };
    const element2 = {
      certificate: {
        __text: 'CERT123',
      },
      trust: '0',
    };
    const element3 = {
      certificate: {
        __text: 'CERT123',
      },
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);
    const tlsCertificate2 = TlsCertificate.fromElement(element2);
    const tlsCertificate3 = TlsCertificate.fromElement(element3);

    expect(tlsCertificate1.trust).toEqual(true);
    expect(tlsCertificate2.trust).toEqual(false);
    expect(tlsCertificate3.trust).toEqual(false);
  });

  test('should parse sha256_fingerprint', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      sha256_fingerprint: 'SHA256',
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);

    expect(tlsCertificate1.sha256Fingerprint).toEqual('SHA256');
    expect(tlsCertificate1.sha256_fingerprint).toBeUndefined();
  });

  test('should parse md5_fingerprint', () => {
    const element1 = {
      certificate: {
        __text: 'CERT123',
      },
      md5_fingerprint: 'MD5',
    };
    const tlsCertificate1 = TlsCertificate.fromElement(element1);

    expect(tlsCertificate1.md5Fingerprint).toEqual('MD5');
    expect(tlsCertificate1.md5_fingerprint).toBeUndefined();
  });

  test('should parse source reports', () => {
    const element = {
      certificate: {
        __text: 'CERT123',
      },
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
    };
    const resSourceReports = [
      {
        id: 'ID123',
        timestamp: '2019-10-10T11:09:23.022Z',
      },
      {
        id: 'ID456',
        timestamp: '2019-10-10T11:09:23.022Z',
      },
      {
        id: 'ID789',
      },
    ];
    const tlsCertificate = TlsCertificate.fromElement(element);

    expect(tlsCertificate.sourceReports).toEqual(resSourceReports);
    expect(tlsCertificate.sources).toBeUndefined();
  });

  test('should parse source reports uniquely', () => {
    const element = {
      certificate: {
        __text: 'CERT123',
      },
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
    };
    const resSourceReports = [
      {
        id: 'ID123',
        timestamp: '2019-10-10T11:09:23.022Z',
      },
    ];
    const tlsCertificate = TlsCertificate.fromElement(element);

    expect(tlsCertificate.sourceReports).toEqual(resSourceReports);
    expect(tlsCertificate.sources).toBeUndefined();
  });

  test('should parse source hosts', () => {
    const element = {
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
                  _id: 'ID456',
                },
                ip: '123.456.789.42',
              },
            },
          },
        ],
      },
    };
    const resSourceHosts = [
      {
        id: 'ID123',
        ip: '123.456.789.0',
      },
      {
        id: 'ID456',
        ip: '123.456.789.42',
      },
    ];
    const tlsCertificate = TlsCertificate.fromElement(element);

    expect(tlsCertificate.sourceHosts).toEqual(resSourceHosts);
    expect(tlsCertificate.sources).toBeUndefined();
  });

  test('should parse source hosts uniquely', () => {
    const element = {
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
    };
    const resSourceHosts = [
      {
        id: 'ID123',
        ip: '123.456.789.0',
      },
    ];
    const tlsCertificate = TlsCertificate.fromElement(element);

    expect(tlsCertificate.sourceHosts).toEqual(resSourceHosts);
    expect(tlsCertificate.sources).toBeUndefined();
  });

  test('should parse source ports', () => {
    const element = {
      certificate: {
        __text: 'CERT123',
      },
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
    };
    const tlsCertificate = TlsCertificate.fromElement(element);

    expect(tlsCertificate.sourcePorts).toEqual(['1234', '5678']);
    expect(tlsCertificate.sources).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:
