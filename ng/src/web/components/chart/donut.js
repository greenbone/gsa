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

import Layout from '../layout/layout';

import PropTypes from '../../utils/proptypes';

import Legend from './legend';
import Pie from './pie';
import ToolTip from './tooltip';
import Label from './label';

const Arc = ({
  path,
  color,
  startAngle,
  endAngle,
  label,
  x,
  y,
  toolTip,
}) => (
  <ToolTip
    content={toolTip}
  >
    {({targetRef, hide, show}) => (
      <g
        onMouseOver={show}
        onMouseOut={hide}
      >
        <path
          d={path}
          fill={color}
        />
        {endAngle - startAngle > 0.1 &&
          <Label
            innerRef={targetRef}
            x={x}
            y={y}
          >
            {label}
          </Label>
        }
      </g>
    )}
  </ToolTip>
);

Arc.propTypes = {
  color: PropTypes.toString,
  endAngle: PropTypes.number.isRequired,
  label: PropTypes.toString.isRequired,
  path: PropTypes.toString.isRequired,
  startAngle: PropTypes.number.isRequired,
  toolTip: PropTypes.elementOrString,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

const DonutChart = ({
  data,
  height,
  width,
}) => {
  const radius = (height - margin.top) / 2;
  return (
    <Layout align={['start', 'start']}>
      <svg width={width} height={height}>
        <Pie
          data={data}
          top={height / 2}
          left={width / 2}
          pieValue={d => d.value}
          outerRadiusX={radius}
          innerRadiusX={radius * 0.5}
          cornerRadius={3}
          padAngle={0.01}
        >
          {({
            index,
            data: arcData,
            ...props
          }) => (
            <Arc
              key={`pie-arc-${index}`}
              color={arcData.color}
              label={arcData.value}
              toolTip={arcData.toolTip}
              {...props}
            />
          )}
        </Pie>
      </svg>
      {data.length > 0 &&
        <Legend data={data} />
      }
    </Layout>
  );
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    toolTip: PropTypes.any,
    value: PropTypes.numberOrNumberString.isRequired,
    color: PropTypes.toString.isRequired,
    label: PropTypes.any.isRequired,
  })).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default DonutChart;

// vim: set ts=2 sw=2 tw=80:
