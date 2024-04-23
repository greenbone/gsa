/* Copyright (C) 2023 Greenbone AG
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

import {describe, test, expect} from '@gsa/testing';

import {ResourceName} from '../resourcename';

describe('ResourceName tests', () => {
  test('should init ResourceName data via constructor', () => {
    const resourceName = new ResourceName({
      id: '19c091f0-a687-4dc3-b482-7d191ead4bb3',
      name: 'Foo',
      type: 'task',
    });

    expect(resourceName.id).toEqual('19c091f0-a687-4dc3-b482-7d191ead4bb3');
    expect(resourceName.name).toEqual('Foo');
    expect(resourceName.type).toEqual('task');
  });

  test('should parse ResourceName data from element', () => {
    const resourceName = ResourceName.fromElement(
      {
        _id: '19c091f0-a687-4dc3-b482-7d191ead4bba',
        name: 'Bar',
      },
      'report',
    );

    expect(resourceName.id).toEqual('19c091f0-a687-4dc3-b482-7d191ead4bba');
    expect(resourceName.name).toEqual('Bar');
    expect(resourceName.type).toEqual('report');
  });

  test('should parse empty name and id', () => {
    const resourceName = ResourceName.fromElement({}, 'report');

    expect(resourceName.id).toEqual('');
    expect(resourceName.name).toEqual('');
    expect(resourceName.type).toEqual('report');
  });
});
