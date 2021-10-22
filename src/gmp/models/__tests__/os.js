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
