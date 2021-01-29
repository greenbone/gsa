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
import Nvt from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {testModel} from 'gmp/models/testing';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

describe('Note model tests', () => {
  testModel(Override, 'override', {testIsActive: false});

  test('should parse severity', () => {
    const override1 = Override.fromElement({severity: '8.5'});
    const override2 = Override.fromElement({severity: '10'});
    const override3 = Override.fromElement({});

    expect(override1.severity).toEqual(8.5);
    expect(override2.severity).toEqual(10);
    expect(override3.severity).toBeUndefined();
  });

  test('should parse new_severity', () => {
    const override1 = Override.fromElement({new_severity: '8.5'});
    const override2 = Override.fromElement({new_severity: '10'});
    const override3 = Override.fromElement({});

    expect(override1.newSeverity).toEqual(8.5);
    expect(override2.newSeverity).toEqual(10);
    expect(override3.newSeverity).toBeUndefined();
  });

  test('should parse active as yes/no correctly', () => {
    const override1 = Override.fromElement({active: '0'});
    const override2 = Override.fromElement({active: '1'});

    expect(override1.active).toEqual(NO_VALUE);
    expect(override2.active).toEqual(YES_VALUE);
  });

  test('should parse hosts or return empty array', () => {
    const elem = {
      hosts: '123.456.789.42, 987.654.321.1',
    };
    const override1 = Override.fromElement(elem);
    const override2 = Override.fromElement({hosts: ''});

    expect(override1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(override2.hosts).toEqual([]);
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
    const override1 = Override.fromElement(elem1);
    const override2 = Override.fromElement(elem2);
    const override3 = Override.fromElement({});

    expect(override1.task).toBeInstanceOf(Model);
    expect(override1.task.id).toEqual('123abc');
    expect(override1.task.entityType).toEqual('task');
    expect(override2.task).toBeUndefined();
    expect(override3.task).toBeUndefined();
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
    const override1 = Override.fromElement(elem1);
    const override2 = Override.fromElement(elem2);
    const override3 = Override.fromElement({});

    expect(override1.result).toBeInstanceOf(Model);
    expect(override1.result.id).toEqual('123abc');
    expect(override1.result.entityType).toEqual('result');
    expect(override2.result).toBeUndefined();
    expect(override3.result).toBeUndefined();
  });

  test('should parse NVTs', () => {
    const elem = {
      nvt: {
        _id: '123abc',
        name: 'foo',
      },
    };
    const override = Override.fromElement(elem);

    expect(override.nvt).toBeInstanceOf(Nvt);
    expect(override.name).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
