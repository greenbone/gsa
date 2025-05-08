/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Setting from 'gmp/models/setting';

describe('Setting tests', () => {
  test('should create setting from an element', () => {
    const setting = Setting.fromElement({
      _id: 'foo',
      comment: 'a comment',
      name: 'bar',
      value: 'foobar',
      // @ts-expect-error
      foo: 'bar',
    });

    expect(setting.id).toEqual('foo');
    expect(setting.comment).toEqual('a comment');
    expect(setting.name).toEqual('bar');
    expect(setting.value).toEqual('foobar');
    // @ts-expect-error
    expect(setting.foo).toBeUndefined();
  });

  test('should not set empty value', () => {
    const setting = Setting.fromElement({
      _id: 'foo',
      name: 'bar',
      value: '',
    });

    expect(setting.value).toBeUndefined();
  });

  test('should consider 0 as undefined value', () => {
    const setting = Setting.fromElement({
      _id: 'foo',
      name: 'bar',
      value: '0',
    });

    expect(setting.value).toBeUndefined();
  });

  test('should ignore (null) in comment', () => {
    const setting = Setting.fromElement({
      _id: 'foo',
      name: 'bar',
      comment: '(null)',
    });

    expect(setting.comment).toBeUndefined();
  });
});
