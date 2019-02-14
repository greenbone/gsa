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

import Role from '../role';
import {testModel} from 'gmp/models/testing';

testModel(Role, 'role');

describe('Role model tests', () => {
  test('should parse multiple users', () => {
    const elem = {users: 'foo, bar'};
    const role = new Role(elem);

    expect(role.users).toEqual(['foo', 'bar']);
  });

  test('should parse single user', () => {
    const elem = {users: 'foo'};
    const role = new Role(elem);

    expect(role.users).toEqual(['foo']);
  });

  test('should parse empty users string to empty array', () => {
    const elem = {users: ''};
    const role = new Role(elem);

    expect(role.users).toEqual([]);
  });

  test('should parse empty object to have empty users array', () => {
    const role = new Role({});

    expect(role.users).toEqual([]);
  });
});

// vim: set ts=2 sw=2 tw=80:
