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
import Nvt from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {testModel} from 'gmp/models/testing';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

testModel(Override, 'override');

describe('Note model tests', () => {
  test('should parse severity', () => {
    const override1 = new Override({severity: '8.5'});
    const override2 = new Override({severity: '10'});
    const override3 = new Override({});

    expect(override1.severity).toEqual(8.5);
    expect(override2.severity).toEqual(10);
    expect(override3.severity).toBeUndefined();
  });

  test('should parse new_severity', () => {
    const override1 = new Override({new_severity: '8.5'});
    const override2 = new Override({new_severity: '10'});
    const override3 = new Override({});

    expect(override1.new_severity).toEqual(8.5);
    expect(override2.new_severity).toEqual(10);
    expect(override3.new_severity).toBeUndefined();
  });

  test('should parse active as yes/no correctly', () => {
    const override1 = new Override({active: '0'});
    const override2 = new Override({active: '1'});

    expect(override1.active).toEqual(NO_VALUE);
    expect(override2.active).toEqual(YES_VALUE);
  });

  test('should parse text_excerpt as yes/no correctly', () => {
    const override1 = new Override({text_excerpt: '0'});
    const override2 = new Override({text_excerpt: '1'});

    expect(override1.text_excerpt).toEqual(NO_VALUE);
    expect(override2.text_excerpt).toEqual(YES_VALUE);
  });

  test('should parse hosts or return empty array', () => {
    const elem = {
      hosts: '123.456.789.42, 987.654.321.1',
    };
    const override1 = new Override(elem);
    const override2 = new Override({hosts: ''});

    expect(override1.hosts).toEqual(['123.456.789.42', '987.654.321.1']);
    expect(override2.hosts).toEqual([]);
  });

  test('isExcerpt() should return correct true/false', () => {
    const override1 = new Override({text_excerpt: '1'});
    const override2 = new Override({text_excerpt: '0'});

    expect(override1.isExcerpt()).toEqual(true);
    expect(override2.isExcerpt()).toEqual(false);
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
    const override1 = new Override(elem1);
    const override2 = new Override(elem2);
    const override3 = new Override({});

    expect(override1.task).toBeInstanceOf(Model);
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
    const override1 = new Override(elem1);
    const override2 = new Override(elem2);
    const override3 = new Override({});

    expect(override1.result).toBeInstanceOf(Model);
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
    const override = new Override(elem);

    expect(override.nvt).toBeInstanceOf(Nvt);
    expect(override.name).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
