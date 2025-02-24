/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Role from 'gmp/models/role';
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
