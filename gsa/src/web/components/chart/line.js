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

import memoize from 'memoize-one';

import React from 'react';

import styled from 'styled-components';

import {scaleLinear, scaleUtc} from 'd3-scale';

import {Line, LinePath} from '@vx/shape';

import {isDefined} from 'gmp/utils/identity';

import date from 'gmp/models/date';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';
import {setRef} from 'web/utils/render';

import {MENU_PLACEHOLDER_WIDTH} from './utils/constants';
import {shouldUpdate} from './utils/update';

import Legend, {Item, Label, Line as LegendLine} from './legend';
import Axis from './axis';
import Svg from './svg';
import Group from './group';

const LEGEND_MARGIN = 20;

const margin = {
  top: 35,
  right: 60,
  bottom: 55,
  left: 60,
};

const MIN_WIDTH = 100 + margin.right + margin.left;
const MIN_TICK_WIDTH = 75;

const findX = (timeline, value) => d =>
  timeline ? d.x.isSame(value) : d.x === value;

const CrispEdgesLine = styled(Line)`
  shape-rendering: crisp-edges;
`;

const LINE_HEIGHT = 15;

const Text = styled.text`
  font-size: 12px;
  fill: ${Theme.white};
`;

const LabelTitle = styled.text`
  font-size: 13px;
  fill: ${Theme.white};
  font-family: monospace;
`;

const xValue = (d, timeline = false) => (timeline ? d.x.toDate() : d.x);

const maxWidth = memoize(width => width - margin.left - margin.right);

const maxHeight = memoize(height => height - margin.top - margin.bottom);

const getXAxisTicks = memoize((width, numTicks = 10) => {
  while (width / numTicks < MIN_TICK_WIDTH) {
    numTicks--;
  }
  return numTicks;
});

const getXValues = memoize((data = [], timeline = false) =>
  data.map(d => xValue(d, timeline)),
);

const getXMin = memoize(xValues => Math.min(...xValues));
const getXMax = memoize(xValues => Math.max(...xValues));

const getXScale = memoize((data = [], timeline = false, width) => {
  const xValues = getXValues(data, timeline);

  const xMin = getXMin(xValues);
  const xMax = getXMax(xValues);

  let xDomain;
  if (timeline) {
    xDomain =
      data.length === 1
        ? [
            date(data[0].x).subtract(1, 'day').toDate(),
            date(data[0].x).add(1, 'day').toDate(),
          ]
        : [date(xMin).toDate(), date(xMax).toDate()];
  } else {
    xDomain = data.length > 1 ? [xMin, xMax] : [xMin - 1, xMax + 1];
  }

  return timeline
    ? scaleUtc()
        .range([0, maxWidth(width)])
        .domain(xDomain)
    : scaleLinear()
        .range([0, maxWidth(width)])
        .domain(xDomain);
});

const getYScale = memoize((data = [], height) => {
  const yValues = data.map(d => d.y);
  const yMax = Math.max(...yValues);
  const yDomain = data.length > 1 ? [0, yMax] : [0, yMax * 2];
  return scaleLinear()
    .range([maxHeight(height), 0])
    .domain(yDomain)
    .nice();
});

const getY2Scale = memoize((data = [], height) => {
  const y2Values = data.map(d => d.y2);
  const y2Max = Math.max(...y2Values);

  const y2Domain = data.length > 1 ? [0, y2Max] : [0, y2Max * 2];
  return scaleLinear()
    .range([maxHeight(height), 0])
    .domain(y2Domain)
    .nice();
});

export const lineDataPropType = PropTypes.shape({
  color: PropTypes.toString.isRequired,
  dashArray: PropTypes.string,
  label: PropTypes.any.isRequired,
  lineWidth: PropTypes.number,
  width: PropTypes.number,
});

