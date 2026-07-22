/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Nvt from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Override model tests', () => {
  testModel(Override, 'override', {testIsActive: false});

  test('should use defaults', () => {
    const override = new Override({id: 'test-id'});
    expect(override.id).toEqual('test-id');
    expect(override.hosts).toEqual([]);
    expect(override.newSeverity).toBeUndefined();
    expect(override.nvt).toBeUndefined();
    expect(override.port).toBeUndefined();
    expect(override.result).toBeUndefined();
    expect(override.severity).toBeUndefined();
    expect(override.task).toBeUndefined();
    expect(override.text).toBeUndefined();
    expect(override.textExcerpt).toBeUndefined();
  });

  test('should parse empty element', () => {
    const override = Override.fromElement({_id: 'test-id'});
    expect(override.id).toEqual('test-id');
    expect(override.hosts).toEqual([]);
    expect(override.newSeverity).toBeUndefined();
    expect(override.nvt).toBeUndefined();
    expect(override.port).toBeUndefined();
    expect(override.result).toBeUndefined();
    expect(override.severity).toBeUndefined();
    expect(override.task).toBeUndefined();
    expect(override.text).toBeUndefined();
    expect(override.textExcerpt).toBeUndefined();
  });

  test('should parse severity', () => {
    const override1 = Override.fromElement({_id: 'test-id', severity: 8.5});
    const override2 = Override.fromElement({_id: 'test-id', severity: 10});
    expect(override1.severity).toEqual(8.5);
    expect(override2.severity).toEqual(10);
  });

  test('should parse new severity', () => {
    const override1 = Override.fromElement({_id: 'test-id', new_severity: 8.5});
    const override2 = Override.fromElement({_id: 'test-id', new_severity: 10});
    expect(override1.newSeverity).toEqual(8.5);
    expect(override2.newSeverity).toEqual(10);
  });

  test('should parse text', () => {
    const override1 = Override.fromElement({_id: 'test-id', text: 'foo bar'});
    const override2 = Override.fromElement({_id: 'test-id', text: ''});
    expect(override1.text).toEqual('foo bar');
    expect(override2.text).toBeUndefined();
  });

  test('should parse text excerpt', () => {
    const override1 = Override.fromElement({_id: 'test-id', text_excerpt: 0});
    const override2 = Override.fromElement({_id: 'test-id', text_excerpt: 1});
    expect(override1.textExcerpt).toEqual(NO_VALUE);
    expect(override2.textExcerpt).toEqual(YES_VALUE);
  });

  test('should parse hosts', () => {
    const override1 = Override.fromElement({
      _id: 'test-id',
      hosts: '123.456.789.42, 987.654.321.1',
    });
    const override2 = Override.fromElement({_id: 'test-id', hosts: ''});
    expect(override1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(override2.hosts).toEqual([]);
  });

  test('should parse port', () => {
    const override1 = Override.fromElement({_id: 'test-id', port: '1234'});
    const override2 = Override.fromElement({_id: 'test-id', port: ''});
    expect(override1.port).toEqual('1234');
    expect(override2.port).toBeUndefined();
  });

  test('should parse task', () => {
    const override1 = Override.fromElement({
      _id: 'test-id',
      task: {
        _id: '123abc',
      },
    });
    const override2 = Override.fromElement({
      _id: 'test-id',
      task: {
        _id: '',
      },
    });
    expect(override1.task?.id).toEqual('123abc');
    expect(override1.task?.entityType).toEqual('task');
    expect(override2.task).toBeUndefined();
  });

  test('should parse result', () => {
    const override1 = Override.fromElement({
      _id: 'test-id',
      result: {
        _id: '123abc',
      },
    });
    const override2 = Override.fromElement({
      _id: 'test-id',
      result: {
        _id: '',
      },
    });

    expect(override1.result?.id).toEqual('123abc');
    expect(override1.result?.entityType).toEqual('result');
    expect(override2.result).toBeUndefined();
  });

  test('should parse NVT', () => {
    const override = Override.fromElement({
      _id: 'test-id',
      nvt: {
        _oid: '1.2.3',
        name: 'foo',
      },
    });
    expect(override.nvt).toBeInstanceOf(Nvt);
    expect(override.nvt?.oid).toEqual('1.2.3');
    expect(override.name).toEqual('foo');
  });

  test('should provide isExcerpt()', () => {
    const override1 = new Override({id: 'test-id', textExcerpt: 1});
    const override2 = new Override({id: 'test-id', textExcerpt: 0});
    expect(override1.isExcerpt()).toEqual(true);
    expect(override2.isExcerpt()).toEqual(false);
  });
});
