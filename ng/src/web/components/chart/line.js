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

import {css} from 'glamor';

import glamorous from 'glamorous';

import {Group} from '@vx/group';
import {AxisLeft, AxisBottom, AxisRight} from '@vx/axis';
import {scaleLinear} from '@vx/scale';
import {Line, LinePath} from '@vx/shape';

import {is_defined} from 'gmp/utils/identity';

import Layout from '../layout/layout';

import PropTypes from '../../utils/proptypes';

import Legend from './legend';
import Theme from '../../utils/theme';

const margin = {
  top: 55,
  right: 60,
  bottom: 25,
  left: 60,
};

const lineCss = css({
  shapeRendering: 'crispEdges',
});

const LINE_HEIGHT = 15;

const DASH_ARRAY = '4, 1';

const Text = glamorous.text({
  fontSize: '13px',
  fill: Theme.white,
});

const Svg = glamorous.svg({
  overflow: 'visible',
  '& text': {
    userSelect: 'none',
  },
});

class LineChart extends React.Component {

   static propTypes = {
    color: PropTypes.toString.isRequired,
    color2: PropTypes.toString.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      y2: PropTypes.number.isRequired,
    })),
    height: PropTypes.number.isRequired,
    legendData: PropTypes.arrayOf(PropTypes.shape({
      color: PropTypes.toString.isRequired,
      label: PropTypes.any.isRequired,
    })),
    width: PropTypes.number.isRequired,
    xLabel: PropTypes.string,
    y2Label: PropTypes.string,
    yLabel: PropTypes.string,
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

  componentWillReceiveProps(next) {
    this.setState(this.updateData(next));
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
    const {onRangeSelected} = this.props;

    if (onRangeSelected) {
      const direction = infoX >= rangeX;
      const start = {...data.find(d => d.x === rangeX)};
      const end = {...data.find(d => d.x === infoX)};

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

    const values = [...xValues].sort(); // sort copy of x values

    const xV = xScale.invert(px); // x value for pixel position

    const index = values.findIndex(x => xV <= x); // get index of the first x value bigger then xV

    const xV1 = values[index]; // get the x value bigger then xV
    const xV2 = values[index - 1]; // get the x value before

    return xV1 - xV < xV - xV2 ? xV1 : xV2; // return nearest value
  }

  updateData({
    data,
    width,
    height,
  }) {
    const maxWidth = width - margin.left - margin.right;
    const maxHeight = height - margin.top - margin.bottom;

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const y2Values = data.map(d => d.y2);
    const yMax = Math.max(...yValues);
    const y2Max = Math.max(...y2Values);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    const xDomain = data.length > 1 ? [xMin, xMax] : [xMin - 1, xMax + 1];
    const xScale = scaleLinear({
      range: [0, maxWidth],
      domain: xDomain,
    });

    const yScale = scaleLinear({
      range: [maxHeight, 0],
      domain: [0, yMax],
      nice: true,
    });

    const y2Scale = scaleLinear({
      range: [maxHeight, 0],
      domain: [0, y2Max],
      nice: true,
    });

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
    };
  }

  renderInfo() {
    const {
      color,
      color2,
    } = this.props;
    const {
      data,
      displayInfo,
      infoX,
      mouseY,
      maxHeight,
      xScale,
    } = this.state;

    if (!displayInfo || !is_defined(infoX)) {
      return null;
    }

    const value = data.find(d => d.x === infoX);
    const x = xScale(infoX);
    const lines = 2;
    const infoWidth = 100;
    const infoHeight = LINE_HEIGHT + lines * LINE_HEIGHT;
    const infoMargin = 5;
    const lineY = LINE_HEIGHT / 2;
    const lineLength = 15;
    return (
      <Group>
        <Line
          from={{x, y: 0}}
          to={{x, y: maxHeight}}
          className={`${lineCss}`}
        />
        <Group
          left={x + 20}
          top={mouseY}
        >
          <rect
            x={0}
            y={0}
            width={infoWidth + 3 * infoMargin}
            height={infoHeight + 2 * infoMargin}
            fill={Theme.mediumGray}
            opacity="0.75"
          >
          </rect>
          <rect
            x={infoMargin}
            y={0}
            width={15 + 2 * infoMargin}
            height={infoHeight + 2 * infoMargin}
            fill={Theme.white}
          />
          <Group
            top={LINE_HEIGHT}
            left={2 * infoMargin}
            textAnchor="end"
          >
            <Text
              x={infoWidth}
              y={0}
              fontWeight="bold"
            >
              {value.label}
            </Text>
            <Text
              x={infoWidth}
              y={LINE_HEIGHT - 1}
            >
              {value.y}
            </Text>
            <Text
              x={infoWidth}
              y={2 * LINE_HEIGHT - 1}
            >
              {value.y2}
            </Text>
            <Line
              from={{x: 0, y: lineY}}
              to={{x: lineLength, y: lineY}}
              stroke={color}
            />
            <Line
              from={{x: 0, y: LINE_HEIGHT + lineY}}
              to={{x: lineLength, y: LINE_HEIGHT + lineY}}
              stroke={color2}
              strokeDasharray={DASH_ARRAY}
            />
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
    } = this.state;
    const {
      height,
      width,
      xLabel,
      yLabel,
      y2Label,
      color,
      color2,
      legendData,
    } = this.props;
    const hasValues = data.length > 1;
    const hasOneValue = data.length === 1;
    return (
      <Layout align={['start', 'start']}>
        <Svg
          width={width}
          height={height}
          innerRef={ref => this.svg = ref}
          onMouseLeave={this.hideInfo}
          onMouseEnter={this.showInfo}
          onMouseMove={this.handleMouseMove}
          onMouseDown={hasValues ? this.startRangeSelection : undefined}
          onMouseUp={hasValues ? this.endRangeSelection : undefined}
        >
          <Group
            top={margin.top}
            left={margin.left}
          >
            <AxisLeft
              axisLineClassName={`${lineCss}`}
              tickClassName={`${lineCss}`}
              scale={yScale}
              top={0}
              left={0}
              label={yLabel}
              numTicks={10}
              rangePadding={-8} // - tickLength
            />
            <AxisBottom
              axisLineClassName={`${lineCss}`}
              tickClassName={`${lineCss}`}
              scale={xScale}
              top={maxHeight}
              label={xLabel}
              rangePadding={8} // tickLength
            />
            <AxisRight
              axisLineClassName={`${lineCss}`}
              tickClassName={`${lineCss}`}
              scale={y2Scale}
              top={0}
              left={maxWidth}
              label={y2Label}
              numTicks={10}
              rangePadding={-8} // - tickLength
            />
            {hasValues &&
              <Group>
                <LinePath
                  data={data}
                  x={d => d.x}
                  y={d => d.y}
                  stroke={color}
                  strokeWidth={1}
                  xScale={xScale}
                  yScale={yScale}
                />
                <LinePath
                  data={data}
                  x={d => d.x}
                  y={d => d.y2}
                  stroke={color2}
                  strokeWidth={1}
                  strokeDasharray={DASH_ARRAY}
                  xScale={xScale}
                  yScale={y2Scale}
                />
              </Group>
            }
            {hasOneValue &&
              <Group>
                <circle
                  cx={xScale(data[0].x)}
                  cy={yScale(data[0].y)}
                  fill={color}
                  r={5}
                />
                <circle
                  cx={xScale(data[0].x)}
                  cy={y2Scale(data[0].y2)}
                  fill={color2}
                  r={5}
                />
              </Group>
            }
            {this.renderInfo()}
            {this.renderRange()}
          </Group>
        </Svg>
        {is_defined(legendData) &&
          <Legend data={legendData}/>
        }
      </Layout>
    );
  }
}


export default LineChart;

// vim: set ts=2 sw=2 tw=80:
