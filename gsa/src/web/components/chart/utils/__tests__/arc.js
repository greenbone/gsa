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
import arc from '../arc';

describe('arc class tests', () => {
  test('should throw if no outerRadiusX is set', () => {
    const a = arc();
    expect(() => a.centroid()).toThrow();

    expect(() => a.path()).toThrow();
  });

  test('should calculate central position', () => {
    const c = arc().outerRadiusX(100).centroid();

    expect(c.x).toEqual(-50);
    expect(c.y).toBeCloseTo(0); // it can't be zero due to floating point numbers
  });

  test('should match paths for full circle', () => {
    const a = arc().outerRadiusX(100);

    let path = a.path().toString();
    expect(path).toMatchSnapshot();

    a.innerRadiusX(50);
    path = a.path().toString();
    expect(path).toMatchSnapshot();

    a.outerRadiusY(120);
    path = a.path().toString();
    expect(path).toMatchSnapshot();

    a.innerRadiusY(120);
    path = a.path().toString();
    expect(path).toMatchSnapshot();
  });

  test('should match paths for arc', () => {
    const a = arc().outerRadiusX(100);
    const tarc = {startAngle: 1, endAngle: 2.5};

    let path = a.path(tarc).toString();
    expect(path).toMatchSnapshot();

    a.innerRadiusX(50);
    path = a.path(tarc).toString();
    expect(path).toMatchSnapshot();

    a.outerRadiusY(120);
    path = a.path(tarc).toString();
    expect(path).toMatchSnapshot();

    a.innerRadiusY(120);
    path = a.path(tarc).toString();
    expect(path).toMatchSnapshot();
  });

  test('should draw empty path for no angle', () => {
    const a = arc().outerRadiusX(100);
    const tarc = {startAngle: 1, endAngle: 1};

    let path = a.path(tarc).toString();
    expect(path).toEqual('M 0 0');

    a.innerRadiusX(50);
    path = a.path(tarc).toString();
    expect(path).toEqual('M 0 0');

    a.outerRadiusY(120);
    path = a.path(tarc).toString();
    expect(path).toEqual('M 0 0');

    a.innerRadiusY(120);
    path = a.path(tarc).toString();
    expect(path).toEqual('M 0 0');
  });
});

// vim: set ts=2 sw=2 tw=80:
