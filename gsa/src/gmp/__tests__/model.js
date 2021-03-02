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

import Model, {parseModelFromElement, parseModelFromObject} from 'gmp/model';
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

describe('parseModelFromObject tests', () => {
  test('should parse model', () => {
    const obj = {
      id: '1',
    };
    const model = parseModelFromObject(obj);

    expect(model.id).toEqual('1');
    expect(model).toBeInstanceOf(Model);
    expect(model.entityType).toEqual('unknown');
  });

  test('should parse model and set entity type', () => {
    const obj = {
      id: '1',
    };
    const model = parseModelFromObject(obj, 'foo');

    expect(model.id).toEqual('1');
    expect(model).toBeInstanceOf(Model);
    expect(model.entityType).toEqual('foo');
  });
});

describe('fromObject tests', () => {
  test('Should parse id', () => {
    const object = {id: 'foo'};
    const model = Model.fromObject(object);

    expect(model.id).toEqual('foo');
  });
  test('should parse permissions', () => {
    const object = {
      permissions: [{name: 'foo'}, {name: 'bar'}],
    };

    const model = Model.fromObject(object);

    expect(model.userCapabilities._has_caps).toEqual(true);
    expect(model.userCapabilities.length).toBe(2);
  });
  test('should parse comment', () => {
    const object = {
      comment: 'lorem ipsum',
    };
    const object2 = {};

    const model = Model.fromObject(object);
    const model2 = Model.fromObject(object2);

    expect(model.comment).toEqual('lorem ipsum');
    expect(model2.comment).toBeUndefined();
  });
  test('should parse tags', () => {
    const object = {
      userTags: {
        count: 1,
        tags: [
          {
            id: 'foo',
            name: 'bar:unnamed',
            value: 'yes',
            comment: 'YAS',
          },
        ],
      },
    };

    const object2 = {
      userTags: null,
    };

    const model = Model.fromObject(object);
    const model2 = Model.fromObject(object2);

    expect(model.userTags.length).toEqual(1);
    const [tag] = model.userTags;

    expect(tag).toBeInstanceOf(Model);

    expect(tag.id).toEqual('foo');
    expect(tag.name).toEqual('bar:unnamed');
    expect(tag.entityType).toEqual('tag');
    expect(tag.value).toEqual('yes');
    expect(tag.comment).toEqual('YAS');

    expect(model2.userTags).toEqual([]);
  });

  test('should parse predefined', () => {
    const obj = {
      predefined: true,
    };

    const obj2 = {
      predefined: false,
    };

    const model = Model.fromObject(obj);
    const model2 = Model.fromObject(obj2);

    expect(model.predefined).toEqual(true);
    expect(model2.predefined).toEqual(false);
  });
});

// vim: set ts=2 sw=2 tw=80:
