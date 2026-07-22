/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Group from 'gmp/models/group';
import {testModel} from 'gmp/models/testing';

testModel(Group, 'group');

describe('Group model tests', () => {
  test('should parse multiple users', () => {
    const elem = {_id: 'test-id', users: 'foo, bar'};
    const group = Group.fromElement(elem);

    expect(group.users).toEqual(['foo', 'bar']);
  });

  test('should parse single user', () => {
    const elem = {_id: 'test-id', users: 'foo'};
    const group = Group.fromElement(elem);

    expect(group.users).toEqual(['foo']);
  });

  test('should parse empty users string to empty array', () => {
    const elem = {_id: 'test-id', users: ''};
    const group = Group.fromElement(elem);

    expect(group.users).toEqual([]);
  });

  test('should parse empty object to have empty users array', () => {
    const group = Group.fromElement({_id: 'test-id'});

    expect(group.users).toEqual([]);
  });
});
