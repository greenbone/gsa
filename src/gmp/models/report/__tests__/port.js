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
import ReportPort from '../port';

describe('ReportPort tests', () => {
  test('should initialize hosts', () => {
    const port1 = new ReportPort();

    expect(port1.hosts).toBeDefined();
    expect(port1.hosts.hostsByIp).toBeDefined();
    expect(port1.hosts.count).toEqual(0);

    const port2 = ReportPort.fromElement();

    expect(port2.hosts).toBeDefined();
    expect(port2.hosts.hostsByIp).toBeDefined();
    expect(port2.hosts.count).toEqual(0);
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

    port.setSeverity(3.5);

    expect(port.severity).toEqual(5.5);

    port.setSeverity(9.5);

    expect(port.severity).toEqual(9.5);
  });

  test('should parse severity', () => {
    const port = ReportPort.fromElement({severity: '5.5'});

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
