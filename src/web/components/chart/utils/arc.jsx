/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
