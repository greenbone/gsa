/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import Model from 'gmp/model';
import Note from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import {testModel} from 'gmp/models/testing';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Note model tests', () => {
  testModel(Note, 'note', {testIsActive: false});

  test('should parse severity', () => {
    const note = Note.fromElement({severity: '8.5'});
    const note2 = Note.fromElement({severity: '10'});
    const note3 = Note.fromElement({});

    expect(note.severity).toEqual(8.5);
    expect(note2.severity).toEqual(10);
    expect(note3.severity).toBeUndefined();
  });

  test('should parse active as yes/no correctly', () => {
    const note1 = Note.fromElement({active: '0'});
    const note2 = Note.fromElement({active: '1'});

    expect(note1.active).toEqual(NO_VALUE);
    expect(note2.active).toEqual(YES_VALUE);
  });

  test('should parse hosts or return empty array', () => {
    const elem = {
      hosts: '123.456.789.42, 987.654.321.1',
    };
    const note1 = Note.fromElement(elem);
    const note2 = Note.fromElement({hosts: ''});

    expect(note1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(note2.hosts).toEqual([]);
  });

  test('should delete port if it is empty, pass it on otherwise', () => {
    const note1 = Note.fromElement({port: 'general/tcp'});
    const note2 = Note.fromElement({port: ''});

    expect(note1.port).toEqual('general/tcp');
    expect(note2.port).toBeUndefined();
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
    const note1 = Note.fromElement(elem1);
    const note2 = Note.fromElement(elem2);
    const note3 = Note.fromElement({});

    expect(note1.task).toBeInstanceOf(Model);
    expect(note1.task.id).toEqual('123abc');
    expect(note1.task.entityType).toEqual('task');
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
    const note1 = Note.fromElement(elem1);
    const note2 = Note.fromElement(elem2);
    const note3 = Note.fromElement({});

    expect(note1.result).toBeInstanceOf(Model);
    expect(note1.result.id).toEqual('123abc');
    expect(note1.result.entityType).toEqual('result');
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
    const note = Note.fromElement(elem);

    expect(note.nvt).toBeInstanceOf(Nvt);
    expect(note.name).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
