/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Asset from 'gmp/models/asset';
import OperatingSystem from 'gmp/models/os';
import {testModel} from 'gmp/models/testing';

testModel(OperatingSystem, 'operatingsystem');

describe('OperatingSystem model tests', () => {
  test('should be an instance of Asset', () => {
    const os = OperatingSystem.fromElement({});

    expect(os instanceof Asset).toBe(true);
  });

  test('should parse os severities or return undefined', () => {
    const elem = {
      os: {
        average_severity: {
          value: '7',
        },
        latest_severity: {
          value: '8',
        },
        highest_severity: {
          value: '8.5',
        },
      },
    };
    const os1 = OperatingSystem.fromElement(elem);
    const os2 = OperatingSystem.fromElement({});

    expect(os1.averageSeverity).toEqual(7);
    expect(os1.latestSeverity).toEqual(8);
    expect(os1.highestSeverity).toEqual(8.5);
    expect(os2.averageSeverity).toBeUndefined();
    expect(os2.latestSeverity).toBeUndefined();
    expect(os2.highestSeverity).toBeUndefined();
  });

  test('should have title equal to os.title', () => {
    const elem = {
      os: {
        title: 'foo',
      },
    };
    const os = OperatingSystem.fromElement(elem);

    expect(os.title).toEqual('foo');
  });

  test('should show on how many hosts it is installed', () => {
    const elem = {
      os: {
        installs: '42',
      },
    };
    const os = OperatingSystem.fromElement(elem);

    expect(os.hosts.length).toEqual('42');
  });

  test('should delete redundant os information', () => {
    const elem = {
      os: {
        installs: '42',
      },
    };
    const os = OperatingSystem.fromElement(elem);

    expect(os.os).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:
