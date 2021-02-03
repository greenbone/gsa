/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import Setting from '../setting';

describe('Setting tests', () => {
  test('should create setting from an element', () => {
    const setting = Setting.fromElement({
      _id: 'foo',
      comment: 'a comment',
      name: 'bar',
      value: 'foobar',
      foo: 'bar',
    });

    expect(setting.id).toEqual('foo');
    expect(setting.comment).toEqual('a comment');
    expect(setting.name).toEqual('bar');
    expect(setting.value).toEqual('foobar');
    expect(setting.foo).toBeUndefined();
  });

  test('should create setting from an object', () => {
    const setting = Setting.fromObject({
      id: 'foo',
      comment: 'a comment',
      name: 'bar',
      value: 'foobar',
      foo: 'bar',
    });

    expect(setting.id).toEqual('foo');
    expect(setting.comment).toEqual('a comment');
    expect(setting.name).toEqual('bar');
    expect(setting.value).toEqual('foobar');
    expect(setting.foo).toBeUndefined();
  });

  test('should not set empty value', () => {
    const setting = Setting.fromElement({
      value: '',
    });

    expect(setting.value).toBeUndefined();
  });

  test('should consider 0 as undefined value', () => {
    const setting = Setting.fromElement({
      value: '0',
    });

    expect(setting.value).toBeUndefined();
  });

  test('should ignore (null) in comment', () => {
    const setting = Setting.fromElement({
      comment: '(null)',
    });

    expect(setting.comment).toBeUndefined();
  });
});
