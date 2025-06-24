/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Role from 'gmp/models/role';
import {testModel} from 'gmp/models/testing';

testModel(Role, 'role');

describe('Role model tests', () => {
  test('should use defaults', () => {
    const role = new Role();
    expect(role.users).toEqual([]);
  });

  test('should parse empty element', () => {
    const role = Role.fromElement({});
    expect(role.users).toEqual([]);
  });

  test('should parse users', () => {
    const role = Role.fromElement({users: 'foo, bar'});
    expect(role.users).toEqual(['foo', 'bar']);

    const role2 = Role.fromElement({users: 'foo'});
    expect(role2.users).toEqual(['foo']);

    const role3 = Role.fromElement({users: ''});
    expect(role3.users).toEqual([]);
  });
});
