/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import UserTag from 'gmp/models/usertag';

describe('UserTag tests', () => {
  test('should create an instance of UserTag', () => {
    const userTag = new UserTag({
      id: '1',
      name: 'Test Tag',
      value: 'Test Value',
    });

    expect(userTag.id).toEqual('1');
    expect(userTag.name).toEqual('Test Tag');
    expect(userTag.value).toEqual('Test Value');
    expect(userTag.comment).toBeUndefined();
  });

  test('should create an instance of UserTag with comment', () => {
    const userTag = new UserTag({
      id: '2',
      name: 'Another Tag',
      value: 'Another Value',
      comment: 'This is a comment',
    });

    expect(userTag.id).toEqual('2');
    expect(userTag.name).toEqual('Another Tag');
    expect(userTag.value).toEqual('Another Value');
    expect(userTag.comment).toEqual('This is a comment');
  });

  test('should create UserTag from UserTagElement', () => {
    const userTagElement = {
      _id: '3',
      comment: 'Element comment',
      name: 'Element Tag',
      value: 'Element Value',
    };

    const userTag = UserTag.fromElement(userTagElement);

    expect(userTag.id).toEqual('3');
    expect(userTag.name).toEqual('Element Tag');
    expect(userTag.value).toEqual('Element Value');
    expect(userTag.comment).toEqual('Element comment');
  });

  test('should create UserTag from UserTagElement with numeric value', () => {
    const userTagElement = {
      _id: '4',
      comment: 'Numeric value comment',
      name: 'Numeric Tag',
      value: 42,
    };

    const userTag = UserTag.fromElement(userTagElement);

    expect(userTag.id).toEqual('4');
    expect(userTag.name).toEqual('Numeric Tag');
    expect(userTag.value).toEqual('42');
    expect(userTag.comment).toEqual('Numeric value comment');
  });
});
