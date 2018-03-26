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

import {Bar} from '@vx/shape';
import {scaleBand, scaleLinear} from '@vx/scale';

import {shorten} from 'gmp/utils/index';

import Layout from '../layout/layout';

import PropTypes from '../../utils/proptypes';

import Axis from './axis';
import Group from './group';
import Legend from './legend';
import ToolTip from './tooltip';
import Svg from './svg';

const margin = {
  top: 40,
  right: 20,
  bottom: 40,
  left: 60,
};

const MAX_LABEL_LENGTH = 25;

const tickFormat = val => {
  if (val.toString().length > MAX_LABEL_LENGTH) {
    return shorten(val.toString(), MAX_LABEL_LENGTH);
  }
  return val;
};

const BarChart = ({
  data,
  height,
  width,
  xLabel,
  yLabel,
  horizontal = false,
}) => {
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  const yMax = Math.max(...yValues);

  const maxLabelLength = Math.max(...xValues.map(val => val.toString().length));

  // adjust left margin for label length on horizontal bars
  // 4px for each letter is just a randomly choosen value
  const marginLeft = horizontal ? margin.left +
    Math.min(MAX_LABEL_LENGTH, maxLabelLength) * 4 : margin.left;

  const maxWidth = width - marginLeft - margin.right;
  const maxHeight = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    rangeRound: horizontal ? [0, maxHeight] : [0, maxWidth],
    domain: xValues,
    padding: 0.125,
  });

  const yScale = scaleLinear({
    range: horizontal ? [0, maxWidth] : [maxHeight, 0],
    domain: [0, yMax],

    /*
      nice seems to round first and last value.
      see https://github.com/d3/d3-scale/blob/master/README.md#continuous_nice
      the old version did call nice(10) which isn't possible with vx at the moment.
    */
    nice: true,
  });

  return (
    <Layout align={['start', 'start']}>
      <Svg width={width} height={height}>
        <Group top={margin.top} left={marginLeft}>
          <Axis
            orientation="left"
            scale={horizontal ? xScale : yScale}
            top={0}
            left={0}
            label={horizontal ? xLabel : yLabel}
            numTicks={10}
            tickFormat={horizontal ? tickFormat : undefined}
          />
          <Axis
            orientation="bottom"
            scale={horizontal ? yScale : xScale}
            top={maxHeight}
            label={horizontal ? yLabel : xLabel}
          />
          {data.map((d, i) => (
            <ToolTip
              key={i}
              content={d.toolTip}
            >
              {({targetRef, hide, show}) => (
                <Bar
                  innerRef={targetRef}
                  fill={d.color}
                  x={horizontal ? 1 : xScale(d.x)}
                  y={horizontal ? xScale(d.x) : yScale(d.y)}
                  height={
                    horizontal ?
                      xScale.bandwidth() :
                      maxHeight - yScale(d.y)
                  }
                  width={
                    horizontal ?
                      yScale(d.y) :
                      xScale.bandwidth()
                  }
                  onMouseEnter={() => show}
                  onMouseLeave={() => hide}
                />
              )}
            </ToolTip>
          ))}
        </Group>
      </Svg>
      {data.length > 0 &&
        <Legend data={data} />
      }
    </Layout>
  );
};

BarChart.propTypes = {
  /*
    Required array structure for data:

    [{
      x: ...,
      y: ...,
      toolTip: ...,
      color: ...,
      label: ...,
    }]
  */
  data: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.toString.isRequired,
    y: PropTypes.number.isRequired,
    label: PropTypes.any.isRequired,
    color: PropTypes.toString.isRequired,
    toolTip: PropTypes.elementOrString,
  })).isRequired,
  height: PropTypes.number.isRequired,
  horizontal: PropTypes.bool,
  width: PropTypes.number.isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
};

export default BarChart;

// vim: set ts=2 sw=2 tw=80:
