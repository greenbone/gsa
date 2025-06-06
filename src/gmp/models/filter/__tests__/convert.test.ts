/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import convert from 'gmp/models/filter/convert';

describe('convert tests', () => {
  test('should convert apply_overrides keyword', () => {
    expect(convert('apply_overrides', '1', '=')).toEqual({
      keyword: 'apply_overrides',
      relation: '=',
      value: 1,
    });
    expect(convert('apply_overrides', '0', '=')).toEqual({
      keyword: 'apply_overrides',
      relation: '=',
      value: 0,
    });
    expect(convert('apply_overrides', '99', '=')).toEqual({
      keyword: 'apply_overrides',
      relation: '=',
      value: 1,
    });
  });

  test('should convert first keyword', () => {
    expect(convert('first', '1', '=')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 1,
    });
    expect(convert('first', '0', '=')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 1,
    });
    expect(convert('first', '666', '=')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 666,
    });
    expect(convert('first', '-1', '=')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 1,
    });
    expect(convert('first', '-9999999', '=')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 1,
    });
    expect(convert('first', '1', '>')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 1,
    });
    expect(convert('first', '1', 'foo')).toEqual({
      keyword: 'first',
      relation: '=',
      value: 1,
    });
  });

  test('should convert min_qod keyword', () => {
    expect(convert('min_qod', '1', '=')).toEqual({
      keyword: 'min_qod',
      relation: '=',
      value: 1,
    });
    expect(convert('min_qod', '0', '=')).toEqual({
      keyword: 'min_qod',
      relation: '=',
      value: 0,
    });
    expect(convert('min_qod', '99', '=')).toEqual({
      keyword: 'min_qod',
      relation: '=',
      value: 99,
    });
  });

  test('should convert rows keyword', () => {
    expect(convert('rows', '1', '=')).toEqual({
      keyword: 'rows',
      relation: '=',
      value: 1,
    });
    expect(convert('rows', '0', '=')).toEqual({
      keyword: 'rows',
      relation: '=',
      value: 0,
    });
    expect(convert('rows', '99', '=')).toEqual({
      keyword: 'rows',
      relation: '=',
      value: 99,
    });
    expect(convert('rows', '-1', '=')).toEqual({
      keyword: 'rows',
      relation: '=',
      value: -1,
    });
    expect(convert('rows', '1', '>')).toEqual({
      keyword: 'rows',
      relation: '=',
      value: 1,
    });
    expect(convert('rows', '1', 'foo')).toEqual({
      keyword: 'rows',
      relation: '=',
      value: 1,
    });
  });

  test('should convert notes keyword', () => {
    expect(convert('notes', '1', '=')).toEqual({
      keyword: 'notes',
      relation: '=',
      value: 1,
    });
    expect(convert('notes', '0', '=')).toEqual({
      keyword: 'notes',
      relation: '=',
      value: 0,
    });
    expect(convert('notes', '99', '=')).toEqual({
      keyword: 'notes',
      relation: '=',
      value: 1,
    });
  });

  test('should convert overrides keyword', () => {
    expect(convert('overrides', '1', '=')).toEqual({
      keyword: 'overrides',
      relation: '=',
      value: 1,
    });
    expect(convert('overrides', '0', '=')).toEqual({
      keyword: 'overrides',
      relation: '=',
      value: 0,
    });
    expect(convert('overrides', '99', '=')).toEqual({
      keyword: 'overrides',
      relation: '=',
      value: 1,
    });
  });

  test('should convert result_hosts_only keyword', () => {
    expect(convert('result_hosts_only', '1', '=')).toEqual({
      keyword: 'result_hosts_only',
      relation: '=',
      value: 1,
    });
    expect(convert('result_hosts_only', '0', '=')).toEqual({
      keyword: 'result_hosts_only',
      relation: '=',
      value: 0,
    });
    expect(convert('result_hosts_only', '99', '=')).toEqual({
      keyword: 'result_hosts_only',
      relation: '=',
      value: 1,
    });
  });

  test('should convert empty keyword', () => {
    expect(convert('', 'foo', '=')).toEqual({
      relation: '=',
      value: 'foo',
    });
    expect(convert(undefined, 'foo', '=')).toEqual({
      relation: '=',
      value: 'foo',
    });
  });

  test('should convert and value', () => {
    expect(convert(undefined, 'and', undefined)).toEqual({
      value: 'and',
    });
    expect(convert('', 'and', '')).toEqual({
      value: 'and',
    });
    expect(convert('foo', 'and', '=')).toEqual({
      value: 'and',
    });
  });

  test('should convert or value', () => {
    expect(convert(undefined, 'or', undefined)).toEqual({
      value: 'or',
    });
    expect(convert('', 'or', '')).toEqual({
      value: 'or',
    });
    expect(convert('foo', 'or', '=')).toEqual({
      value: 'or',
    });
  });

  test('should convert not value', () => {
    expect(convert(undefined, 'not', undefined)).toEqual({
      value: 'not',
    });
    expect(convert('', 'not', '')).toEqual({
      value: 'not',
    });
    expect(convert('foo', 'not', '=')).toEqual({
      value: 'not',
    });
  });

  test('should convert empty string value', () => {
    expect(convert('foo', '', '=')).toEqual({
      keyword: 'foo',
      value: '',
    });
  });

  test('should convert re value', () => {
    expect(convert('foo', 're', '=')).toEqual({
      keyword: 'foo',
      value: 're',
    });
  });

  test('should convert regexp value', () => {
    expect(convert('foo', 'regexp', '=')).toEqual({
      keyword: 'foo',
      value: 'regexp',
    });
  });

  test('should return correct value and relation when keyword is a number or number string', () => {
    expect(convert('123', '456', '=')).toEqual({
      value: '"123=456"',
      relation: '~',
    });
  });

  test('should return correct value and relation when keyword is a number', () => {
    expect(convert('123', 456, ':')).toEqual({
      value: '"123:456"',

      relation: '~',
    });
  });

  test('should convert with undefined value and relation', () => {
    expect(convert('foo', undefined, undefined)).toEqual({
      keyword: 'foo',
      value: undefined,
      relation: undefined,
    });
  });
});
