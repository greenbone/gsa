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
import getPage from 'web/store/pages/selectors';

describe('pages selectors tests', () => {
  test('should not crash for undefined state', () => {
    const selector = getPage();

    expect(selector.getFilter('foo')).toBeUndefined();
  });

  test('should not crash for empty state', () => {
    const selector = getPage({});

    expect(selector.getFilter('foo')).toBeUndefined();
  });

  test('should return undefined filter', () => {
    const selector = getPage({
      pages: {
        foo: {},
      },
    });

    expect(selector.getFilter('foo')).toBeUndefined();
  });

  test('should return valid filter', () => {
    const selector = getPage({
      pages: {
        foo: {
          filter: 'name=foo',
        },
      },
    });

    expect(selector.getFilter('foo')).toEqual('name=foo');
  });
});

// vim: set ts=2 sw=2 tw=80:
