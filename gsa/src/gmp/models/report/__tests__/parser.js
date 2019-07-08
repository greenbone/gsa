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

import {parse_hosts} from '../parser';

describe('report parser tests', () => {
  test('parse_hosts tests', () => {
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
    const parsedHosts = parse_hosts(hosts, 'foo=bar');

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
});

// vim: set ts=2 sw=2 tw=80:
