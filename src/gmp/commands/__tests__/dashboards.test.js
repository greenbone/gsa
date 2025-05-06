/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  DEFAULT_ROW_HEIGHT,
  createDisplay,
  createRow,
} from 'gmp/commands/dashboards';

describe('createRow tests', () => {
  test('should create row with default height', () => {
    const uuid = testing.fn().mockReturnValue(1);
    expect(createRow(['foo', 'bar'], undefined, uuid)).toEqual({
      id: 1,
      items: ['foo', 'bar'],
      height: DEFAULT_ROW_HEIGHT,
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create row with height', () => {
    const uuid = testing.fn().mockReturnValue(1);
    expect(createRow(['foo', 'bar'], 100, uuid)).toEqual({
      id: 1,
      items: ['foo', 'bar'],
      height: 100,
    });
    expect(uuid).toHaveBeenCalled();
  });
});

describe('createDisplay tests', () => {
  test('should create a new item with empty props', () => {
    const uuid = testing.fn().mockReturnValue(1);
    expect(createDisplay('foo1', undefined, uuid)).toEqual({
      id: 1,
      displayId: 'foo1',
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create a new item with props', () => {
    const uuid = testing.fn().mockReturnValue(1);
    expect(createDisplay('foo1', {foo: 'bar'}, uuid)).toEqual({
      id: 1,
      displayId: 'foo1',
      foo: 'bar',
    });
    expect(uuid).toHaveBeenCalled();
  });
});
