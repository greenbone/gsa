/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {getEntityIds} from '../selectiontype';

import Task from 'gmp/models/task';

describe('getEntityIds tests', () => {
  test('Should parse defined and undefined entity array', () => {
    const task1 = Task.fromObject({id: 'foo'});
    const task2 = Task.fromObject({id: 'bar'});
    const entityArray = [task1, task2];

    expect(getEntityIds(entityArray)).toEqual(['foo', 'bar']);
    expect(getEntityIds()).toEqual([]);
  });
});
