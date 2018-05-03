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

import {css} from 'glamor';

import glamorous from 'glamorous';

import {scaleLinear, scaleUtc} from 'd3-scale';

import {Line, LinePath} from '@vx/shape';

import {is_defined} from 'gmp/utils/identity';

import Layout from '../layout/layout';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';
import {setRef} from '../../utils/render';

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

const findX = (timeline, value) => d => timeline ?
  d.x.isSame(value) : d.x === value;

const lineCss = css({
  shapeRendering: 'crispEdges',
});

const LINE_HEIGHT = 15;

const Text = glamorous.text({
  fontSize: '12px',
  fill: Theme.white,
});

const LabelTitle = glamorous.text({
  fontSize: '13px',
  fill: Theme.white,
  fontFamily: 'monospace',
});

const lineDataPropType = PropTypes.shape({
  label: PropTypes.any.isRequired,
  color: PropTypes.toString.isRequired,
  width: PropTypes.number,
  dashArray: PropTypes.string,
});

const Cross = ({
  x,
  y,
  color,
  dashArray,
  lineWidth = 1,
}) => (
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

Cross.propTypes = {
  color: PropTypes.toString.isRequired,
  dashArray: PropTypes.toString,
  lineWidth: PropTypes.number,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

class LineChart extends React.Component {

   static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.momentDate,
      ]).isRequired,
      y: PropTypes.number.isRequired,
      y2: PropTypes.number.isRequired,
    })),
    displayLegend: PropTypes.bool,
    height: PropTypes.number.isRequired,
    numTicks: PropTypes.number,
    svgRef: PropTypes.ref,
    timeline: PropTypes.bool,
    width: PropTypes.number.isRequired,
    xAxisLabel: PropTypes.string,
    y2AxisLabel: PropTypes.string,
    y2Line: lineDataPropType,
    yAxisLabel: PropTypes.string,
    yLine: lineDataPropType,
    onRangeSelected: PropTypes.func,
  };

  constructor(...args) {
    super(...args);

    this.state = {
      displayInfo: false,
      ...this.updateData(this.props),
    };

    this.hideInfo = this.hideInfo.bind(this);
    this.showInfo = this.showInfo.bind(this);

    this.startRangeSelection = this.startRangeSelection.bind(this);
    this.endRangeSelection = this.endRangeSelection.bind(this);

    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentDidMount() {
    this.setState(this.updateData(this.props));
  }

  componentWillReceiveProps(next) {
    const {width, height, data} = this.props;

    if (width !== next.width || height !== next.height || data !== next.data) {
      this.setState(this.updateData(next));
    }
  }

  hideInfo() {
    this.setState({displayInfo: false});
  }

  showInfo(event) {
    this.setState({displayInfo: true});
  }

  handleMouseMove(event) {
    const box = this.svg.getBoundingClientRect();
    const mouseX = event.clientX - box.left -
      margin.left - 1;
    const mouseY = event.clientY - box.top -
      margin.top - 1;

    this.setState({
      infoX: this.getXValueForPixel(mouseX),
      mouseY,
    });
  }

  startRangeSelection(event) {
    const box = this.svg.getBoundingClientRect();
    const mouseX = event.clientX - box.left -
      margin.left - 1;

    this.setState({rangeX: this.getXValueForPixel(mouseX)});
  }

  endRangeSelection(event) {
    const {rangeX, infoX, data} = this.state;
    const {onRangeSelected, timeline = false} = this.props;

    if (onRangeSelected) {
      const direction = infoX >= rangeX;
      const start = {...data.find(findX(timeline, rangeX))};
      const end = {...data.find(findX(timeline, infoX))};

      if (direction) {
        onRangeSelected(start, end);
      }
      else {
        onRangeSelected(end, start);
      }
    }

    this.setState({rangeX: undefined});
  }

  getXValueForPixel(px) {
    const {maxWidth, xMax, xMin, xValues, xScale} = this.state;

    if (xValues.length === 1) {
      return xValues[0];
    }

    if (px >= maxWidth) {
      return xMax;
    }

    if (px <= 0) {
      return xMin;
    }

    const values = [...xValues].sort((a, b) => a - b); // sort copy of x values

    const xV = xScale.invert(px); // x value for pixel position

    const index = values.findIndex(x => xV <= x); // get index of the first x value bigger then xV

    const xV1 = values[index]; // get the x value bigger then xV
    const xV2 = values[index - 1]; // get the x value before

    return xV1 - xV < xV - xV2 ? xV1 : xV2; // return nearest value
  }

  updateData({
    data = [],
    width,
    height,
    timeline = false,
  }) {
    if (this.legend) {
      const {width: legendWidth} = this.legend.getBoundingClientRect();
      width = width - legendWidth - LEGEND_MARGIN;
    }

    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    const xValues = data.map(d => timeline ? d.x.toDate() : d.x);
    const yValues = data.map(d => d.y);
    const y2Values = data.map(d => d.y2);
    const yMax = Math.max(...yValues);
    const y2Max = Math.max(...y2Values);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    let xDomain;
    if (timeline) {
      xDomain = data.length > 1 ?
        [xMin, xMax] :
        [
          moment(xMin).subtract(1, 'day').toDate(),
          moment(xMax).add(1, 'day').toDate(),
        ];
    }
    else {
      xDomain = data.length > 1 ?
        [xMin, xMax] :
        [xMin - 1, xMax + 1];
    }

    const xScale = timeline ?
      scaleUtc()
        .range([0, maxWidth])
        .domain(xDomain) :
      scaleLinear()
        .range([0, maxWidth])
        .domain(xDomain);

    const yScale = scaleLinear()
      .range([maxHeight, 0])
      .domain([0, yMax])
      .nice(true);

    // change y2Domain only to not overlap single data points for y and y2
    const y2Domain = data.length > 1 ? [0, y2Max] : [0, y2Max * 2];
    const y2Scale = scaleLinear()
      .range([maxHeight, 0])
      .domain(y2Domain)
      .nice(true);

    return {
      data,
      xScale,
      yScale,
      y2Scale,
      maxHeight,
      maxWidth,
      xValues,
      xMin,
      xMax,
      width,
      height,
    };
  }

  renderInfo() {
    const {
      timeline,
      yLine,
      y2Line,
    } = this.props;
    const {
      data,
      displayInfo,
      infoX,
      mouseY,
      maxHeight,
      xScale,
    } = this.state;

    const lines = (is_defined(yLine) ? 1 : 0) + (is_defined(y2Line) ? 1 : 0);

    if (!displayInfo || !is_defined(infoX) || lines === 0) {
      return null;
    }

    const value = data.find(findX(timeline, infoX));
    if (!is_defined(value)) {
      return null;
    }

    const {label = '', y, y2} = value;

    const x = xScale(infoX);
    const infoWidth = Math.max(label.length * 8 + 20, 100); // 8px per letter is just an assumption
    const infoHeight = LINE_HEIGHT + lines * LINE_HEIGHT;
    const itemMargin = 5;
    const lineY = LINE_HEIGHT / 2;
    const lineLength = 15;
    const infoMargin = 20;
    return (
      <Group>
        <Line
          from={{x, y: 0}}
          to={{x, y: maxHeight}}
          className={`${lineCss}`}
        />
        <Group
          left={x + infoMargin}
          top={mouseY}
        >
          <rect
            x={0}
            y={0}
            width={infoWidth + 3 * itemMargin}
            height={infoHeight + 2 * itemMargin}
            fill={Theme.mediumGray}
            opacity="0.75"
          >
          </rect>
          <rect
            x={itemMargin}
            y={0}
            width={15 + 2 * itemMargin}
            height={infoHeight + 2 * itemMargin}
            fill={Theme.white}
          />
          <Group
            top={LINE_HEIGHT}
            left={2 * itemMargin}
            textAnchor="end"
          >
            <LabelTitle
              x={infoWidth}
              y={0}
              fontWeight="bold"
            >
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
              <Text
                x={infoWidth}
                y={LINE_HEIGHT - 1}
              >
                {y}
              </Text>
            </Group>
            <Group
              top={LINE_HEIGHT}
            >
              <Line
                from={{x: 0, y: lineY}}
                to={{x: lineLength, y: lineY}}
                stroke={y2Line.color}
                strokeDasharray={y2Line.dashArray}
                strokeWidth={y2Line.lineWidth}
              />
              <Text
                x={infoWidth}
                y={LINE_HEIGHT - 1}
              >
                {y2}
              </Text>
            </Group>
          </Group>
        </Group>
      </Group>
    );
  }

  renderRange() {
    const {
      rangeX,
      infoX,
      xScale,
      maxHeight,
      xValues,
    } = this.state;

    if (!is_defined(rangeX) || !is_defined(infoX) || xValues.length <= 1) {
      return null;
    }

    const startX = xScale(rangeX);
    const endX = xScale(infoX);

    const rightDirection = infoX >= rangeX;
    const rangeWidth = rightDirection ? endX - startX : startX - endX;
    return (
      <Group>
        <Line
          from={{x: startX, y: 0}}
          to={{x: startX, y: maxHeight}}
          stroke={Theme.green}
          className={`${lineCss}`}
        />
        <rect
          x={rightDirection ? startX : endX}
          fill={Theme.green}
          opacity={0.125}
          height={maxHeight}
          width={rangeWidth}
        />
      </Group>
    );
  }

  render() {
    const {
      data,
      xScale,
      yScale,
      y2Scale,
      maxHeight,
      maxWidth,
      height,
      width,
    } = this.state;
    const {
      displayLegend = true,
      numTicks,
      svgRef,
      xAxisLabel,
      yAxisLabel,
      y2AxisLabel,
      yLine,
      y2Line,
    } = this.props;
    const hasValue = data.length > 0;
    const hasValues = data.length > 1;
    const hasOneValue = data.length === 1;
    const hasLines = is_defined(yLine) && is_defined(y2Line);
    return (
      <Layout align={['start', 'start']}>
        <Svg
          width={width}
          height={height}
          innerRef={setRef(svgRef, ref => this.svg = ref)}
          onMouseLeave={hasValue ? this.hideInfo : undefined}
          onMouseEnter={hasValue ? this.showInfo : undefined}
          onMouseMove={hasValue ? this.handleMouseMove : undefined}
          onMouseDown={hasValues ? this.startRangeSelection : undefined}
          onMouseUp={hasValues ? this.endRangeSelection : undefined}
        >
          <Group
            top={margin.top}
            left={margin.left}
          >
            {is_defined(yLine) &&
              <Axis
                orientation="left"
                scale={yScale}
                top={0}
                left={0}
                label={yAxisLabel}
                numTicks={10}
              />
            }
            <Axis
              orientation="bottom"
              scale={xScale}
              top={maxHeight}
              label={xAxisLabel}
              numTicks={numTicks}
            />
            {y2Line &&
              <Axis
                orientation="right"
                scale={y2Scale}
                top={0}
                left={maxWidth}
                label={y2AxisLabel}
                numTicks={10}
              />
            }
            {hasValues &&
              <Group>
                <LinePath
                  data={data}
                  x={d => d.x}
                  y={d => d.y}
                  stroke={yLine.color}
                  strokeWidth={
                    is_defined(yLine.lineWidth) ?
                      yLine.lineWidth : 1
                  }
                  strokeDasharray={yLine.dashArray}
                  xScale={xScale}
                  yScale={yScale}
                />
                <LinePath
                  data={data}
                  x={d => d.x}
                  y={d => d.y2}
                  stroke={y2Line.color}
                  strokeWidth={
                    is_defined(y2Line.lineWidth) ?
                      y2Line.lineWidth : 1
                  }
                  strokeDasharray={y2Line.dashArray}
                  xScale={xScale}
                  yScale={y2Scale}
                />
              </Group>
            }
            {hasOneValue &&
              <Group>
                {is_defined(yLine) &&
                  <Cross
                    x={xScale(data[0].x)}
                    y={yScale(data[0].y)}
                    color={yLine.color}
                    dashArray={yLine.dashArray}
                    lineWidth={yLine.lineWidth}
                  />
                }
                {is_defined(y2Line) &&
                  <Cross
                    x={xScale(data[0].x)}
                    y={y2Scale(data[0].y2)}
                    color={y2Line.color}
                    dashArray={y2Line.dashArray}
                    lineWidth={y2Line.lineWidth}
                  />
                }
              </Group>
            }
            {this.renderInfo()}
            {this.renderRange()}
          </Group>
        </Svg>
        {hasLines && displayLegend &&
          <Legend
            innerRef={ref => this.legend = ref}
            data={[yLine, y2Line]}
          >
            {({d, toolTipProps}) => (
              <Item {...toolTipProps}>
                <LegendLine
                  color={d.color}
                  lineWidth={d.width}
                  dashArray={d.dashArray}
                />
                <Label>{d.label}</Label>
              </Item>
            )}
          </Legend>
        }
      </Layout>
    );
  }
}

export default LineChart;

// vim: set ts=2 sw=2 tw=80:
