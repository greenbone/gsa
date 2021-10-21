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

import Tag from 'gmp/models/tag';

import {testModel} from 'gmp/models/testing';

testModel(Tag, 'tag');

describe('Tag model tests', () => {
  test('should parse resources', () => {
    const elem = {
      resources: {
        type: 'foo',
        count: {
          total: '42',
        },
      },
    };
    const tag = Tag.fromElement(elem);

    expect(tag.resourceType).toEqual('foo');
    expect(tag.resourceCount).toEqual(42);
  });

  test('should return count of 0 and no type if no resources are given', () => {
    const tag = Tag.fromElement({});

    expect(tag.resourceType).toBeUndefined();
    expect(tag.resourceCount).toEqual(0);
  });

  test('should parse value to undefined, if no value is given', () => {
    const tag = Tag.fromElement({});

    expect(tag.value).toBeUndefined();
  });

  test('should parse value', () => {
    const tag = Tag.fromElement({value: 'foo'});

    expect(tag.value).toEqual('foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
