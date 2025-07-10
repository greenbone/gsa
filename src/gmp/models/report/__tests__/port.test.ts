/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportPort from 'gmp/models/report/port';

describe('ReportPort tests', () => {
  test('should use defaults', () => {
    const port = new ReportPort();
    expect(port.id).toBeUndefined();
    expect(port.threat).toBeUndefined();
    expect(port.number).toEqual(0);
    expect(port.protocol).toBeUndefined();
    expect(port.severity).toBeUndefined();
    expect(port.hosts).toBeDefined();
    expect(port.hosts.hostsByIp).toEqual({});
    expect(port.hosts.count).toEqual(0);
  });

  test('should parse empty element', () => {
    const port = ReportPort.fromElement();
    expect(port.id).toBeUndefined();
    expect(port.threat).toBeUndefined();
    expect(port.number).toEqual(0);
    expect(port.protocol).toBeUndefined();
    expect(port.severity).toBeUndefined();
    expect(port.hosts).toBeDefined();
    expect(port.hosts.hostsByIp).toEqual({});
    expect(port.hosts.count).toEqual(0);
  });

  test('should add hosts', () => {
    const port = ReportPort.fromElement();
    expect(port.hosts).toBeDefined();
    expect(port.hosts.hostsByIp).toEqual({});
    expect(port.hosts.count).toEqual(0);

    const host = {name: 'foo', ip: '1.2.3.4'};
    port.addHost(host);
    expect(port.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(port.hosts.count).toEqual(1);
  });

  test('should allow to set severity', () => {
    const port = ReportPort.fromElement();
    expect(port.severity).toBeUndefined();

    port.setSeverity(5.5);
    expect(port.severity).toEqual(5.5);
  });

  test('should parse severity', () => {
    const port = ReportPort.fromElement({severity: 5.5});
    expect(port.severity).toEqual(5.5);
  });

  test('should parse threat', () => {
    const port = ReportPort.fromElement({threat: 'Low'});
    expect(port.threat).toEqual('Low');
  });

  test('should parse port information', () => {
    const port1 = ReportPort.fromElement({
      __text: '123/tcp',
    });
    expect(port1.id).toEqual('123/tcp');
    expect(port1.number).toEqual(123);
    expect(port1.protocol).toEqual('tcp');

    const port2 = ReportPort.fromElement({
      __text: 'general/tcp',
    });
    expect(port2.id).toEqual('general/tcp');
    expect(port2.number).toEqual(0);
    expect(port2.protocol).toEqual('tcp');
  });
});
