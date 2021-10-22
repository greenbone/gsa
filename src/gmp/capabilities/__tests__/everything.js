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
import EverythingCapabilities from '../everything';

describe('EverythingCapabilities tests', () => {
  test('should allow everything', () => {
    const caps = new EverythingCapabilities();

    expect(caps.mayOp('foo')).toEqual(true);
    expect(caps.mayAccess('foo')).toEqual(true);
    expect(caps.mayClone('foo')).toEqual(true);
    expect(caps.mayCreate('foo')).toEqual(true);
    expect(caps.mayDelete('foo')).toEqual(true);
    expect(caps.mayEdit('foo')).toEqual(true);
  });

  test('should have everything', () => {
    const caps = new EverythingCapabilities();

    expect(caps.length).toEqual(1);
    expect(caps.areDefined()).toEqual(true);
    expect(caps.has('everything')).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
