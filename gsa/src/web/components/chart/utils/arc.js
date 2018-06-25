/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {is_defined} from 'gmp/utils/identity';

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

  centroid({
    startAngle = 0,
    endAngle = PI2,
  } = {}) {
    this._checkRadius();

    const outerRadiusX = this._outerRadiusX;
    const outerRadiusY = is_defined(this._outerRadiusY) ?
      this._outerRadiusY : outerRadiusX;

    const innerRadiusX = this._innerRadiusX;
    const innerRadiusY = is_defined(this._innerRadiusY) ?
      this._innerRadiusY : innerRadiusX;

    const rx = (innerRadiusX + outerRadiusX) / 2;
    const ry = is_defined(innerRadiusY) && is_defined(outerRadiusY) ?
      (innerRadiusY + outerRadiusY) / 2 : rx;

    const a = (startAngle + endAngle) / 2;
    return {
      x: Math.cos(a) * rx,
      y: Math.sin(a) * ry,
    };
  };

  path({
    startAngle = 0,
    endAngle = PI2,
  } = {}) {
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
    const outerRadiusY = is_defined(this._outerRadiusY) ?
      this._outerRadiusY : outerRadiusX;

    const innerRadiusX = this._innerRadiusX;
    const innerRadiusY = is_defined(this._innerRadiusY) ?
      this._innerRadiusY : innerRadiusX;

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
    paths.arc(innerRadiusX, innerRadiusY, sx * irx, sy * iry,
      {largeArc, sweep: 0});
    paths.close();

    return paths;
  };

  _checkRadius() {
    if (!is_defined(this._outerRadiusX)) {
      throw new Error('outerRadiusX must be set');
    }
  }
};

export default () => new Arc();

// vim: set ts=2 sw=2 tw=80:
