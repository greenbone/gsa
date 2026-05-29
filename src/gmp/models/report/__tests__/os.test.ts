/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportOperatingSystem from 'gmp/models/report/os';

describe('ReportOperatingSystem tests', () => {
  test('should initialize hosts with count', () => {
    const os1 = new ReportOperatingSystem();

    expect(os1.hosts).toBeDefined();
    expect(os1.hosts.count).toEqual(0);

    const os2 = ReportOperatingSystem.fromElement();

    expect(os2.hosts).toBeDefined();
    expect(os2.hosts.count).toEqual(0);
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

  test('should parse hosts_count', () => {
    const os = ReportOperatingSystem.fromElement({
      best_os_cpe: 'cpe:/foo/bar',
      best_os_txt: 'Foo OS',
      hosts_count: 5,
    });

    expect(os.hosts.count).toEqual(5);
  });

  test('should default hosts_count to 0 when not provided', () => {
    const os = ReportOperatingSystem.fromElement({
      best_os_cpe: 'cpe:/foo/bar',
      best_os_txt: 'Foo OS',
    });

    expect(os.hosts.count).toEqual(0);
  });
});
