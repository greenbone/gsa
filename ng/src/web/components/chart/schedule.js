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

import moment from 'moment';

import {Group} from '@vx/group';
import {LinearGradient} from '@vx/gradient';
import {scaleBand, scaleUtc} from '@vx/scale';

import _, {datetime} from 'gmp/locale';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';

import Layout from '../layout/layout';

import path from './utils/path';
import Axis from './axis';
import Svg from './svg';
import ToolTip from './tooltip';

const ONE_DAY = 60 * 60 * 24;

const margin = {
  top: 30,
  right: 40,
  bottom: 40,
  left: 60,
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

const cloneSchedule = (d, start = d.start) => ({
  ...d,
  start,
  toolTip: _('{{name}} Start: {{date}}',
    {name: d.label, date: datetime(start)}),
});

const StrokeGradient = () => (
  <LinearGradient
    id={STROKE_GRADIENT_ID}
    x1="0%"
    x2="100%"
    y1="0%"
    y2="0%"
  >
    <stop
      offset="0%"
      stopColor={Theme.darkGreen}
      stopOpacity="1.0"
    />
    <stop
      offset="25%"
      stopColor={Theme.darkGreen}
      stopOpacity="1.0"
    />
    <stop
      offset="100%"
      stopColor={Theme.darkGreen}
      stopOpacity="0.1"
    />
  </LinearGradient>
);

const strokeGradientUrl = `url(#${STROKE_GRADIENT_ID})`;

const FILL_GRADIENT_ID = 'green_fill_gradient';

const FillGradient = () => (
  <LinearGradient
    id={FILL_GRADIENT_ID}
    x1="0%"
    x2="100%"
    y1="0%"
    y2="0%"
  >
    <stop
      offset="0%"
      stopColor={Theme.lightGreen}
      stopOpacity="1.0"
    />
    <stop
      offset="25%"
      stopColor={Theme.lightGreen}
      stopOpacity="1.0"
    />
    <stop
      offset="100%"
      stopColor={Theme.lightGreen}
      stopOpacity="0.1"
    />
  </LinearGradient>
);

const fillGradientUrl = `url(#${FILL_GRADIENT_ID})`;

const TRIANGLE_WIDTH = 20;

const Triangle = ({
  x = 0,
  y = 0,
  height,
  width = TRIANGLE_WIDTH,
  toolTip,
}) => {
  const d = path()
    .move(x, y)
    .line(x, y + height)
    .line(x + width, y + height / 2)
    .close();
  return (
    <ToolTip
      content={toolTip}
    >
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

const ScheduleChart = ({
  data = [],
  height,
  width,
  xAxisLabel,
  yAxisLabel,
}) => {
  const maxWidth = width - margin.left - margin.right;
  const maxHeight = height - margin.top - margin.bottom;

  const today = moment();
  const end = today.clone().add(7, 'days');

  const yValues = data.map(d => d.label);

  const xScale = scaleUtc({
    range: [0, maxWidth],
    domain: [today.toDate(), end.toDate()],
  });

  const yScale = scaleBand({
    range: [0, maxHeight],
    domain: yValues,
    padding: 0.125,
  });

  const starts = [];
  const futureRuns = [];

  for (const d of data) {
    const {
      period = 0,
      periods = 0,
      periodMonth = 0,
      start,
      label,
    } = d;

    let futureRun = 1;

    // check if start date is in this week
    if (start.isSameOrBefore(end)) {
      starts.push(cloneSchedule(d));

      futureRun = 0;

      /* eslint-disable max-depth */
      if (periods > 0 || (periods === 0 && period > 0)) {
        let newStart = start.clone().add(period, 'seconds');

        if (periods === 0) {
          futureRun = Number.POSITIVE_INFINITY;

          while (newStart.isSameOrBefore(end)) {
            starts.push(cloneSchedule(d, newStart));
            newStart = newStart.clone();
            newStart.add(period, 'seconds');
          }
        }
        else {
          for (let j = 0; j < periods; j++) {
            if (newStart.isSameOrBefore(end)) {
              starts.push(cloneSchedule(d, newStart));
            }
            else {
              futureRun++;
            }
            newStart = newStart.clone();
            newStart.add(period, 'seconds');
          }
        }
      }
    }
    else if (periods === 0 && (periods > 0 || periodMonth > 0)) {
      futureRun = Number.POSITIVE_INFINITY;
    }
    /* eslint-enable max-depth */

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
      <Svg
        width={width}
        height={height}
      >
        <Group top={margin.top} left={margin.left}>
          <Axis
            orientation="left"
            scale={yScale}
            top={0}
            left={0}
            label={yAxisLabel}
            rangePadding={0}
          />
          <Axis
            orientation="bottom"
            scale={xScale}
            top={maxHeight}
            label={yAxisLabel}
            numTicks={7}
            rangePadding={0}
          />
          <StrokeGradient/>
          <FillGradient/>
          {starts.map((d, i) => {
            const {
              duration = 0,
              period = 0,
              start,
              label,
            } = d;

            const startX = xScale(start);

            let endDate = start.clone();
            const hasDuration = duration > 0;
            if (hasDuration) {
              endDate.add(d.duration, 'seconds');
            }
            else if (period > 0) {
              endDate.add(Math.min(period, ONE_DAY), 'seconds');
            }
            else {
              endDate.add(1, 'day');
            }

            if (endDate.isAfter(end)) {
              endDate = end;
            }

            const endX = xScale(endDate.toDate());
            const rwidth = endX - startX;
            return (
              <ToolTip
                key={i}
                content={d.toolTip}
              >
                {({targetRef, show, hide}) => (
                  <rect
                    ref={targetRef}
                    y={yScale(label)}
                    x={startX}
                    height={bandwidth}
                    width={rwidth}
                    fill={
                      hasDuration ?
                        Theme.lightGreen :
                        fillGradientUrl
                    }
                    stroke={
                      hasDuration ?
                        Theme.darkGreen :
                        strokeGradientUrl
                    }
                    onMouseEnter={show}
                    onMouseLeave={hide}
                  />
                )}
              </ToolTip>

            );
          })}
        </Group>
        <Group
          left={width - TRIANGLE_WIDTH}
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

};

ScheduleChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.momentDate.isRequired,
    label: PropTypes.toString.isRequired,
    duration: PropTypes.number,
    period: PropTypes.number,
    periods: PropTypes.number,
    periodMonth: PropTypes.number,
  })).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
};

export default ScheduleChart;

// vim: set ts=2 sw=2 tw=80:
