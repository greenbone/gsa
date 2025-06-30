/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Nvt from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Note model tests', () => {
  testModel(Override, 'override', {testIsActive: false});

  test('should use defaults', () => {
    const override = new Override();
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
    const override = Override.fromElement();
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
    const override1 = Override.fromElement({severity: 8.5});
    const override2 = Override.fromElement({severity: 10});
    expect(override1.severity).toEqual(8.5);
    expect(override2.severity).toEqual(10);
  });

  test('should parse new severity', () => {
    const override1 = Override.fromElement({new_severity: 8.5});
    const override2 = Override.fromElement({new_severity: 10});
    expect(override1.newSeverity).toEqual(8.5);
    expect(override2.newSeverity).toEqual(10);
  });

  test('should parse text', () => {
    const override1 = Override.fromElement({text: 'foo bar'});
    const override2 = Override.fromElement({text: ''});
    expect(override1.text).toEqual('foo bar');
    expect(override2.text).toEqual('');
  });

  test('should parse text excerpt', () => {
    const override1 = Override.fromElement({text_excerpt: 0});
    const override2 = Override.fromElement({text_excerpt: 1});
    expect(override1.textExcerpt).toEqual(NO_VALUE);
    expect(override2.textExcerpt).toEqual(YES_VALUE);
  });

  test('should parse hosts', () => {
    const override1 = Override.fromElement({
      hosts: '123.456.789.42, 987.654.321.1',
    });
    const override2 = Override.fromElement({hosts: ''});
    expect(override1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(override2.hosts).toEqual([]);
  });

  test('should parse port', () => {
    const override1 = Override.fromElement({port: '1234'});
    const override2 = Override.fromElement({port: ''});
    expect(override1.port).toEqual('1234');
    expect(override2.port).toBeUndefined();
  });

  test('should parse task', () => {
    const override1 = Override.fromElement({
      task: {
        _id: '123abc',
      },
    });
    const override2 = Override.fromElement({
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
      result: {
        _id: '123abc',
      },
    });
    const override2 = Override.fromElement({
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
      nvt: {
        _id: '123abc',
        name: 'foo',
      },
    });
    expect(override.nvt).toBeInstanceOf(Nvt);
    expect(override.name).toEqual('foo');
  });

  test('should provide isExcerpt()', () => {
    const override1 = new Override({textExcerpt: 1});
    const override2 = new Override({textExcerpt: 0});
    expect(override1.isExcerpt()).toEqual(true);
    expect(override2.isExcerpt()).toEqual(false);
  });
});