const crossPropTypes = {
  color: PropTypes.toString.isRequired,
  dashArray: PropTypes.toString,
  lineWidth: PropTypes.number,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

const Cross = ({x, y, color, dashArray, lineWidth = 1}) => (
  <Group>
    <Line
      from={{x: x - 5, y: y - 5}}
      to={{x: x + 5, y: y + 5}}
      stroke={color}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
    />
    <Line
      from={{x: x + 5, y: y - 5}}
      to={{x: x - 5, y: y + 5}}
      stroke={color}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
    />
  </Group>
);

Cross.propTypes = crossPropTypes;

const CrossY2 = ({x, y, color, dashArray, lineWidth = 1}) => (
  <Group>
    <Line
      from={{x: x - 6, y}}
      to={{x: x + 6, y}}
      stroke={color}
      strokeDasharray={[2, 1]}
      strokeWidth={lineWidth}
    />
    <Line
      from={{x, y: y - 6}}
      to={{x, y: y + 6}}
      stroke={color}
      strokeDasharray={[2, 1]}
      strokeWidth={lineWidth}
    />
  </Group>
);

CrossY2.propTypes = crossPropTypes;

class LineChart extends React.Component {
  constructor(...args) {
    super(...args);

    this.legendRef = React.createRef();

    this.hideInfo = this.hideInfo.bind(this);
    this.showInfo = this.showInfo.bind(this);

    this.startRangeSelection = this.startRangeSelection.bind(this);
    this.endRangeSelection = this.endRangeSelection.bind(this);

    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.state = {
      displayInfo: false,
      width: this.getWidth(),
    };
  }

  componentDidUpdate() {
    this.update();
  }

  componentDidMount() {
    this.update();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      shouldUpdate(nextProps, this.props) ||
      nextState.width !== this.state.width ||
      nextState.rangeX !== this.state.rangeX ||
      nextState.infoX !== this.state.infoX ||
      nextState.mouseX !== this.state.mouseX ||
      nextState.mouseY !== this.state.mouseY ||
      nextState.data !== this.state.data ||
      nextState.displayInfo !== this.state.displayInfo
    );
  }

  hideInfo() {
    this.setState({displayInfo: false});
  }

  showInfo(event) {
    this.setState({displayInfo: true});
  }

  handleMouseMove(event) {
    if (!this.svg) {
      return;
    }

    const box = this.svg.getBoundingClientRect();
    const mouseX = event.clientX - box.left - margin.left - 1;
    const mouseY = event.clientY - box.top - margin.top - 1;

    this.setState({
      infoX: this.getXValueForPixel(mouseX),
      mouseY,
    });
  }

  startRangeSelection(event) {
    const box = this.svg.getBoundingClientRect();
    const mouseX = event.clientX - box.left - margin.left - 1;

    this.setState({rangeX: this.getXValueForPixel(mouseX)});
  }

  endRangeSelection(event) {
    const {rangeX, infoX} = this.state;
    const {onRangeSelected, timeline = false, data} = this.props;

    if (onRangeSelected) {
      const direction = infoX >= rangeX;
      const start = {...data.find(findX(timeline, rangeX))};
      const end = {...data.find(findX(timeline, infoX))};

      if (direction) {
        onRangeSelected(start, end);
      } else {
        onRangeSelected(end, start);
      }
    }

    this.setState({rangeX: undefined});
  }

  getXValueForPixel(px) {
    const {data = [], timeline = false} = this.props;
    const {width} = this.state;

    const xValues = getXValues(data, timeline);

    if (xValues.length === 1) {
      return xValues[0];
    }

    if (px >= maxWidth(width)) {
      return getXMax(xValues);
    }

    if (px <= 0) {
      return getXMin(xValues);
    }

    const values = [...xValues].sort((a, b) => a - b); // sort copy of x values

    const xScale = getXScale(data, timeline, width);
    const xV = xScale.invert(px); // x value for pixel position

    const index = values.findIndex(x => xV <= x); // get index of the first x value bigger then xV

    const xV1 = values[index]; // get the x value bigger then xV
    const xV2 = values[index - 1]; // get the x value before

    return xV1 - xV < xV - xV2 ? xV1 : xV2; // return nearest value
  }

  getWidth() {
    let {width} = this.props;
    const {current: legend} = this.legendRef;

    width = width - MENU_PLACEHOLDER_WIDTH;

    if (legend !== null) {
      const {width: legendWidth} = legend.getBoundingClientRect();
      width = width - legendWidth - LEGEND_MARGIN;
    }

    if (width < MIN_WIDTH) {
      width = MIN_WIDTH;
    }

    return width;
  }

  update() {
    const width = this.getWidth();
    if (width !== this.state.width) {
      this.setState({width});
    }
  }

  renderInfo() {
    const {data, height, timeline, yLine, y2Line} = this.props;
    const {displayInfo, infoX, mouseY, width} = this.state;

    const lines = (isDefined(yLine) ? 1 : 0) + (isDefined(y2Line) ? 1 : 0);

    if (!displayInfo || !isDefined(infoX) || lines === 0) {
      return null;
    }

    const value = data.find(findX(timeline, infoX));
    if (!isDefined(value)) {
      return null;
    }

    const {label = '', y, y2} = value;

    const xScale = getXScale(data, timeline, width);

    const x = xScale(infoX);
    const infoWidth = Math.max(label.length * 8 + 20, 100); // 8px per letter is just an assumption
    const infoHeight = LINE_HEIGHT + lines * LINE_HEIGHT;
    const itemMargin = 5;
    const lineY = LINE_HEIGHT / 2;
    const lineLength = 15;
    const infoMargin = 20;
    return (
      <Group>
        <CrispEdgesLine from={{x, y: 0}} to={{x, y: maxHeight(height)}} />
        <Group left={x + infoMargin} top={mouseY}>
          <rect
            x={0}
            y={0}
            width={infoWidth + 3 * itemMargin}
            height={infoHeight + 2 * itemMargin}
            fill={Theme.mediumGray}
            opacity="0.75"
          />
          <rect
            x={itemMargin}
            y={0}
            width={15 + 2 * itemMargin}
            height={infoHeight + 2 * itemMargin}
            fill={Theme.white}
          />
          <Group top={LINE_HEIGHT} left={2 * itemMargin} textAnchor="end">
            <LabelTitle x={infoWidth} y={0} fontWeight="bold">
              {label}
            </LabelTitle>
            <Group>
              <Line
                from={{x: 0, y: lineY}}
                to={{x: lineLength, y: lineY}}
                stroke={yLine.color}
                strokeDasharray={yLine.dashArray}
                strokeWidth={yLine.lineWidth}
              />
              <Text x={infoWidth} y={LINE_HEIGHT - 1}>
                {y}
              </Text>
            </Group>
            <Group top={LINE_HEIGHT}>
              <Line
                from={{x: 0, y: lineY}}
                to={{x: lineLength, y: lineY}}
                stroke={y2Line.color}
                strokeDasharray={y2Line.dashArray}
                strokeWidth={y2Line.lineWidth}
              />
              <Text x={infoWidth} y={LINE_HEIGHT - 1}>
                {y2}
              </Text>
            </Group>
          </Group>
        </Group>
      </Group>
    );
  }

  renderRange() {
    const {height, data, timeline} = this.props;
    const {rangeX, infoX, width} = this.state;

    if (!isDefined(rangeX) || !isDefined(infoX) || data.length <= 1) {
      return null;
    }

    const xScale = getXScale(data, timeline, width);
    const startX = xScale(rangeX);
    const endX = xScale(infoX);

    const rightDirection = infoX >= rangeX;
    const rangeWidth = rightDirection ? endX - startX : startX - endX;
    return (
      <Group>
        <CrispEdgesLine
          from={{x: startX, y: 0}}
          to={{x: startX, y: maxHeight(height)}}
          stroke={Theme.green}
        />
        <rect
          x={rightDirection ? startX : endX}
          fill={Theme.green}
          opacity={0.125}
          height={maxHeight(height)}
          width={rangeWidth}
        />
      </Group>
    );
  }

  render() {
    const {width} = this.state;
    const {
      data = [],
      height,
      numTicks,
      showLegend = true,
      svgRef,
      timeline = false,
      xAxisLabel,
      yAxisLabel,
      y2AxisLabel,
      yLine,
      y2Line,
      onRangeSelected,
    } = this.props;
    const xScale = getXScale(data, timeline, width);
    const yScale = getYScale(data, height);
    const y2Scale = getY2Scale(data, height);
    const hasValue = data.length > 0;
    const hasValues = data.length > 1;
    const hasOneValue = data.length === 1;
    const hasLines = isDefined(yLine) && isDefined(y2Line);
    const showRange = hasValues && isDefined(onRangeSelected);
    const xAxisTicks = getXAxisTicks(width, numTicks);
    return (
      <Layout align={['start', 'start']}>
        <Svg
          width={width}
          height={height}
          ref={setRef(svgRef, ref => (this.svg = ref))}
          onMouseLeave={hasValue ? this.hideInfo : undefined}
          onMouseEnter={hasValue ? this.showInfo : undefined}
          onMouseMove={hasValue ? this.handleMouseMove : undefined}
          onMouseDown={showRange ? this.startRangeSelection : undefined}
          onMouseUp={showRange ? this.endRangeSelection : undefined}
        >
          <Group top={margin.top} left={margin.left}>
            {isDefined(yLine) && (
              <Axis
                orientation="left"
                scale={yScale}
                top={0}
                left={0}
                label={`${yAxisLabel}`}
                numTicks={10}
              />
            )}
            <Axis
              orientation="bottom"
              scale={xScale}
              top={maxHeight(height)}
              label={`${xAxisLabel}`}
              numTicks={xAxisTicks}
            />
            {y2Line && (
              <Axis
                orientation="right"
                scale={y2Scale}
                top={0}
                left={maxWidth(width)}
                label={`${y2AxisLabel}`}
                numTicks={10}
              />
            )}
            {hasValues && (
              <Group>
                <LinePath
                  data={data}
                  x={d => xValue(d, timeline)}
                  y={d => d.y}
                  stroke={yLine.color}
                  strokeWidth={isDefined(yLine.lineWidth) ? yLine.lineWidth : 1}
                  strokeDasharray={yLine.dashArray}
                  xScale={xScale}
                  yScale={yScale}
                />
                <LinePath
                  data={data}
                  x={d => xValue(d, timeline)}
                  y={d => d.y2}
                  stroke={y2Line.color}
                  strokeWidth={
                    isDefined(y2Line.lineWidth) ? y2Line.lineWidth : 1
                  }
                  strokeDasharray={y2Line.dashArray}
                  xScale={xScale}
                  yScale={y2Scale}
                />
              </Group>
            )}
            {hasOneValue && (
              <Group>
                {isDefined(yLine) && (
                  <Cross
                    x={xScale(xValue(data[0], timeline))}
                    y={yScale(data[0].y)}
                    color={yLine.color}
                    dashArray={yLine.dashArray}
                    lineWidth={yLine.lineWidth}
                  />
                )}
                {isDefined(y2Line) && (
                  <CrossY2
                    x={xScale(xValue(data[0], timeline))}
                    y={y2Scale(data[0].y2)}
                    color={y2Line.color}
                    dashArray={y2Line.dashArray}
                    lineWidth={y2Line.lineWidth}
                  />
                )}
              </Group>
            )}
            {this.renderInfo()}
            {this.renderRange()}
          </Group>
        </Svg>
        {hasLines && showLegend && (
          <Legend ref={this.legendRef} data={[yLine, y2Line]}>
            {({d, toolTipProps}) => (
              <Item {...toolTipProps}>
                <LegendLine
                  color={d.color}
                  lineWidth={d.width}
                  dashArray={d.dashArray}
                />
                <Label>
                  {React.isValidElement(d.label) ? d.label : `${d.label}`}
                </Label>
              </Item>
            )}
          </Legend>
        )}
      </Layout>
    );
  }
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.oneOfType([PropTypes.number, PropTypes.date]).isRequired,
      y: PropTypes.number.isRequired,
      y2: PropTypes.number.isRequired,
    }),
  ),
  height: PropTypes.number.isRequired,
  numTicks: PropTypes.number,
  showLegend: PropTypes.bool,
  svgRef: PropTypes.ref,
  timeline: PropTypes.bool,
  width: PropTypes.number.isRequired,
  xAxisLabel: PropTypes.toString,
  y2AxisLabel: PropTypes.toString,
  y2Line: lineDataPropType,
  yAxisLabel: PropTypes.toString,
  yLine: lineDataPropType,
  onRangeSelected: PropTypes.func,
};

export default LineChart;

// vim: set ts=2 sw=2 tw=80:
