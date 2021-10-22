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

import Model from 'gmp/model';
import User, {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_RADIUS,
  AUTH_METHOD_PASSWORD,
} from 'gmp/models/user';
import {testModel} from 'gmp/models/testing';

testModel(User, 'user');

describe('User model tests', () => {
  test('should parse roles', () => {
    const elem = {
      role: [
        {
          _id: '123',
        },
      ],
    };
    const user = User.fromElement(elem);

    expect(user.roles[0]).toBeInstanceOf(Model);
    expect(user.roles[0].entityType).toEqual('role');
    expect(user.role).toBeUndefined();
  });

  test('should parse groups or return empty array', () => {
    const elem = {
      groups: {
        group: [
          {
            _id: '123',
          },
        ],
      },
    };
    const user = User.fromElement(elem);
    const user2 = User.fromElement({});

    expect(user.groups[0]).toBeInstanceOf(Model);
    expect(user.groups[0].entityType).toEqual('group');
    expect(user2.groups).toEqual([]);
  });

  test('should parse hosts', () => {
    const elem = {
      hosts: {
        __text: '123.456.789.42, 987.654.321.1',
        _allow: '0',
      },
    };
    const res = {
      addresses: ['123.456.789.42', '987.654.321.1'],
      allow: '0',
    };
    const res2 = {
      addresses: [],
    };
    const user = User.fromElement(elem);
    const user2 = User.fromElement({});

    expect(user.hosts).toEqual(res);
    expect(user2.hosts).toEqual(res2);
  });

  test('should parse ifaces', () => {
    const elem = {
      ifaces: {
        __text: '123.456.789.42, 987.654.321.1',
        _allow: '0',
      },
    };
    const res = {
      addresses: ['123.456.789.42', '987.654.321.1'],
      allow: '0',
    };
    const res2 = {
      addresses: [],
    };
    const user = User.fromElement(elem);
    const user2 = User.fromElement({});

    expect(user.ifaces).toEqual(res);
    expect(user2.ifaces).toEqual(res2);
  });

  test('should parse sources to auth_method', () => {
    const elem1 = {
      sources: {
        source: 'ldap_connect',
      },
    };
    const elem2 = {
      sources: {
        source: 'radius_connect',
      },
    };
    const user1 = User.fromElement(elem1);
    const user2 = User.fromElement(elem2);
    const user3 = User.fromElement({});

    expect(user1.authMethod).toEqual(AUTH_METHOD_LDAP);
    expect(user2.authMethod).toEqual(AUTH_METHOD_RADIUS);
    expect(user1.sources).toBeUndefined();
    expect(user3.authMethod).toEqual(AUTH_METHOD_PASSWORD);
  });

  test('isSuperAdmin() should return correct true/false', () => {
    const user1 = User.fromElement({
      role: [
        {
          _id: '9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5', // ID for Superadmin
        },
      ],
    });
    const user2 = User.fromElement({
      role: [
        {
          _id: '42',
        },
      ],
    });
    const user3 = User.fromElement({
      role: [
        {
          _id: '9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5', // ID for Superadmin
        },
        {
          _id: '42',
        },
      ],
    });

    expect(user1.isSuperAdmin()).toEqual(true);
    expect(user2.isSuperAdmin()).toEqual(false);
    expect(user3.isSuperAdmin()).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
