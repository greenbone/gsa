/* Copyright (C) 2019 Greenbone Networks GmbH
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

import {parseHosts, parsePorts, parseVulnerabilities} from '../parser';

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
    const counts = {
      first: 0,
      all: 0,
      filtered: 0,
      length: 0,
      rows: 0,
      last: 0,
    };

    expect(hosts.entities.length).toEqual(0);
    expect(hosts.counts).toEqual(counts);
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
    const counts = {
      first: 0,
      all: 0,
      filtered: 0,
      length: 0,
      rows: 0,
      last: 0,
    };
    const ports = parsePorts(report, filterString);

    expect(ports.entities.length).toEqual(0);
    expect(ports.counts).toEqual(counts);
    expect(ports.filter).toEqual('foo=bar');
  });

  test('should parse vulnerabilities', () => {
    const filterString = 'foo=bar rows=5';
    const report = {
      vulns: {
        count: 123,
      },
      results: {
        result: [
          {
            nvt: {
              _oid: '1.2.3',
            },
            severity: '5.5',
            host: {ip: '1.1.1.1'},
            name: 'Foo Bar',
            qod: {type: 'foo', value: '4.5'},
          },
          {
            nvt: {
              _oid: '1.2.4',
            },
            severity: '9.5',
            host: {ip: '1.1.1.1'},
            name: 'Lorem Ipsum',
            qod: {type: 'foo', value: '9.5'},
          },
          {
            nvt: {
              _oid: '1.2.3',
            },
            severity: '6.5',
            host: {ip: '2.2.2.2'},
            name: 'Foo bar',
            qod: {type: 'foo', value: '4.5'},
          },
          {
            nvt: {
              _oid: '1.2.3',
            },
            severity: '3.5',
            host: {ip: '2.2.2.2'},
            name: 'Foo bar',
            qod: {type: 'foo', value: '4.5'},
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
    const vulnerabilities = parseVulnerabilities(report, filterString);

    expect(vulnerabilities.entities.length).toEqual(2);
    expect(vulnerabilities.counts).toEqual(counts);
    expect(vulnerabilities.filter).toEqual('foo=bar rows=5');

    const [vulnerability1, vulnerability2] = vulnerabilities.entities;

    expect(vulnerability1.id).toEqual('1.2.3');
    expect(vulnerability1.name).toEqual('Foo Bar');
    expect(vulnerability1.severity).toEqual(6.5);
    expect(vulnerability1.results.count).toEqual(3);
    expect(vulnerability1.hosts.count).toEqual(2);
    expect(vulnerability1.qod).toEqual({type: 'foo', value: 4.5});

    expect(vulnerability2.id).toEqual('1.2.4');
    expect(vulnerability2.name).toEqual('Lorem Ipsum');
    expect(vulnerability2.severity).toEqual(9.5);
    expect(vulnerability2.results.count).toEqual(1);
    expect(vulnerability2.hosts.count).toEqual(1);
    expect(vulnerability2.qod).toEqual({type: 'foo', value: 9.5});
  });

  test('should parse empty vulnerabilities', () => {
    const filterString = 'foo=bar rows=5';
    const report = {};
    const counts = {
      first: 0,
      all: 0,
      filtered: 0,
      length: 0,
      rows: 0,
      last: 0,
    };
    const vulnerabilities = parseVulnerabilities(report, filterString);

    expect(vulnerabilities.entities.length).toEqual(0);
    expect(vulnerabilities.counts).toEqual(counts);
    expect(vulnerabilities.filter).toEqual('foo=bar rows=5');
  });
});

// vim: set ts=2 sw=2 tw=80:
