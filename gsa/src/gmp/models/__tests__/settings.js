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

import Settings from 'gmp/models/settings';

describe('Settings model tests', () => {
  test('settings have working setters and getters', () => {
    const settings = new Settings();
    settings.set('foo', 'bar');
    const res = settings.get('foo');
    const res2 = settings.get('');

    expect(res).toEqual('bar');
    expect(res2).toEqual({});
  });

  test('getEntries() should return all settings', () => {
    const settings = new Settings();
    settings.set('foo', 'bar');
    settings.set('lorem', 'ipsum');

    expect(settings.getEntries()).toEqual([
      ['foo', 'bar'],
      ['lorem', 'ipsum'],
    ]);
  });

  test('should not have non existing key', () => {
    const settings = new Settings();
    expect(settings.has('foo')).toEqual(false);
  });

  test('should have existing key', () => {
    const settings = new Settings();
    settings.set('foo', 'bar');

    expect(settings.has('foo')).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
