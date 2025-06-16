/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
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
    const portList = PortList.fromElement<PortList>(elem);

    expect(portList.portRanges[0]).toBeInstanceOf(Model);
    expect(portList.portRanges[0].entityType).toEqual('portrange');
    expect(portList.portRanges[0].start).toEqual('1');
    expect(portList.portRanges[0].end).toEqual('2');
    expect(portList.portRanges[0].comment).toEqual('foo');
    expect(portList.portRanges[0].portListId).toEqual('1337');
    expect(portList.portRanges[0].id).toEqual('123abc');
    expect(portList.portRanges[0].protocolType).toEqual('tcp');
    expect(portList.portRanges[1]).toBeInstanceOf(Model);
    expect(portList.portRanges[1].entityType).toEqual('portrange');
    expect(portList.portRanges[1].start).toEqual('3');
    expect(portList.portRanges[1].end).toEqual('200');
    expect(portList.portRanges[1].comment).toBeUndefined();
    expect(portList.portRanges[1].portListId).toEqual('1337');
    expect(portList.portRanges[1].id).toEqual('42xy');
    expect(portList.portRanges[1].protocolType).toEqual('udp');
  });

  test('should parse port_count correctly and as integer', () => {
    const elem = {
      port_count: {
        all: '42',
        tcp: '20',
        udp: '1',
      },
    };
    const portList = PortList.fromElement<PortList>(elem);

    expect(portList.portCount.all).toEqual(42);
    expect(portList.portCount.tcp).toEqual(20);
    expect(portList.portCount.udp).toEqual(1);
  });

  test('should return counts of zero, if port_count is not defined', () => {
    const portList = PortList.fromElement<PortList>({});

    expect(portList.portCount.all).toEqual(0);
    expect(portList.portCount.tcp).toEqual(0);
    expect(portList.portCount.udp).toEqual(0);
  });

  test('should parse targets', () => {
    const elem = {
      targets: {
        target: [{id: '123'}, {id: '456'}],
      },
    };
    const portList = PortList.fromElement<PortList>(elem);

    expect(portList.targets[0]).toBeInstanceOf(Model);
    expect(portList.targets[0].entityType).toEqual('target');
    expect(portList.targets[0].id).toEqual('123');
    expect(portList.targets[1]).toBeInstanceOf(Model);
    expect(portList.targets[1].entityType).toEqual('target');
    expect(portList.targets[1].id).toEqual('456');
  });

  test('should return empty array if no targets are given', () => {
    const portList = PortList.fromElement<PortList>({});

    expect(portList.targets).toEqual([]);
  });

  test('should parse predefined as boolean correctly', () => {
    const portList = PortList.fromElement<PortList>({predefined: '0'});
    const portList2 = PortList.fromElement<PortList>({predefined: '1'});

    expect(portList.predefined).toEqual(false);
    expect(portList2.predefined).toEqual(true);
  });
});
