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
import {isDefined} from 'gmp/utils/identity';

import path from './path';

const EPSILON = 1e-12; // 1 * 10^(-12)

const PI2 = Math.PI * 2;

class Arc {
  constructor() {
    this._innerRadiusX = 0;
  }

  innerRadiusX(radius) {
    this._innerRadiusX = radius;
    return this;
  }

  outerRadiusX(radius) {
    this._outerRadiusX = radius;
    return this;
  }

  innerRadiusY(radius) {
    this._innerRadiusY = radius;
    return this;
  }

  outerRadiusY(radius) {
    this._outerRadiusY = radius;
    return this;
  }

  centroid({startAngle = 0, endAngle = PI2} = {}) {
    this._checkRadius();

    const outerRadiusX = this._outerRadiusX;
    const outerRadiusY = isDefined(this._outerRadiusY)
      ? this._outerRadiusY
      : outerRadiusX;

    const innerRadiusX = this._innerRadiusX;
    const innerRadiusY = isDefined(this._innerRadiusY)
      ? this._innerRadiusY
      : innerRadiusX;

    const rx = (innerRadiusX + outerRadiusX) / 2;
    const ry =
      isDefined(innerRadiusY) && isDefined(outerRadiusY)
        ? (innerRadiusY + outerRadiusY) / 2
        : rx;

    const a = (startAngle + endAngle) / 2;
    return {
      x: Math.cos(a) * rx,
      y: Math.sin(a) * ry,
    };
  }

  path({startAngle = 0, endAngle = PI2} = {}) {
    const paths = path();
    const diff = endAngle - startAngle;

    if (diff < EPSILON) {
      return paths.move(0, 0);
    }

    if (diff > PI2 - EPSILON) {
      endAngle = PI2;
    }

    this._checkRadius();

    const outerRadiusX = this._outerRadiusX;
    const outerRadiusY = isDefined(this._outerRadiusY)
      ? this._outerRadiusY
      : outerRadiusX;

    const innerRadiusX = this._innerRadiusX;
    const innerRadiusY = isDefined(this._innerRadiusY)
      ? this._innerRadiusY
      : innerRadiusX;

    const sx = outerRadiusX * Math.cos(startAngle);
    const sy = outerRadiusY * Math.sin(startAngle);
    const ex = outerRadiusX * Math.cos(endAngle);
    const ey = outerRadiusY * Math.sin(endAngle);

    const irx = innerRadiusX / outerRadiusX;
    const iry = innerRadiusY / outerRadiusY;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    paths.move(sx, sy);
    paths.arc(outerRadiusX, outerRadiusY, ex, ey, {largeArc, sweep: 1});
    paths.line(irx * ex, iry * ey);
    paths.arc(innerRadiusX, innerRadiusY, sx * irx, sy * iry, {
      largeArc,
      sweep: 0,
    });
    paths.close();

    return paths;
  }

  _checkRadius() {
    if (!isDefined(this._outerRadiusX)) {
      throw new Error('outerRadiusX must be set');
    }
  }
}

const arcFunc = () => new Arc();

export default arcFunc;

// vim: set ts=2 sw=2 tw=80:
