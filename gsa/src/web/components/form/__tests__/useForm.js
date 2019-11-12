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

import {
  capitalizeFirstLetter,
  parseAlias,
  syncVariables,
  testNonEmptyString,
} from 'web/components/form/useForm';

/*
 * This suite only tests functions associated with useForm. * The hook itself should be tested with whichever dialog
 * component it is called with.
 */

describe('Testing useForm utilities', () => {
  test('capitalizeFirstLetter tests', () => {
    const word1 = 'foo';
    const word2 = 'Bar';
    const word3 = '0fooBar';

    expect(capitalizeFirstLetter('')).toEqual('');
    expect(capitalizeFirstLetter(word1)).toEqual('Foo');
    expect(capitalizeFirstLetter(word2)).toEqual('Bar');
    expect(capitalizeFirstLetter(word3)).toEqual('0fooBar');
  });

  test('parseAlias tests', () => {
    const word1 = 'foo';
    const word2 = 'Bar';
    const word3 = 'fooBar';
    const word4 = 'foo_bar';
    const word5 = '_fooBar';
    const word6 = ' Foo bar';
    const word7 = '0fooBar';

    expect(parseAlias('')).toEqual('');
    expect(parseAlias(word1)).toEqual('Foo');
    expect(parseAlias(word2)).toEqual('Bar');
    expect(parseAlias(word3)).toEqual('Foo Bar');
    expect(parseAlias(word4)).toEqual('Foo Bar');
    expect(parseAlias(word5)).toEqual('Foo Bar');
    expect(parseAlias(word6)).toEqual('Foo Bar');
    expect(parseAlias(word7)).toEqual('0foo Bar');
  });

  test('syncVariables tests', () => {
    const obj1 = {
      key1: 'foo',
      key2: 'bar',
      key3: 'lorem',
      key4: 'ipsum',
    };

    const obj2 = {
      key1: 'cat',
      key2: 'dog',
    };

    const obj3 = {
      key4: 'goat',
    };

    syncVariables(obj1, obj2, obj3);

    expect(obj1).toEqual({
      key1: 'cat',
      key2: 'dog',
      key3: 'lorem',
      key4: 'goat',
    });
  });

  test('testNonemptyString tests', () => {
    const term1 = 'lorem ipsum';
    const term2 = ' ';

    expect(testNonEmptyString(term1)).toBe(true);
    expect(testNonEmptyString(term2)).toBe(false);
    expect(testNonEmptyString('')).toBe(false);
  });
});
