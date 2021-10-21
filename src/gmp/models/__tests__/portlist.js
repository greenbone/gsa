/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import Model from 'gmp/model';
import PortList from 'gmp/models/portlist';
import {testModel} from 'gmp/models/testing';

testModel(PortList, 'portlist');

describe('PortList model tests', () => {
  test('should parse port ranges', () => {
    const elem = {
      id: '1337',
      port_ranges: {
        port_range: [
          {
            _id: '123abc',
            start: '1',
            end: '2',
            type: 'tcp',
            comment: 'foo',
          },
          {
            _id: '42xy',
            start: '3',
            end: '200',
            type: 'udp',
          },
        ],
      },
    };
    const portList = PortList.fromElement(elem);

    expect(portList.port_ranges[0]).toBeInstanceOf(Model);
    expect(portList.port_ranges[0].entityType).toEqual('portrange');
    expect(portList.port_ranges[0].start).toEqual('1');
    expect(portList.port_ranges[0].end).toEqual('2');
    expect(portList.port_ranges[0].comment).toEqual('foo');
    expect(portList.port_ranges[0].port_list_id).toEqual('1337');
    expect(portList.port_ranges[0].id).toEqual('123abc');
    expect(portList.port_ranges[0].protocol_type).toEqual('tcp');
    expect(portList.port_ranges[1]).toBeInstanceOf(Model);
    expect(portList.port_ranges[1].entityType).toEqual('portrange');
    expect(portList.port_ranges[1].start).toEqual('3');
    expect(portList.port_ranges[1].end).toEqual('200');
    expect(portList.port_ranges[1].comment).toBeUndefined();
    expect(portList.port_ranges[1].port_list_id).toEqual('1337');
    expect(portList.port_ranges[1].id).toEqual('42xy');
    expect(portList.port_ranges[1].protocol_type).toEqual('udp');
  });

  test('should parse port_count correctly and as integer', () => {
    const elem = {
      port_count: {
        all: '42',
        tcp: '20',
        udp: '1',
      },
    };
    const portList = PortList.fromElement(elem);

    expect(portList.port_count.all).toEqual(42);
    expect(portList.port_count.tcp).toEqual(20);
    expect(portList.port_count.udp).toEqual(1);
  });

  test('should return counts of zero, if port_count is not defined', () => {
    const portList = PortList.fromElement({});

    expect(portList.port_count.all).toEqual(0);
    expect(portList.port_count.tcp).toEqual(0);
    expect(portList.port_count.udp).toEqual(0);
  });

  test('should parse targets', () => {
    const elem = {
      targets: {
        target: [{id: '123'}, {id: '456'}],
      },
    };
    const portList = PortList.fromElement(elem);

    expect(portList.targets[0]).toBeInstanceOf(Model);
    expect(portList.targets[0].entityType).toEqual('target');
    expect(portList.targets[0].id).toEqual('123');
    expect(portList.targets[1]).toBeInstanceOf(Model);
    expect(portList.targets[1].entityType).toEqual('target');
    expect(portList.targets[1].id).toEqual('456');
  });

  test('should return empty array if no targets are given', () => {
    const portList = PortList.fromElement({});

    expect(portList.targets).toEqual([]);
  });

  test('should parse predefined as boolean correctly', () => {
    const portList = PortList.fromElement({predefined: '0'});
    const portList2 = PortList.fromElement({predefined: '1'});

    expect(portList.predefined).toEqual(false);
    expect(portList2.predefined).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
