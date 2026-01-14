/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {forwardRef, type Ref} from 'react';
import {type ToString} from 'gmp/types';
import path from 'web/components/chart/utils/Path';

interface PieToPathProps {
  color: ToString;
  path: ToString;
}

interface PieInnerPathProps {
  color: ToString;
  donutHeight: number;
  endAngle?: number;
  innerRadiusX: number;
  innerRadiusY: number;
  startAngle?: number;
}

interface PieOuterPathProps {
  startAngle?: number;
  endAngle?: number;
  donutHeight: number;
  color: ToString;
  outerRadiusX: number;
  outerRadiusY: number;
}

const PI2 = 2 * Math.PI;

export const PieTopPath = ({color, path}: PieToPathProps) => (
  <path d={String(path)} fill={String(color)} stroke={String(color)} />
);

const pieInnerPath = (
  sa: number,
  ea: number,
  irx: number,
  iry: number,
  h: number,
) => {
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

  return String(paths);
};

export const PieInnerPath = ({
  startAngle = 0,
  endAngle = PI2,
  color,
  donutHeight,
  innerRadiusX,
  innerRadiusY,
}: PieInnerPathProps) => (
  <path
    d={pieInnerPath(
      startAngle,
      endAngle,
      innerRadiusX,
      innerRadiusY,
      donutHeight,
    )}
    fill={String(color)}
  />
);

const pieOuterPath = (
  sa: number,
  ea: number,
  rx: number,
  ry: number,
  h: number,
) => {
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

  return String(paths);
};

export const PieOuterPath = forwardRef(
  (
    {
      startAngle = 0,
      endAngle = PI2,
      donutHeight,
      color,
      outerRadiusX,
      outerRadiusY,
    }: PieOuterPathProps,
    ref: Ref<SVGPathElement>,
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
      fill={String(color)}
    />
  ),
);
