/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import Note from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Note model tests', () => {
  testModel(Note, 'note', {testIsActive: false});

  test('should use defaults', () => {
    const note = new Note();
    expect(note.hosts).toEqual([]);
    expect(note.nvt).toBeUndefined();
    expect(note.port).toBeUndefined();
    expect(note.result).toBeUndefined();
    expect(note.severity).toBeUndefined();
    expect(note.task).toBeUndefined();
    expect(note.text).toBeUndefined();
    expect(note.textExcerpt).toBeUndefined();
  });

  test('should parse empty element', () => {
    const note = Note.fromElement();
    expect(note.hosts).toEqual([]);
    expect(note.nvt).toBeUndefined();
    expect(note.port).toBeUndefined();
    expect(note.result).toBeUndefined();
    expect(note.severity).toBeUndefined();
    expect(note.task).toBeUndefined();
    expect(note.text).toBeUndefined();
    expect(note.textExcerpt).toBeUndefined();
  });

  test('should parse severity', () => {
    const note = Note.fromElement({severity: 8.5});
    const note2 = Note.fromElement({severity: 10});

    expect(note.severity).toEqual(8.5);
    expect(note2.severity).toEqual(10);
  });

  test('should parse active', () => {
    const note1 = Note.fromElement({active: 0});
    const note2 = Note.fromElement({active: 1});

    expect(note1.active).toEqual(NO_VALUE);
    expect(note2.active).toEqual(YES_VALUE);
  });

  test('should parse text excerpt', () => {
    const note1 = Note.fromElement({text_excerpt: '0'});
    const note2 = Note.fromElement({text_excerpt: '1'});

    expect(note1.textExcerpt).toEqual(NO_VALUE);
    expect(note2.textExcerpt).toEqual(YES_VALUE);
  });

  test('should parse hosts', () => {
    const note1 = Note.fromElement({
      hosts: '123.456.789.42, 987.654.321.1',
    });
    const note2 = Note.fromElement({hosts: ''});

    expect(note1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(note2.hosts).toEqual([]);
  });

  test('should parse port', () => {
    const note1 = Note.fromElement({port: 'general/tcp'});
    const note2 = Note.fromElement({port: ''});

    expect(note1.port).toEqual('general/tcp');
    expect(note2.port).toBeUndefined();
  });

  test('should parse task', () => {
    const note1 = Note.fromElement({
      task: {
        _id: '123abc',
      },
    });
    const note2 = Note.fromElement({
      task: {
        _id: '',
      },
    });
    const note3 = Note.fromElement({});

    expect(note1.task?.id).toEqual('123abc');
    expect(note1.task?.entityType).toEqual('task');
    expect(note2.task).toBeUndefined();
    expect(note3.task).toBeUndefined();
  });

  test('should parse result', () => {
    const note1 = Note.fromElement({
      result: {
        _id: '123abc',
      },
    });
    const note2 = Note.fromElement({
      result: {
        _id: '',
      },
    });

    expect(note1.result).toBeInstanceOf(Model);
    expect(note1.result?.id).toEqual('123abc');
    expect(note1.result?.entityType).toEqual('result');
    expect(note2.result).toBeUndefined();
  });

  test('should parse NVT', () => {
    const note = Note.fromElement({
      nvt: {
        _oid: '1.2.3',
        name: 'foo',
      },
    });

    expect(note.nvt).toBeInstanceOf(Nvt);
    expect(note.nvt?.oid).toEqual('1.2.3');
    expect(note.name).toEqual('foo');
  });
});

describe('Note model methods tests', () => {
  test('isExcerpt() should return correct true/false', () => {
    const note1 = Note.fromElement({text_excerpt: '1'});
    const note2 = Note.fromElement({text_excerpt: '0'});

    expect(note1.isExcerpt()).toEqual(true);
    expect(note2.isExcerpt()).toEqual(false);
  });
});
