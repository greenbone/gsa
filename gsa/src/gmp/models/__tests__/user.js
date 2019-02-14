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
    const user = new User(elem);

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
    const user = new User(elem);
    const user2 = new User({});

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
    const user = new User(elem);
    const user2 = new User({});

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
    const user = new User(elem);
    const user2 = new User({});

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
    const user1 = new User(elem1);
    const user2 = new User(elem2);
    const user3 = new User({});

    expect(user1.auth_method).toEqual(AUTH_METHOD_LDAP);
    expect(user2.auth_method).toEqual(AUTH_METHOD_RADIUS);
    expect(user1.sources).toBeUndefined();
    expect(user3.auth_method).toEqual(AUTH_METHOD_PASSWORD);
  });
});

// vim: set ts=2 sw=2 tw=80:
