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
import React from 'react';

import {LinearGradient} from '@vx/gradient';

import {scaleBand, scaleUtc} from 'd3-scale';

import _ from 'gmp/locale';
import {dateTimeWithTimeZone} from 'gmp/locale/date';

import date from 'gmp/models/date';

import {shorten} from 'gmp/utils/string';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import path from './utils/path';
import {shouldUpdate} from './utils/update';

import Axis from './axis';
import Svg from './svg';
import ToolTip from './tooltip';
import Group from './group';

const ONE_DAY = 60 * 60 * 24;

const margin = {
  top: 30,
  right: 40,
  bottom: 40,
  left: 60,
  triangle: 10,
};

const MAX_LABEL_LENGTH = 25;

const tickFormat = val => {
  return shorten(val.toString(), MAX_LABEL_LENGTH);
};

const STROKE_GRADIENT_ID = 'green_stroke_gradient';

const getFutureRunLabel = runs => {
  if (runs === Number.POSITIVE_INFINITY) {
    return _('More runs not shown');
  }
  if (runs === 1) {
    return _('One more run not shown');
  }
  return _('{{num}} more runs not shown', {num: runs});
};

const cloneSchedule = (d, start) => {
  const {duration = 0} = d;
  const toolTip =
    duration === 0
      ? _('{{name}} Start: {{date}}', {
          name: d.label,
          date: dateTimeWithTimeZone(start),
        })
      : _('{{name}} Start: {{startdate}} End: {{enddate}}', {
          name: d.label,
          startdate: dateTimeWithTimeZone(start),
          enddate: dateTimeWithTimeZone(start.clone().add(duration, 'seconds')),
        });
  return {
    ...d,
    start,
    toolTip,
  };
};

const StrokeGradient = () => (
  <LinearGradient id={STROKE_GRADIENT_ID} x1="0%" x2="100%" y1="0%" y2="0%">
    <stop offset="0%" stopColor={Theme.darkGreen} stopOpacity="1.0" />
    <stop offset="25%" stopColor={Theme.darkGreen} stopOpacity="1.0" />
    <stop offset="100%" stopColor={Theme.darkGreen} stopOpacity="0.1" />
  </LinearGradient>
);

const strokeGradientUrl = `url(#${STROKE_GRADIENT_ID})`;

const FILL_GRADIENT_ID = 'green_fill_gradient';

const FillGradient = () => (
  <LinearGradient id={FILL_GRADIENT_ID} x1="0%" x2="100%" y1="0%" y2="0%">
    <stop offset="0%" stopColor={Theme.lightGreen} stopOpacity="1.0" />
    <stop offset="25%" stopColor={Theme.lightGreen} stopOpacity="1.0" />
    <stop offset="100%" stopColor={Theme.lightGreen} stopOpacity="0.1" />
  </LinearGradient>
);

const fillGradientUrl = `url(#${FILL_GRADIENT_ID})`;

const TRIANGLE_WIDTH = 20;

const Triangle = ({x = 0, y = 0, height, width = TRIANGLE_WIDTH, toolTip}) => {
  const d = path()
    .move(x, y)
    .line(x, y + height)
    .line(x + width, y + height / 2)
    .close();
  return (
    <ToolTip content={toolTip}>
      {({targetRef, hide, show}) => (
        <path
          d={d}
          ref={targetRef}
          fill={Theme.darkGreen}
          stroke={Theme.darkGreen}
          opacity="0.5"
          onMouseEnter={show}
          onMouseLeave={hide}
        />
      )}
    </ToolTip>
  );
};

Triangle.propTypes = {
  height: PropTypes.number.isRequired,
  toolTip: PropTypes.toString,
  width: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
};

class ScheduleChart extends React.Component {
  shouldComponentUpdate(nextProps) {
    return shouldUpdate(nextProps, this.props);
  }

