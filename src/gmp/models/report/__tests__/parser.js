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

import {
  parseHosts,
  parsePorts,
  parseApps,
  parseOperatingSystems,
  parseTlsCertificates,
  parseCves,
  parse_errors,
  parseClosedCves,
} from '../parser';

describe('report parser tests', () => {
  test('should parse hosts', () => {
    const hosts = {
      host: [
        {
          ip: '1.1.1.1',
          port_count: {
            page: '42',
          },
        },
        {
          ip: '2.2.2.2',
          port_count: {
            page: '21',
          },
        },
      ],
      hosts: {
        count: '2',
      },
      results: {
        result: [
          {
            _id: '123',
            host: {
              __text: '1.1.1.1',
            },
            severity: '7',
          },
          {
            _id: '456',
            host: {
              __text: '2.2.2.2',
            },
            severity: '5.5',
          },
        ],
      },
    };
    const countsResult = {
      first: 1,
      all: 2,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };
    const parsedHosts = parseHosts(hosts, 'foo=bar');

    expect(parsedHosts.entities.length).toEqual(2);
    expect(parsedHosts.entities[0].id).toEqual('1.1.1.1');
    expect(parsedHosts.entities[0].portsCount).toEqual('42');
    expect(parsedHosts.entities[0].severity).toEqual(7);
    expect(parsedHosts.entities[1].id).toEqual('2.2.2.2');
    expect(parsedHosts.entities[1].portsCount).toEqual('21');
    expect(parsedHosts.entities[1].severity).toEqual(5.5);
    expect(parsedHosts.counts).toEqual(countsResult);
    expect(parsedHosts.filter).toEqual('foo=bar');
  });

  test('should parse empty hosts', () => {
    const filterString = 'foo=bar';
    const hosts = parseHosts({}, filterString);

    expect(hosts.entities.length).toEqual(0);
    expect(hosts.counts).toBeUndefined();
    expect(hosts.filter).toEqual('foo=bar');
  });

  test('should parse ports', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      ports: {
        count: 123,
        port: [
          {__text: '123/tcp', host: '1.2.3.4', severity: 5.5, threat: 'Medium'},
          {__text: '234/udp', host: '1.2.3.5', severity: 1.0, threat: 'Log'},
          {__text: '234/udp', host: '1.2.3.6', severity: 9.0, threat: 'High'},
          {__text: '234/udp', host: '1.2.3.5', severity: 7.5, threat: 'High'},
          {
            __text: 'general/tcp',
            host: '1.2.3.4',
            severity: 5,
            threat: 'Medium',
          },
          {host: '1.2.3.4', severity: 9, threat: 'High'},
        ],
      },
    };
    const counts = {
      first: 1,
      all: 123,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };
    const ports = parsePorts(report, filterString);

    expect(ports.entities.length).toEqual(2);
    expect(ports.counts).toEqual(counts);
    expect(ports.filter).toEqual('foo=bar rows=5');

    const [port1, port2] = ports.entities;

    expect(port1.id).toEqual('123/tcp');
    expect(port1.threat).toEqual('Medium');
    expect(port1.severity).toEqual(5.5);
    expect(port1.number).toEqual(123);
    expect(port1.protocol).toEqual('tcp');
    expect(port1.hosts.count).toEqual(1);

    expect(port2.id).toEqual('234/udp');
    expect(port2.threat).toEqual('Log');
    expect(port2.severity).toEqual(9.0);
    expect(port2.number).toEqual(234);
    expect(port2.protocol).toEqual('udp');
    expect(port2.hosts.count).toEqual(2);
  });

  test('should parse empty ports', () => {
    const filterString = 'foo=bar';
    const report = {};
    const ports = parsePorts(report, filterString);

    expect(ports.entities.length).toEqual(0);
    expect(ports.counts).toBeUndefined();
    expect(ports.filter).toEqual('foo=bar');
  });

  test('should parse apps', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      // apps are gathered from the host details
      host: [
        {
          detail: [
            {
              name: 'App',
              value: 'cpe:/a:foo:bar',
            },
          ],
          ip: '1.1.1.1',
        },
        {
          detail: [
            {
              name: 'App',
              value: 'cpe:/a:foo:bar',
            },
            {
              name: 'cpe:/a:foo:bar',
              value: '123/tcp',
            },
          ],
          ip: '2.2.2.2',
        },
        {
          detail: [
            {
              name: 'App',
              value: 'cpe:/a:lorem:ipsum',
            },
          ],
          ip: '1.1.1.1',
        },
      ],
      apps: {
        count: '123',
      },
      // results are used to get the app severity
      results: {
        result: [
          {
            severity: '5.5',
            detection: {
              result: {
                details: {
                  detail: [
                    {
                      name: 'foo', // another details that gets ignored
                      value: 'foo/bar',
                    },
                    {
                      name: 'product',
                      value: 'cpe:/a:foo:bar',
                    },
                  ],
                },
              },
            },
          },
          {
            severity: '7.5',
            detection: {
              result: {
                details: {
                  detail: [
                    {
                      name: 'product',
                      value: 'cpe:/a:foo:bar',
                    },
                  ],
                },
              },
            },
          },
          {
            severity: '4.5',
            detection: {
              result: {
                details: {
                  detail: [
                    {
                      name: 'product',
                      value: 'cpe:/a:foo:bar',
                    },
                  ],
                },
              },
            },
          },
          {
            severity: '5.5',
            detection: {
              result: {
                details: {
                  detail: [
                    {
                      name: 'product',
                      value: 'cpe:/a:lorem:ipsum',
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    };
    const counts = {
      first: 1,
      all: 123,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };
    const apps = parseApps(report, filterString);

    expect(apps.entities.length).toEqual(2);
    expect(apps.counts).toEqual(counts);
    expect(apps.filter).toEqual('foo=bar rows=5');

    const [app1, app2] = apps.entities;

    expect(app1.id).toEqual('cpe:/a:foo:bar');
    expect(app1.name).toEqual('cpe:/a:foo:bar');
    expect(app1.severity).toEqual(7.5);
    expect(app1.hosts.count).toEqual(2);
    expect(app1.occurrences.details).toEqual(1);
    expect(app1.occurrences.withoutDetails).toEqual(0);
    expect(app1.occurrences.total).toEqual(1);

    expect(app2.id).toEqual('cpe:/a:lorem:ipsum');
    expect(app2.name).toEqual('cpe:/a:lorem:ipsum');
    expect(app2.severity).toEqual(5.5);
    expect(app2.hosts.count).toEqual(1);
    expect(app2.occurrences.details).toEqual(0);
    expect(app2.occurrences.withoutDetails).toEqual(1);
    expect(app2.occurrences.total).toEqual(1);
  });

  test('should parse empty apps', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const apps = parseApps(report, filterString);

    expect(apps.entities.length).toEqual(0);
    expect(apps.counts).toBeUndefined();
    expect(apps.filter).toEqual('foo=bar rows=5');
  });

  test('should parse operating systems', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      os: {
        count: '123',
      },
      // os severities are parsed from the results of a host
      results: {
        result: [
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: '5.5',
          },
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: '9.5',
          },
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: '3.5',
          },
          {
            host: {
              __text: '2.2.2.2',
            },
            severity: '5.5',
          },
          {
            host: {
              __text: '3.3.3.3',
            },
            severity: '6.5',
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
            {
              // will be ignored
              name: 'foo',
              value: 'bar',
            },
          ],
        },
        {
          ip: '2.2.2.2',
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
        {
          ip: '3.3.3.3',
          detail: [
            {
              name: 'best_os_cpe',
              value: 'cpe:/bar/os',
            },
            {
              name: 'best_os_txt',
              value: 'Bar OS',
            },
          ],
        },
      ],
    };
    const counts = {
      first: 1,
      all: 123,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };
    const operatingSystems = parseOperatingSystems(report, filterString);

    expect(operatingSystems.entities.length).toEqual(2);
    expect(operatingSystems.counts).toEqual(counts);
    expect(operatingSystems.filter).toEqual('foo=bar rows=5');

    const [os1, os2] = operatingSystems.entities;

    expect(os1.name).toEqual('Foo OS');
    expect(os1.id).toEqual('cpe:/foo/os');
    expect(os1.cpe).toEqual('cpe:/foo/os');
    expect(os1.severity).toEqual(9.5);
    expect(os1.hosts.count).toEqual(2);

    expect(os2.name).toEqual('Bar OS');
    expect(os2.id).toEqual('cpe:/bar/os');
    expect(os2.cpe).toEqual('cpe:/bar/os');
    expect(os2.severity).toEqual(6.5);
    expect(os2.hosts.count).toEqual(1);
  });

  test('should parse empty operating systems', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const operatingSystems = parseOperatingSystems(report, filterString);

    expect(operatingSystems.entities.length).toEqual(0);
    expect(operatingSystems.counts).toBeUndefined();
    expect(operatingSystems.filter).toEqual('foo=bar rows=5');
  });

  test('should parse tls certificates', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      results: {
        result: [
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: '5.5',
          },
          {
            host: {
              __text: '2.2.2.2',
            },
            severity: '9.5',
          },
        ],
      },
      host: [
        {
          ip: '1.1.1.1',
          detail: [
            {
              name: 'SSLInfo',
              value: '123::fingerprint1',
            },
            {
              name: 'SSLDetails:fingerprint1',
              value:
                'issuer:CN=Foo Bar,O=Foo Bar,C=BM|serial:foobar|notBefore:20150930T144006|notAfter:20120930T145000',
            },
            {
              name: 'Cert:fingerprint1',
              value: 'x509:foobar',
            },
            {
              name: 'hostname',
              value: 'foo.bar',
            },
          ],
        },

        {
          ip: '2.2.2.2',
          detail: [
            {
              name: 'SSLInfo',
              value: '123::fingerprint2',
            },
            {
              name: 'SSLInfo',
              value: '234::fingerprint2',
            },
            {
              name: 'SSLInfo',
              value: '234::fingerprint1',
            },
          ],
        },
      ],
      ssl_certs: {count: '123'},
    };
    const counts = {
      first: 1,
      all: 123,
      filtered: 4,
      length: 4,
      rows: 4,
      last: 4,
    };
    const tlsCerts = parseTlsCertificates(report, filterString);

    expect(tlsCerts.entities.length).toEqual(4);
    expect(tlsCerts.counts).toEqual(counts);
    expect(tlsCerts.filter).toEqual('foo=bar rows=5');

    const [cert1, cert2, cert3, cert4] = tlsCerts.entities;

    expect(cert1.fingerprint).toEqual('fingerprint1');
    expect(cert1.hostname).toEqual('foo.bar');
    expect(cert1.ip).toEqual('1.1.1.1');
    expect(cert1.data).toEqual('foobar');
    expect(cert1._data).toEqual('x509:foobar');
    expect(cert1.ports).toBeUndefined();
    expect(cert1.port).toEqual(123);

    expect(cert2.fingerprint).toEqual('fingerprint2');
    expect(cert2.hostname).toBeUndefined();
    expect(cert2.ip).toEqual('2.2.2.2');
    expect(cert2.data).toBeUndefined();
    expect(cert2._data).toBeUndefined();
    expect(cert2.ports).toBeUndefined();
    expect(cert2.port).toEqual(123);

    expect(cert3.fingerprint).toEqual('fingerprint2');
    expect(cert3.hostname).toBeUndefined();
    expect(cert3.ip).toEqual('2.2.2.2');
    expect(cert3.data).toBeUndefined();
    expect(cert3._data).toBeUndefined();
    expect(cert3.ports).toBeUndefined();
    expect(cert3.port).toEqual(234);

    expect(cert4.fingerprint).toEqual('fingerprint1');
    expect(cert4.ip).toEqual('2.2.2.2');
    expect(cert4.data).toBeUndefined();
    expect(cert4._data).toBeUndefined();
    expect(cert4.ports).toBeUndefined();
    expect(cert4.port).toEqual(234);
  });

  test('should parse empty tls certificates', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const tlsCerts = parseTlsCertificates(report, filterString);

    expect(tlsCerts.entities.length).toEqual(0);
    expect(tlsCerts.counts).toBeUndefined();
    expect(tlsCerts.filter).toEqual('foo=bar rows=5');
  });

  test('should parse empty cves', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const cves = parseCves(report, filterString);

    expect(cves.entities.length).toEqual(0);
    expect(cves.counts).toBeUndefined();
    expect(cves.filter).toEqual('foo=bar rows=5');
  });

  test('should parse cves', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      results: {
        result: [
          {
            nvt: {
              refs: {
                ref: [{}],
              },
            },
          },
          {
            nvt: {
              refs: {
                ref: [
                  {
                    _type: '',
                  },
                ],
              },
            },
          },
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
            severity: '4.5',
          },
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
                  {
                    _type: 'foo',
                    _id: 'foo1',
                  },
                ],
              },
            },
            host: {
              __text: '2.2.2.2',
            },
            severity: '9.5',
          },
          {
            nvt: {
              _oid: '2.2.3',
              name: 'Bar',
              refs: {
                ref: [
                  {
                    _type: 'cve',
                    _id: 'CVE-234',
                  },
                ],
              },
            },
            host: {
              __text: '1.1.1.1',
            },
            severity: '5.5',
          },
          {
            nvt: {
              _oid: '2.3.3',
              name: 'Ipsum',
              refs: {
                ref: [
                  {
                    _type: 'cve',
                    _id: 'CVE-234',
                  },
                  {
                    _type: 'cve',
                    _id: 'CVE-334',
                  },
                ],
              },
            },
            host: {
              __text: '1.1.1.1',
            },
            severity: '6.5',
          },
        ],
      },
    };
    const counts = {
      first: 1,
      all: 3,
      filtered: 3,
      length: 3,
      rows: 3,
      last: 3,
    };
    const cves = parseCves(report, filterString);

    expect(cves.entities.length).toEqual(3);
    expect(cves.counts).toEqual(counts);
    expect(cves.filter).toEqual('foo=bar rows=5');

    const [cve1, cve2, cve3] = cves.entities;

    expect(cve1.id).toEqual('1.2.3');
    expect(cve1.nvtName).toEqual('Foo');
    expect(cve1.cves).toEqual(['CVE-123']);
    expect(cve1.severity).toEqual(9.5);
    expect(cve1.hosts.count).toEqual(2);
    expect(cve1.occurrences).toEqual(2);

    expect(cve2.id).toEqual('2.2.3');
    expect(cve2.nvtName).toEqual('Bar');
    expect(cve2.cves).toEqual(['CVE-234']);
    expect(cve2.severity).toEqual(5.5);
    expect(cve2.hosts.count).toEqual(1);
    expect(cve2.occurrences).toEqual(1);

    expect(cve3.id).toEqual('2.3.3');
    expect(cve3.nvtName).toEqual('Ipsum');
    expect(cve3.cves).toEqual(['CVE-234', 'CVE-334']);
    expect(cve3.severity).toEqual(6.5);
    expect(cve3.hosts.count).toEqual(1);
    expect(cve3.occurrences).toEqual(1);
  });

  test('should parse empty errors', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const errors = parse_errors(report, filterString);

    expect(errors.entities.length).toEqual(0);
    expect(errors.counts).toBeUndefined();
    expect(errors.filter).toEqual('foo=bar rows=5');
  });

  test('should parse errors', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      results: {
        result: [
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: '5.5',
          },
          {
            host: {
              __text: '2.2.2.2',
            },
            severity: '9.5',
          },
        ],
      },
      host: [
        {
          ip: '1.1.1.1',
          detail: [
            {
              name: 'hostname',
              value: 'foo.bar',
            },
          ],
        },

        {
          ip: '2.2.2.2',
          detail: [
            {
              name: 'hostname',
              value: 'lorem.ipsum',
            },
          ],
        },
      ],
      errors: {
        count: '2',
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
          {
            host: {
              __text: '2.2.2.2',
            },
            port: '456/tcp',
            description: 'This is another error.',
            nvt: {
              _oid: '159',
              name: 'NVT2',
            },
          },
        ],
      },
    };

    const counts = {
      first: 1,
      all: 2,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };

    const errors = parse_errors(report, filterString);

    expect(errors.entities.length).toEqual(2);
    expect(errors.counts).toEqual(counts);
    expect(errors.filter).toEqual('foo=bar rows=5');

    const [error1, error2] = errors.entities;

    expect(error1.id).toEqual('1.1.1.1314');
    expect(error1.description).toEqual('This is an error.');
    expect(error1.host.ip).toEqual('1.1.1.1');
    expect(error1.host.name).toEqual('foo.bar');
    expect(error1.host.id).toEqual('123');
    expect(error1.nvt.id).toEqual('314');
    expect(error1.nvt.name).toEqual('NVT1');
    expect(error1.port).toEqual('123/tcp');

    expect(error2.id).toEqual('2.2.2.2159');
    expect(error2.description).toEqual('This is another error.');
    expect(error2.host.ip).toEqual('2.2.2.2');
    expect(error2.host.name).toEqual('lorem.ipsum');
    expect(error2.host.id).toEqual(undefined);
    expect(error2.nvt.id).toEqual('159');
    expect(error2.nvt.name).toEqual('NVT2');
    expect(error2.port).toEqual('456/tcp');
  });

  test('should parse empty closed CVEs', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const closedCves = parse_errors(report, filterString);

    expect(closedCves.entities.length).toEqual(0);
    expect(closedCves.counts).toBeUndefined();
    expect(closedCves.filter).toEqual('foo=bar rows=5');
  });

  test('should parse closed CVEs', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      results: {
        result: [
          {
            host: {
              __text: '1.1.1.1',
            },
            severity: '5.5',
          },
          {
            host: {
              __text: '2.2.2.2',
            },
            severity: '9.5',
          },
        ],
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
                type: 'openvas',
                name: '201',
                description: 'This is a description',
              },
              extra: '10.0',
            },
          ],
        },

        {
          ip: '2.2.2.2',
          detail: [
            {
              name: 'hostname',
              value: 'lorem.ipsum',
            },
            {
              name: 'Closed CVE',
              value: 'CVE-2000-5678',
              source: {
                type: 'openvas',
                name: '202',
                description: 'This is another description',
              },
              extra: '5.0',
            },
          ],
        },
      ],
      closed_cves: {
        count: '2',
      },
    };

    const counts = {
      first: 1,
      all: 2,
      filtered: 2,
      length: 2,
      rows: 2,
      last: 2,
    };

    const closedCves = parseClosedCves(report, filterString);

    expect(closedCves.entities.length).toEqual(2);
    expect(closedCves.counts).toEqual(counts);
    expect(closedCves.filter).toEqual('foo=bar rows=5');

    const [closedCve1, closedCve2] = closedCves.entities;

    expect(closedCve1.id).toEqual('CVE-2000-1234-1.1.1.1-201');
    expect(closedCve1.cveId).toEqual('CVE-2000-1234');
    expect(closedCve1.host.ip).toEqual('1.1.1.1');
    expect(closedCve1.host.name).toEqual('foo.bar');
    expect(closedCve1.host.id).toEqual(undefined);
    expect(closedCve1.source.name).toEqual('201');
    expect(closedCve1.severity).toEqual(10);

    expect(closedCve2.id).toEqual('CVE-2000-5678-2.2.2.2-202');
    expect(closedCve2.cveId).toEqual('CVE-2000-5678');
    expect(closedCve2.host.ip).toEqual('2.2.2.2');
    expect(closedCve2.host.name).toEqual('lorem.ipsum');
    expect(closedCve2.host.id).toEqual(undefined);
    expect(closedCve2.source.name).toEqual('202');
    expect(closedCve2.severity).toEqual(5);
  });
});

// vim: set ts=2 sw=2 tw=80:
