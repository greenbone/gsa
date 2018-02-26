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
import arc from './utils/arc';
import Layout from '../layout/layout';
import Pie from './pie';
import Label from './label';
import ToolTip from './tooltip';
import Legend from './legend';

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

const PieTopPath = ({
  color,
  path, // eslint-disable-line no-shadow
}) => (
  <path
    fill={color}
    stroke={color}
    d={path}
  />
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

const PieInnerPath = ({
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

const PieOuterPath = ({
  startAngle = 0,
  endAngle = PI2,
  donutHeight,
  color,
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
    fill={color}
  />
);

PieOuterPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

const EmptyDonut = ({
  left,
  top,
  innerRadiusX,
  innerRadiusY,
  outerRadiusX,
  outerRadiusY,
  donutHeight,
}) => {
  const donutarc = arc()
    .innerRadiusX(innerRadiusX)
    .innerRadiusY(innerRadiusY)
    .outerRadiusX(outerRadiusX)
    .outerRadiusY(outerRadiusY);
  return (
    <Group
      top={top}
      left={left}
    >
      <PieInnerPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        innerRadiusX={innerRadiusX}
        innerRadiusY={innerRadiusY}
      />
      <PieTopPath
        color={emptyColor}
        path={donutarc.path()}
      />
      <PieOuterPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        outerRadiusX={outerRadiusX}
        outerRadiusY={outerRadiusY}
      />
    </Group>
  );
};

EmptyDonut.propTypes = {
  donutHeight: PropTypes.number.isRequired,
  innerRadiusX: PropTypes.number.isRequired,
  innerRadiusY: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
};

const Donut3DChart = ({
  data = [],
  height,
  width,
}) => {
  const horizontalMargin = margin.left + margin.right;
  const verticalMargin = margin.top + margin.left;

  const donutHeight = Math.min(height, width) / 8;

  const innerRadius = 0.5;

  const centerX = width / 2;
  const centerY = height / 2 - donutHeight / 2;
  const outerRadiusX = width / 2 - horizontalMargin;
  const outerRadiusY = (Math.min(height / 2, width / 2) - donutHeight / 2) -
    verticalMargin;
  const innerRadiusX = outerRadiusX * innerRadius;
  const innerRadiusY = outerRadiusY * innerRadius;

  const props = {
    outerRadiusX,
    outerRadiusY,
    donutHeight,
    innerRadiusX,
    innerRadiusY,
  };
  return (
    <Layout align={['start', 'start']}>
      <svg width={width} height={height}>
        {data.length > 0 ?
          <Pie
            data={data}
            pieSort={null}
            pieValue={d => d.value}
            arcsSort={sortArcsByStartAngle}
            top={centerY}
            left={centerX}
            {...props}
          >
            {({
              data: arcData,
              index,
              startAngle,
              endAngle,
              path: arcPath,
              x,
              y,
            }) => {
              const {color, toolTip} = arcData;
              const darker = d3color(color).darker();
              return (
                <ToolTip
                  key={index}
                  content={toolTip}
                >
                  {({targetRef, hide, show}) => (
                    <Group
                      onMouseOver={show}
                      onMouseOut={hide}
                    >
                      <PieInnerPath
                        startAngle={startAngle}
                        endAngle={endAngle}
                        color={darker}
                        {...props}
                      />
                      <PieTopPath
                        color={color}
                        path={arcPath}
                      />
                      <PieOuterPath
                        startAngle={startAngle}
                        endAngle={endAngle}
                        color={darker}
                        {...props}
                      />
                      <Label
                        x={x}
                        y={y}
                        innerRef={targetRef}
                      >
                        {arcData.value}
                      </Label>
                    </Group>
                  )}
                </ToolTip>
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
      <Legend data={data}/>
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
