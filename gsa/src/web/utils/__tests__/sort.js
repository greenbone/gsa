/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {ipToNumber} from '../sort';

describe('ipToNumber tests', () => {

  test('should convert ipv4 to number', () => {
    expect(ipToNumber('192.168.1.1')).toEqual(3232235777);
    expect(ipToNumber('192.168.1.2')).toEqual(3232235778);
  });

  test('should pass through invalid ip addresses', () => {
    expect(ipToNumber('foo')).toEqual('foo');
    expect(ipToNumber('a.168.1.1')).toEqual('a.168.1.1');
    expect(ipToNumber('192.a.1.1')).toEqual('192.a.1.1');
    expect(ipToNumber('192.168.a.1')).toEqual('192.168.a.1');
    expect(ipToNumber('192.168.1.a')).toEqual('192.168.1.a');
  });

  test('should pass through ipv6 address', () => {
    expect(ipToNumber('fe80::ccf8:4cc7:a11a:76a'))
      .toEqual('fe80::ccf8:4cc7:a11a:76a');
  });

});

// vim: set ts=2 sw=2 tw=80:
