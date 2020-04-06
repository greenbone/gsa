/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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
import {shouldUpdate} from '../update';

describe('shouldUpdate tests', () => {
  test('should update if data identity has changed', () => {
    expect(shouldUpdate({data: {}}, {data: {}})).toEqual(true);
  });

  test('should update if width has changed', () => {
    expect(shouldUpdate({width: 100}, {width: 200})).toEqual(true);
  });

  test('should update if height has changed', () => {
    expect(shouldUpdate({height: 100}, {height: 200})).toEqual(true);
  });

  test('should update if showLegend has changed', () => {
    expect(shouldUpdate({showLegend: false}, {showLegend: true})).toEqual(true);
  });

  test('should not update if data identity has not changed', () => {
    const data = {foo: 1};
    expect(shouldUpdate({data}, {data})).toEqual(false);
  });

  test('should not update if width has not changed', () => {
    expect(shouldUpdate({width: 100}, {width: 100})).toEqual(false);
  });

  test('should not update if height has not changed', () => {
    expect(shouldUpdate({height: 100}, {height: 100})).toEqual(false);
  });

  test('should not update if showLegend has not changed', () => {
    expect(shouldUpdate({showLegend: true}, {showLegend: true})).toEqual(false);
  });

  test('should not update if unknown prop has changed', () => {
    expect(shouldUpdate({foo: false}, {foo: true})).toEqual(false);
  });
});
