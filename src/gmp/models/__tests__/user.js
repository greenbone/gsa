/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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
