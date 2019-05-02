/* Copyright (C) 2019 Greenbone Networks GmbH
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
import Setting from '../setting';

describe('Setting tests', () => {
  test('should create setting from an element', () => {
    const setting = new Setting({
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

  test('should not set empty value', () => {
    const setting = new Setting({
      value: '',
    });

    expect(setting.value).toBeUndefined();
  });

  test('should consider 0 as undefined value', () => {
    const setting = new Setting({
      value: '0',
    });

    expect(setting.value).toBeUndefined();
  });

  test('should ignore (null) in comment', () => {
    const setting = new Setting({
      comment: '(null)',
    });

    expect(setting.comment).toBeUndefined();
  });
});
