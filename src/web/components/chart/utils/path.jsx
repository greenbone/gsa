/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
