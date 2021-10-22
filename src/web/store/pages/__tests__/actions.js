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
