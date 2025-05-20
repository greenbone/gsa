/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {includesId, selectSaveId, hasId} from 'gmp/utils/id';

describe('includesId function tests', () => {
  test('should return true for found id', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    expect(includesId(list, '1')).toBe(true);
    expect(includesId(list, '2')).toBe(true);
    expect(includesId(list, '3')).toBe(true);
  });

  test('should return false for unknown id', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    expect(includesId(list, '4')).toBe(false);
  });

  test('should return false for different type of id', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    // @ts-expect-error
    expect(includesId(list, 2)).toBe(false);
  });

  test('should return false for an empty or undefined list', () => {
    expect(includesId([], '1')).toBe(false);
    expect(includesId(undefined, '2')).toBe(false);
  });
});

describe('selectSaveId function tests', () => {
  test('should return id if id is in list', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    expect(selectSaveId(list, '1')).toEqual('1');
    expect(selectSaveId(list, '2')).toEqual('2');
    expect(selectSaveId(list, '3')).toEqual('3');
  });

  test('should return first id if id is not in list', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    expect(selectSaveId(list, '4')).toBe('1');
    // @ts-expect-error
    expect(selectSaveId(list, 2)).toBe('1');
  });

  test('should return default if id is not in list', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    expect(selectSaveId(list, '4', '42')).toBe('42');
    // @ts-expect-error
    expect(selectSaveId(list, 2, '42')).toBe('42');
  });

  test('should select first entry id if id is undefined', () => {
    const list = [{id: '1'}, {id: '2'}, {id: '3'}];

    expect(selectSaveId(list)).toEqual('1');
  });

  test('should return undefined for undefined list', () => {
    expect(selectSaveId()).toBeUndefined();
  });

  test('should return empty_default for undefined list', () => {
    expect(selectSaveId(undefined, undefined, 'foo')).toEqual('foo');
  });
});

describe('hasId tests', () => {
  test('should return false if model is undefined', () => {
    expect(hasId(undefined)).toBe(false);
  });

  test('should return false if id is undefined', () => {
    expect(hasId({})).toBe(false);
    expect(hasId({id: undefined})).toBe(false);
  });

  test('should return false if model is no id property', () => {
    expect(hasId('')).toBe(false);
    expect(hasId('A')).toBe(false);
    expect(hasId(1)).toBe(false);
  });

  test('should return false if id is not a string', () => {
    expect(hasId({id: 1})).toBe(false);
  });

  test('should return false if id is an empty string', () => {
    expect(hasId({id: ''})).toBe(false);
  });

  test('should return true if id is defined', () => {
    expect(hasId({id: '1'})).toBe(true);
    expect(hasId({id: '0'})).toBe(true);
    expect(hasId({id: 'A'})).toBe(true);
  });
});
