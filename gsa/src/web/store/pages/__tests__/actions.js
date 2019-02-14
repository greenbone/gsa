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
import {pageFilter, CHANGE_PAGE_FILTER} from '../actions';

describe('page actions tests', () => {
  describe('changeFilter action tests', () => {
    test('should create a page filter action for a page', () => {
      const action = pageFilter('foo', 'name~bar');

      expect(action).toEqual({
        type: CHANGE_PAGE_FILTER,
        page: 'foo',
        filter: 'name~bar',
      });
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
