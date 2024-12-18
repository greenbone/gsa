/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {testModel} from 'gmp/models/testing';

import Group from '../group';

testModel(Group, 'group');

describe('Group model tests', () => {
  test('should parse multiple users', () => {
    const elem = {};
    elem.users = 'foo, bar';
    const group = Group.fromElement(elem);

    expect(group.users).toEqual(['foo', 'bar']);
  });

  test('should parse single user', () => {
    const elem = {users: 'foo'};
    const group = Group.fromElement(elem);

    expect(group.users).toEqual(['foo']);
  });

  test('should parse empty users string to empty array', () => {
    const elem = {users: ''};
    const group = Group.fromElement(elem);

    expect(group.users).toEqual([]);
  });

  test('should parse empty object to have empty users array', () => {
    const group = Group.fromElement({});

    expect(group.users).toEqual([]);
  });
});
