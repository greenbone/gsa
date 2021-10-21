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

import Role from '../role';
import {testModel} from 'gmp/models/testing';

testModel(Role, 'role');

describe('Role model tests', () => {
  test('should parse multiple users', () => {
    const elem = {users: 'foo, bar'};
    const role = Role.fromElement(elem);

    expect(role.users).toEqual(['foo', 'bar']);
  });

  test('should parse single user', () => {
    const elem = {users: 'foo'};
    const role = Role.fromElement(elem);

    expect(role.users).toEqual(['foo']);
  });

  test('should parse empty users string to empty array', () => {
    const elem = {users: ''};
    const role = Role.fromElement(elem);

    expect(role.users).toEqual([]);
  });

  test('should parse empty object to have empty users array', () => {
    const role = Role.fromElement({});

    expect(role.users).toEqual([]);
  });
});

// vim: set ts=2 sw=2 tw=80:
