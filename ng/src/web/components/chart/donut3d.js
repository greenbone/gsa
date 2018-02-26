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
import React from 'react';

import {color as d3color} from 'd3-color';

import {Group} from '@vx/group';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';

import path from './utils/path';
import Layout from '../layout/layout';
import Pie from './pie';

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

const PI2 = 2 * Math.PI;
const emptyColor = Theme.lightGray;
const darkEmptyColor = d3color(emptyColor).darker();

const sortArcsByStartAngle = (a, b) => a.startAngle > b.startAngle ? -1 : 1;

const pieTopPath = (startAngle, endAngle, rx, ry, ir) => {
  if (endAngle - startAngle === 0) {
    return 'M 0 0';
  }

  const sx = rx * Math.cos(startAngle);
  const sy = ry * Math.sin(startAngle);
  const ex = rx * Math.cos(endAngle);
  const ey = ry * Math.sin(endAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const paths = path();

  paths.move(sx, sy);
  paths.arc(rx, ry, ex, ey, {largeArc, sweep: 1});
  paths.line(ir * ex, ir * ey);
  paths.arc(rx * ir, ry * ir, sx * ir, sy * ir, {largeArc, sweep: 0});
  paths.close();

  return paths;
};

const PieTopPath = ({
  startAngle = 0,
  endAngle = PI2,
  color,
  radiusX,
  radiusY,
  innerRadius,
}) => (
  <path
    fill={color}
    stroke={color}
    d={pieTopPath(
      startAngle,
      endAngle,
      radiusX,
      radiusY,
      innerRadius,
    )}
  />
);

PieTopPath.propTypes = {
  color: PropTypes.toString.isRequired,
  endAngle: PropTypes.number,
  innerRadius: PropTypes.number.isRequired,
  radiusX: PropTypes.number.isRequired,
  radiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

const pieInnerPath = (sa, ea, rx, ry, h, ir) => {
  const startAngle = sa < Math.PI ? Math.PI : sa;
  const endAngle = ea < Math.PI ? Math.PI : ea;

  const sx = ir * rx * Math.cos(startAngle);
  const sy = ir * ry * Math.sin(startAngle);
  const ex = ir * rx * Math.cos(endAngle);
  const ey = ir * ry * Math.sin(endAngle);

  const paths = path();

  paths.move(sx, sy);
  paths.arc(rx * ir, ry * ir, ex, ey, {sweep: 1});
  paths.line(ex, h + ey);
  paths.arc(rx * ir, ry * ir, sx, sy + h, {sweep: 0});
  paths.close();

  return paths;
};

const PieInnerPath = ({
  startAngle = 0,
  endAngle = PI2,
  color,
  radiusX,
  radiusY,
  donutHeight,
  innerRadius,
}) => (
  <path
    d={pieInnerPath(
      startAngle,
      endAngle,
      radiusX,
      radiusY,
      donutHeight,
      innerRadius,
    )}
    fill={color}
  />
);

PieInnerPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  innerRadius: PropTypes.number.isRequired,
  radiusX: PropTypes.number.isRequired,
  radiusY: PropTypes.number.isRequired,
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

const PieOuterPath = ({
  startAngle = 0,
  endAngle = PI2,
  radiusX,
  radiusY,
  donutHeight,
  color,
}) => (
  <path
    d={pieOuterPath(
      startAngle,
      endAngle,
      radiusX,
      radiusY,
      donutHeight,
    )}
    fill={color}
  />
);

PieOuterPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  radiusX: PropTypes.number.isRequired,
  radiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

const EmptyDonut = ({
  left,
  top,
  ...props
}) => (
  <Group
    top={top}
    left={left}
  >
    <PieInnerPath
      {...props}
      color={darkEmptyColor}
    />
    <PieTopPath
      {...props}
      color={emptyColor}
    />
    <PieOuterPath
      {...props}
      color={darkEmptyColor}
    />
  </Group>
);

EmptyDonut.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
};

const Donut3DChart = ({
  data = [],
  height,
  width,
}) => {
  const horizontalMargin = margin.left + margin.right;
  const verticalMargin = margin.top + margin.left;

  const donutHeight = Math.min(height, width) / 8;

  const centerX = width / 2;
  const centerY = height / 2 - donutHeight / 2;
  const radiusX = width / 2 - horizontalMargin;
  const radiusY = (Math.min(height / 2, width / 2) - donutHeight / 2) -
    verticalMargin;
  const innerRadius = 0.5;

  const props = {
    radiusX,
    radiusY,
    donutHeight,
    innerRadius,
  };
  return (
    <Layout align={['start', 'start']}>
      <svg width={width} height={height}>
        {data.length > 0 ?
          <Pie
            pieSort={null}
            pieValue={d => d.value}
            arcsSort={sortArcsByStartAngle}
            data={data}
            top={centerY}
            left={centerX}
          >
            {({
              data: arcData,
              index,
              startAngle,
              endAngle,
            }) => {
              const {color} = arcData;
              const darker = d3color(color).darker();
              return (
                <Group
                  key={index}
                >
                  <PieInnerPath
                    startAngle={startAngle}
                    endAngle={endAngle}
                    color={darker}
                    {...props}
                  />
                  <PieTopPath
                    startAngle={startAngle}
                    endAngle={endAngle}
                    color={color}
                    {...props}
                  />
                  <PieOuterPath
                    startAngle={startAngle}
                    endAngle={endAngle}
                    color={darker}
                    {...props}
                  />
                </Group>
              );
            }}
          </Pie> :
          <EmptyDonut
            left={centerX}
            top={centerY}
            {...props}
          />
        }
      </svg>
    </Layout>
  );
};

Donut3DChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.toString.isRequired,
    value: PropTypes.numberOrNumberString.isRequired,
  })),
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default Donut3DChart;

// vim: set ts=2 sw=2 tw=80:
