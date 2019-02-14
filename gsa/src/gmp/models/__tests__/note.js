/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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

import Model from 'gmp/model';
import Note from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import {testModel} from 'gmp/models/testing';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

testModel(Note, 'note');

describe('Note model tests', () => {
  test('should parse severity', () => {
    const note = new Note({severity: '8.5'});
    const note2 = new Note({severity: '10'});
    const note3 = new Note({});

    expect(note.severity).toEqual(8.5);
    expect(note2.severity).toEqual(10);
    expect(note3.severity).toBeUndefined();
  });

  test('should parse active as yes/no correctly', () => {
    const note1 = new Note({active: '0'});
    const note2 = new Note({active: '1'});

    expect(note1.active).toEqual(NO_VALUE);
    expect(note2.active).toEqual(YES_VALUE);
  });

  test('should parse text_excerpt as yes/no correctly', () => {
    const note1 = new Note({text_excerpt: '0'});
    const note2 = new Note({text_excerpt: '1'});

    expect(note1.text_excerpt).toEqual(NO_VALUE);
    expect(note2.text_excerpt).toEqual(YES_VALUE);
  });

  test('should parse hosts or return empty array', () => {
    const elem = {
      hosts: '123.456.789.42, 987.654.321.1',
    };
    const note1 = new Note(elem);
    const note2 = new Note({hosts: ''});

    expect(note1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(note2.hosts).toEqual([]);
  });

  test('should delete port if it is empty, pass it on otherwise', () => {
    const note1 = new Note({port: 'general/tcp'});
    const note2 = new Note({port: ''});

    expect(note1.port).toEqual('general/tcp');
    expect(note2.port).toBeUndefined();
  });

  test('isExcerpt() should return correct true/false', () => {
    const note1 = new Note({text_excerpt: '1'});
    const note2 = new Note({text_excerpt: '0'});

    expect(note1.isExcerpt()).toEqual(true);
    expect(note2.isExcerpt()).toEqual(false);
  });

  test('should return task if it is a model element', () => {
    const elem1 = {
      task: {
        _id: '123abc',
      },
    };
    const elem2 = {
      task: {
        _id: '',
      },
    };
    const note1 = new Note(elem1);
    const note2 = new Note(elem2);
    const note3 = new Note({});

    expect(note1.task).toBeInstanceOf(Model);
    expect(note2.task).toBeUndefined();
    expect(note3.task).toBeUndefined();
  });

  test('should return result if it is a model element', () => {
    const elem1 = {
      result: {
        _id: '123abc',
      },
    };
    const elem2 = {
      result: {
        _id: '',
      },
    };
    const note1 = new Note(elem1);
    const note2 = new Note(elem2);
    const note3 = new Note({});

    expect(note1.result).toBeInstanceOf(Model);
    expect(note2.result).toBeUndefined();
    expect(note3.result).toBeUndefined();
  });

  test('should parse NVTs', () => {
    const elem = {
      nvt: {
        _id: '123abc',
        name: 'foo',
      },
    };
    const note = new Note(elem);

    expect(note.nvt).toBeInstanceOf(Nvt);
    expect(note.name).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
