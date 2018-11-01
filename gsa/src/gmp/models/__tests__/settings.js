/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import Settings from 'gmp/models/settings';

describe('Settings model tests', () => {

  test('settings have working setters and getters', () => {
    const settings = new Settings({});
    settings.set('foo', 'bar');
    const res = settings.get('foo');

    expect(res).toEqual('bar');
  });

  test('getEntries() should return all settings', () => {
    const settings = new Settings({});
    settings.set('foo', 'bar');
    settings.set('lorem', 'ipsum');

    expect(settings.getEntries()).toEqual([['foo', 'bar'], ['lorem', 'ipsum']]);
  });

});

// vim: set ts=2 sw=2 tw=80:
