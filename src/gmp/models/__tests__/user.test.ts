/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import {testModel} from 'gmp/models/testing';
import User, {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_RADIUS,
  AUTH_METHOD_PASSWORD,
} from 'gmp/models/user';

testModel(User, 'user');

describe('User model tests', () => {
  test('should parse roles', () => {
    const elem = {
      _id: '123',
      role: [
        {
          _id: '123',
        },
      ],
    };
    const user = User.fromElement(elem);

    expect(user.roles[0]).toBeInstanceOf(Model);
    expect(user.roles[0].entityType).toEqual('role');
    // @ts-expect-error
    expect(user.role).toBeUndefined();
  });

  test('should parse groups or return empty array', () => {
    const elem = {
      _id: '123',
      groups: {
        group: [
          {
            _id: '123',
          },
        ],
      },
    };
    const user = User.fromElement(elem);
    const user2 = User.fromElement();

    expect(user.groups[0]).toBeInstanceOf(Model);
    expect(user.groups[0].entityType).toEqual('group');
    expect(user2.groups).toEqual([]);
  });

  test('should parse hosts', () => {
    const elem = {
      _id: '123',
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
      _id: '123',
      sources: {
        source: 'ldap_connect',
      },
    };
    const elem2 = {
      _id: '122',
      sources: {
        source: 'radius_connect',
      },
    };
    const user1 = User.fromElement(elem1);
    const user2 = User.fromElement(elem2);
    const user3 = User.fromElement();

    expect(user1.authMethod).toEqual(AUTH_METHOD_LDAP);
    expect(user2.authMethod).toEqual(AUTH_METHOD_RADIUS);
    // @ts-expect-error
    expect(user1.sources).toBeUndefined();
    expect(user3.authMethod).toEqual(AUTH_METHOD_PASSWORD);
  });

  test('isSuperAdmin() should return correct true/false', () => {
    const user1 = User.fromElement({
      _id: '123',
      role: [
        {
          _id: '9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5', // ID for Superadmin
        },
      ],
    });
    const user2 = User.fromElement({
      _id: '456',
      role: [
        {
          _id: '42',
        },
      ],
    });
    const user3 = User.fromElement({
      _id: '789',
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