  render() {
    const {
      data = [],
      height,
      svgRef,
      width,
      yAxisLabel,
      startDate = date(),
      endDate = startDate.clone().add(7, 'days'),
    } = this.props;

    const yValues = data.map(d => d.label);

    const maxLabelLength = Math.max(
      ...yValues.map(val => val.toString().length),
      MAX_LABEL_LENGTH,
    );

    // adjust left margin for label length on horizontal bars
    // 4px for each letter is just a randomly chosen value
    const marginLeft =
      margin.left + Math.min(MAX_LABEL_LENGTH, maxLabelLength) * 4;

    const maxWidth = width - marginLeft - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    const xScale = scaleUtc()
      .range([0, maxWidth])
      .domain([startDate.toDate(), endDate.toDate()]);

    const yScale = scaleBand()
      .range([0, maxHeight])
      .domain(yValues)
      .padding(0.125);

    const futureRuns = [];
    let schedules = [];

    for (const d of data) {
      const {label, isInfinite = false, starts} = d;

      schedules = [...schedules, ...starts.map(next => cloneSchedule(d, next))];

      const futureRun = isInfinite ? Number.POSITIVE_INFINITY : starts.length;

      if (futureRun > 0) {
        futureRuns.push({
          label,
          futureRun,
        });
      }
    }

    const bandwidth = yScale.bandwidth();
    return (
      <Layout align={['start', 'start']}>
        <Svg width={width} height={height} ref={svgRef}>
          <Group top={margin.top} left={marginLeft}>
            <Axis
              orientation="left"
              scale={yScale}
              top={0}
              left={0}
              label={yAxisLabel}
              rangePadding={0}
              tickFormat={tickFormat}
            />
            <Axis
              orientation="bottom"
              scale={xScale}
              top={maxHeight}
              label={yAxisLabel}
              numTicks={7}
              rangePadding={0}
            />
            <StrokeGradient />
            <FillGradient />
            {schedules.map((d, i) => {
              const {duration = 0, period = 0, start, label} = d;

              const startX = xScale(start);

              let end = start.clone();
              const hasDuration = duration > 0;
              if (hasDuration) {
                end.add(d.duration, 'seconds');
              } else if (period > 0) {
                end.add(Math.min(period, ONE_DAY), 'seconds');
              } else {
                end.add(1, 'day');
              }

              if (end.isAfter(endDate)) {
                end = endDate;
              }

              const endX = xScale(end.toDate());
              const rwidth = endX - startX;
              return (
                <ToolTip key={i} content={d.toolTip}>
                  {({targetRef, show, hide}) => (
                    <rect
                      ref={targetRef}
                      y={yScale(label)}
                      x={startX}
                      height={bandwidth}
                      width={rwidth}
                      fill={hasDuration ? Theme.lightGreen : fillGradientUrl}
                      stroke={hasDuration ? Theme.darkGreen : strokeGradientUrl}
                      onMouseEnter={show}
                      onMouseLeave={hide}
                    />
                  )}
                </ToolTip>
              );
            })}
          </Group>
          <Group
            left={width - margin.triangle - TRIANGLE_WIDTH}
            top={margin.top}
          >
            {futureRuns.map((run, i) => (
              <Triangle
                key={i}
                y={yScale(run.label)}
                height={bandwidth}
                toolTip={getFutureRunLabel(run.futureRun)}
              />
            ))}
          </Group>
        </Svg>
      </Layout>
    );
  }
}

ScheduleChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      starts: PropTypes.arrayOf(PropTypes.date).isRequired,
      label: PropTypes.toString.isRequired,
      isInfinite: PropTypes.bool,
      duration: PropTypes.number,
      period: PropTypes.number,
    }),
  ).isRequired,
  endDate: PropTypes.date,
  height: PropTypes.number.isRequired,
  startDate: PropTypes.date,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  yAxisLabel: PropTypes.string,
};

export default ScheduleChart;

// vim: set ts=2 sw=2 tw=80:
