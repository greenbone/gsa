/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import Asset from 'gmp/models/asset';
import OperatingSystem from 'gmp/models/os';

import {testModel} from 'gmp/models/testing';

testModel(OperatingSystem, 'operatingsystem');

describe('OperatingSystem model tests', () => {
  test('should be an instance of Asset', () => {
    const os = new OperatingSystem({});

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
    const os1 = new OperatingSystem(elem);
    const os2 = new OperatingSystem({});

    expect(os1.average_severity).toEqual(7);
    expect(os1.latest_severity).toEqual(8);
    expect(os1.highest_severity).toEqual(8.5);
    expect(os2.average_severity).toBeUndefined();
    expect(os2.latest_severity).toBeUndefined();
    expect(os2.highest_severity).toBeUndefined();
  });

  test('should have title equal to os.title', () => {
    const elem = {
      os: {
        title: 'foo',
      },
    };
    const os = new OperatingSystem(elem);

    expect(os.title).toEqual('foo');
  });

  test('should show on how many hosts it is installed', () => {
    const elem = {
      os: {
        installs: '42',
      },
    };
    const os = new OperatingSystem(elem);

    expect(os.hosts.length).toEqual('42');
  });

  test('should delete redundant os information', () => {
    const elem = {
      os: {
        installs: '42',
      },
    };
    const os = new OperatingSystem(elem);

    expect(os.os).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:
