/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import ReportOperatingSystem from '../os';

describe('ReportOperatingSystem tests', () => {
  test('should initialize hosts', () => {
    const os1 = new ReportOperatingSystem();

    expect(os1.hosts).toBeDefined();
    expect(os1.hosts.hostsByIp).toBeDefined();
    expect(os1.hosts.count).toEqual(0);

    const os2 = ReportOperatingSystem.fromElement();

    expect(os2.hosts).toBeDefined();
    expect(os2.hosts.hostsByIp).toBeDefined();
    expect(os2.hosts.count).toEqual(0);
  });

  test('should add host', () => {
    const os = ReportOperatingSystem.fromElement();

    expect(os.hosts).toBeDefined();
    expect(os.hosts.hostsByIp).toEqual({});
    expect(os.hosts.count).toEqual(0);

    const host = {name: 'foo', ip: '1.2.3.4'};
    os.addHost(host);

    expect(os.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(os.hosts.count).toEqual(1);
  });

  test('should allow to set severity', () => {
    const os = ReportOperatingSystem.fromElement();

    expect(os.severity).toBeUndefined();

    os.setSeverity(5.5);

    expect(os.severity).toEqual(5.5);

    os.setSeverity(3.5);

    expect(os.severity).toEqual(5.5);

    os.setSeverity(9.5);

    expect(os.severity).toEqual(9.5);
  });

  test('should parse best os', () => {
    const os = ReportOperatingSystem.fromElement({
      best_os_cpe: 'cpe:/foo/bar',
      best_os_txt: 'Foo OS',
    });

    expect(os.name).toEqual('Foo OS');
    expect(os.id).toEqual('cpe:/foo/bar');
    expect(os.cpe).toEqual('cpe:/foo/bar');
  });
});
