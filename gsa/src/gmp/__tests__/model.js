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

import Model, {parseModelFromElement} from 'gmp/model';
import {testModel} from 'gmp/models/testing';

describe('Model tests', () => {
  testModel(Model, 'unknown');
});

describe('parseModelFromElement tests', () => {
  test('should parse model', () => {
    const element = {
      _id: '1',
    };
    const model = parseModelFromElement(element);

    expect(model.id).toEqual('1');
    expect(model).toBeInstanceOf(Model);
    expect(model.entityType).toEqual('unknown');
  });

  test('should parse model and set entity type', () => {
    const element = {
      _id: '1',
    };
    const model = parseModelFromElement(element, 'foo');

    expect(model.id).toEqual('1');
    expect(model).toBeInstanceOf(Model);
    expect(model.entityType).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
