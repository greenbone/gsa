/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import React from 'react';

import PropTypes from 'web/utils/proptypes';

import path from '../utils/path';

const PI2 = 2 * Math.PI;

export const PieTopPath = ({
  color,
  path, // eslint-disable-line no-shadow
}) => <path fill={color} stroke={color} d={path} />;

PieTopPath.propTypes = {
  color: PropTypes.toString.isRequired,
  path: PropTypes.toString.isRequired,
};

const pieInnerPath = (sa, ea, irx, iry, h) => {
  const startAngle = sa < Math.PI ? Math.PI : sa;
  const endAngle = ea < Math.PI ? Math.PI : ea;
  const sx = irx * Math.cos(startAngle);
  const sy = iry * Math.sin(startAngle);
  const ex = irx * Math.cos(endAngle);
  const ey = iry * Math.sin(endAngle);

  const paths = path();

  paths.move(sx, sy);
  paths.arc(irx, iry, ex, ey, {sweep: 1});
  paths.line(ex, h + ey);
  paths.arc(irx, iry, sx, sy + h, {sweep: 0});
  paths.close();

  return paths;
};

export const PieInnerPath = ({
  startAngle = 0,
  endAngle = PI2,
  color,
  donutHeight,
  innerRadiusX,
  innerRadiusY,
}) => (
  <path
    d={pieInnerPath(
      startAngle,
      endAngle,
      innerRadiusX,
      innerRadiusY,
      donutHeight,
    )}
    fill={color}
  />
);

PieInnerPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  innerRadiusX: PropTypes.number.isRequired,
  innerRadiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

const pieOuterPath = (sa, ea, rx, ry, h) => {
  const startAngle = sa > Math.PI ? Math.PI : sa;
  const endAngle = ea > Math.PI ? Math.PI : ea;

  const sx = rx * Math.cos(startAngle);
  const sy = ry * Math.sin(startAngle);
  const ex = rx * Math.cos(endAngle);
  const ey = ry * Math.sin(endAngle);

  const paths = path();

  paths.move(sx, h + sy);
  paths.arc(rx, ry, ex, ey + h, {sweep: 1});
  paths.line(ex, ey);
  paths.arc(rx, ry, sx, sy, {sweep: 0});
  paths.close();

  return paths;
};

export const PieOuterPath = ({
  startAngle = 0,
  endAngle = PI2,
  donutHeight,
  color,
  innerRef,
  outerRadiusX,
  outerRadiusY,
}) => (
  <path
    d={pieOuterPath(
      startAngle,
      endAngle,
      outerRadiusX,
      outerRadiusY,
      donutHeight,
    )}
    ref={innerRef}
    fill={color}
  />
);

PieOuterPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  innerRef: PropTypes.ref,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

// vim: set ts=2 sw=2 tw=80:
