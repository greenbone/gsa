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
import Override from 'gmp/models/override';
import Result, {Delta} from 'gmp/models/result';
import {testModel} from 'gmp/models/testing';

testModel(Result, 'result');

describe('Result model tests', () => {
  test('should parse host object', () => {
    const elem = {
      host: {
        __text: 'foo',
        asset: {
          _asset_id: '123',
        },
        hostname: 'bar',
      },
    };
    const elem2 = {
      host: {
        __text: 'foo',
      },
    };
    const result = Result.fromElement(elem);
    const result2 = Result.fromElement(elem2);
    const res = {
      name: 'foo',
      id: '123',
      hostname: 'bar',
    };
    const res2 = {
      name: 'foo',
      hostname: '',
    };
    expect(result.host).toEqual(res);
    expect(result2.host).toEqual(res2);
  });

  test('should parse host string', () => {
    const result = Result.fromElement({host: 'foo'});
    const res = {
      name: 'foo',
      hostname: '',
    };

    expect(result.host).toEqual(res);
  });

  test('should remove empty host id', () => {
    const host = {
      _asset_id: '',
      __text: 'foo',
      hostname: 'bar',
    };
    const result = Result.fromElement({host});

    expect(result.host).toEqual({
      name: 'foo',
      hostname: 'bar',
    });
  });

  test('should parse NVTs', () => {
    const elem = {
      nvt: {
        _oid: 'bar',
      },
    };
    const result = Result.fromElement(elem);

    expect(result.nvt).toBeInstanceOf(Nvt);
    expect(result.nvt.oid).toEqual('bar');
  });

  test('should parse severity', () => {
    const result = Result.fromElement({severity: '4.2'});
    const result2 = Result.fromElement({});

    expect(result.severity).toEqual(4.2);
    expect(result2.severity).toBeUndefined();
  });

  test('should parse name/oid to vulnerability', () => {
    const elem = {
      nvt: {
        _oid: '42',
      },
    };
    const result = Result.fromElement({name: 'foo'});
    const result2 = Result.fromElement(elem);

    expect(result.vulnerability).toEqual('foo');
    expect(result2.vulnerability).toEqual('42');
  });

  test('should parse report', () => {
    const result = Result.fromElement({report: 'foo'});

    expect(result.report).toBeInstanceOf(Model);
    expect(result.report.entityType).toEqual('report');
  });

  test('should parse task', () => {
    const result = Result.fromElement({task: 'foo'});

    expect(result.task).toBeInstanceOf(Model);
    expect(result.task.entityType).toEqual('task');
  });

  test('should parse detection', () => {
    const elem = {
      detection: {
        result: {
          _id: '1337',
          details: {
            detail: [
              {
                name: 'foo',
                value: 'bar',
              },
              {
                name: 'lorem',
                value: 'ipsum',
              },
            ],
          },
        },
      },
    };
    const res = {
      result: {
        id: '1337',
        details: {
          foo: 'bar',
          lorem: 'ipsum',
        },
      },
    };
    const result = Result.fromElement(elem);

    expect(result.detection).toEqual(res);
  });

  test('should parse delta string', () => {
    const result = Result.fromElement({delta: 'foo'});

    expect(result.delta).toBeInstanceOf(Delta);
    expect(result.delta).toEqual({delta_type: 'foo'});
  });

  test('should parse delta object', () => {
    const elem = {
      delta: {
        __text: 'foo',
      },
    };
    const result = Result.fromElement(elem);

    expect(result.delta).toBeInstanceOf(Delta);
    expect(result.delta.delta_type).toEqual('foo');
  });

  test('should parse changed delta object', () => {
    const elem = {
      delta: {
        __text: Delta.TYPE_CHANGED,
        diff: 'some foobar diff',
        result: {
          _id: 'r1',
          description: 'some result description',
        },
      },
    };
    const result = Result.fromElement(elem);

    expect(result.delta).toBeInstanceOf(Delta);
    expect(result.delta.delta_type).toEqual(Delta.TYPE_CHANGED);
    expect(result.delta.diff).toEqual('some foobar diff');
    expect(result.delta.result).toBeInstanceOf(Model);
    expect(result.delta.result.description).toEqual('some result description');
  });

  test('should parse original severity', () => {
    const result = Result.fromElement({original_severity: '4.2'});

    expect(result.original_severity).toEqual(4.2);
  });

  test('should parse QoD', () => {
    const elem = {
      qod: {
        type: 'foo',
        value: '42.5',
      },
    };
    const res = {
      type: 'foo',
      value: 42.5,
    };
    const result = Result.fromElement(elem);

    expect(result.qod).toEqual(res);
  });

  test('should parse notes', () => {
    const elem = {
      notes: {
        note: ['foo', 'bar'],
      },
    };
    const result = Result.fromElement(elem);

    expect(result.notes[0]).toBeInstanceOf(Note);
    expect(result.notes[0].entityType).toEqual('note');
    expect(result.notes[1]).toBeInstanceOf(Note);
    expect(result.notes[1].entityType).toEqual('note');
  });

  test('should return empty array if no notes are given', () => {
    const result = Result.fromElement({});

    expect(result.notes).toEqual([]);
  });

  test('should parse overrides', () => {
    const elem = {
      overrides: {
        override: ['foo', 'bar'],
      },
    };
    const result = Result.fromElement(elem);

    expect(result.overrides[0]).toBeInstanceOf(Override);
    expect(result.overrides[0].entityType).toEqual('override');
    expect(result.overrides[1]).toBeInstanceOf(Override);
    expect(result.overrides[1].entityType).toEqual('override');
  });

  test('should return empty array if no overrides are given', () => {
    const result = Result.fromElement({});

    expect(result.overrides).toEqual([]);
  });

  test('hasDelta() should return correct true/false', () => {
    const result = Result.fromElement({delta: 'defined'});
    const result2 = Result.fromElement({});

    expect(result.hasDelta()).toEqual(true);
    expect(result2.hasDelta()).toEqual(false);
  });
});

// vim: set ts=2 sw=2 tw=80:
