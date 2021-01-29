/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
  syncVariables,
  shouldBeNonEmpty,
} from 'web/components/form/useFormValidation';

/*
 * This suite only tests functions associated with useFormValidation. * The hook itself should be tested with whichever dialog
 * component it is called with.
 */

describe('Testing useFormValidation utilities', () => {
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

    expect(shouldBeNonEmpty(term1)).toBe(true);
    expect(shouldBeNonEmpty(term2)).toBe(false);
    expect(shouldBeNonEmpty('')).toBe(false);
    expect(shouldBeNonEmpty()).toBe(false);
  });
});
