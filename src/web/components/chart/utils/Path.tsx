/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface ArcOptions {
  largeArc?: number;
  sweep?: number;
  rotationDegree?: number;
}

export class Path {
  paths: (string | number)[];
  closed: boolean;

  constructor() {
    this.paths = [];
    this.closed = false;
  }

  push(command: string, ...paths: (string | number)[]) {
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

  move(x: number, y: number) {
    return this.push('M', x, y);
  }

  line(x: number, y: number) {
    return this.push('L', x, y);
  }

  arc(
    radiusX: number,
    radiusY: number,
    x: number,
    y: number,
    {largeArc = 0, sweep = 0, rotationDegree = 0}: ArcOptions = {},
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
