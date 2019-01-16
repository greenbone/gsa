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
import {renderSelectItems} from '../render.js';

describe('render_select_items test', () => {
  test('should convert entities list', () => {
    const entities = [
      {
        name: 'A Task',
        id: '1',
      },
      {
        name: 'B Task',
        id: '2',
      },
    ];

    const items = renderSelectItems(entities);

    expect(items.length).toBe(2);
    expect(items[0]).toEqual({label: 'A Task', value: '1'});
    expect(items[1]).toEqual({label: 'B Task', value: '2'});
  });

  test('should add default item', () => {
    const entities = [
      {
        name: 'A Task',
        id: '1',
      },
      {
        name: 'B Task',
        id: '2',
      },
    ];

    const items = renderSelectItems(entities, '3');

    expect(items.length).toBe(3);
    expect(items[0]).toEqual({label: '--', value: '3'});
    expect(items[1]).toEqual({label: 'A Task', value: '1'});
    expect(items[2]).toEqual({label: 'B Task', value: '2'});
  });

  test('should add default item with label', () => {
    const entities = [
      {
        name: 'A Task',
        id: '1',
      },
      {
        name: 'B Task',
        id: '2',
      },
    ];

    const items = renderSelectItems(entities, '3', '?');

    expect(items.length).toBe(3);
    expect(items[0]).toEqual({label: '?', value: '3'});
    expect(items[1]).toEqual({label: 'A Task', value: '1'});
    expect(items[2]).toEqual({label: 'B Task', value: '2'});
  });
});

// vim: set ts=2 sw=2 tw=80:
