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

class Path {
  constructor() {
    this.paths = [];
    this.closed = false;
  }

  push(command, ...paths) {
    if (!this.closed) {
      this.paths.push(command, ...paths);
    }
    return this;
  }

  close() {
    this.push('Z');
    this.closed = true;
    return this;
  }

  move(x, y) {
    return this.push('M', x, y);
  }

  line(x, y) {
    return this.push('L', x, y);
  }

  arc(
    radiusX,
    radiusY,
    x,
    y,
    {largeArc = 0, sweep = 0, rotationDegree = 0} = {},
  ) {
    return this.push(
      'A',
      radiusX,
      radiusY,
      rotationDegree,
      largeArc,
      sweep,
      x,
      y,
    );
  }

  toString() {
    return this.paths.join(' ');
  }
}

const pathFunc = () => new Path();

export default pathFunc;
// vim: set ts=2 sw=2 tw=80:
