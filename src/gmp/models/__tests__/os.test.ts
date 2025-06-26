/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OperatingSystem from 'gmp/models/os';
import {testModel} from 'gmp/models/testing';

testModel(OperatingSystem, 'operatingsystem');

describe('OperatingSystem model tests', () => {
  test('should use defaults', () => {
    const os = new OperatingSystem();
    expect(os.averageSeverity).toBeUndefined();
    expect(os.highestSeverity).toBeUndefined();
    expect(os.latestSeverity).toBeUndefined();
    expect(os.title).toBeUndefined();
    expect(os.hosts).toBeUndefined();
    expect(os.allHosts).toBeUndefined();
  });

  test('should parse empty element', () => {
    const os = OperatingSystem.fromElement();
    expect(os.averageSeverity).toBeUndefined();
    expect(os.highestSeverity).toBeUndefined();
    expect(os.latestSeverity).toBeUndefined();
    expect(os.title).toBeUndefined();
    expect(os.hosts).toBeUndefined();
    expect(os.allHosts).toBeUndefined();
  });

  test('should parse os severities', () => {
    const os1 = OperatingSystem.fromElement({
      os: {
        average_severity: {
          value: 7,
        },
        latest_severity: {
          value: 8,
        },
        highest_severity: {
          value: 8.5,
        },
      },
    });

    expect(os1.averageSeverity).toEqual(7);
    expect(os1.latestSeverity).toEqual(8);
    expect(os1.highestSeverity).toEqual(8.5);
  });

  test('should parse title', () => {
    const os = OperatingSystem.fromElement({
      os: {
        title: 'foo',
      },
    });

    expect(os.title).toEqual('foo');
  });

  test('should parse hosts', () => {
    const os = OperatingSystem.fromElement({
      os: {
        installs: 42,
      },
    });
    expect(os.hosts).toEqual(42);
  });

  test('should parse allHosts', () => {
    const os = OperatingSystem.fromElement({
      os: {
        all_installs: 100,
      },
    });
    expect(os.allHosts).toEqual(100);
  });
});
