/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import path from 'web/components/chart/utils/Path';
import PropTypes from 'web/utils/PropTypes';

const PI2 = 2 * Math.PI;

export const PieTopPath = ({color, path}) => (
  <path d={path} fill={color} stroke={color} />
);

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

export const PieOuterPath = React.forwardRef(
  (
    {
      startAngle = 0,
      endAngle = PI2,
      donutHeight,
      color,
      outerRadiusX,
      outerRadiusY,
    },
    ref,
  ) => (
    <path
      ref={ref}
      d={pieOuterPath(
        startAngle,
        endAngle,
        outerRadiusX,
        outerRadiusY,
        donutHeight,
      )}
      fill={color}
    />
  ),
);

PieOuterPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};
