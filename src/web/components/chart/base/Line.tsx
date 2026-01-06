/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {type MouseEvent} from 'react';
import {Line, LinePath} from '@visx/shape';
import {scaleLinear, scaleUtc} from 'd3-scale';
import memoize from 'memoize-one';
import styled from 'styled-components';
import date, {type Date as GmpDate} from 'gmp/models/date';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import Axis from 'web/components/chart/base/Axis';
import Group from 'web/components/chart/base/Group';
import LegendLabel from 'web/components/chart/base/LagendLabel';
import Legend, {
  Item,
  type LegendData,
  type LegendRef,
} from 'web/components/chart/base/Legend';
import LegendLine from 'web/components/chart/base/LegendLine';
import Svg from 'web/components/chart/base/Svg';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/Constants';
import {shouldUpdate} from 'web/components/chart/utils/Update';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';
import {setRef} from 'web/utils/Render';
import Theme from 'web/utils/Theme';

interface LineData {
  x: number | GmpDate;
  y: number;
  y2: number;
  label?: string;
}

interface CrossProps {
  x: number;
  y: number;
  color: ToString;
  dashArray?: string;
  lineWidth?: number;
}

interface LineProps extends LegendData {
  dashArray?: string;
  lineWidth?: number;
  width?: number;
}

interface LineChartProps {
  data: LineData[];
  height: number;
  numTicks?: number;
  showLegend?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
  timeline?: boolean;
  width: number;
  xAxisLabel?: React.ReactNode;
  yAxisLabel?: React.ReactNode;
  y2AxisLabel?: React.ReactNode;
  yLine?: LineProps;
  y2Line?: LineProps;
  onRangeSelected?: (start: LineData, end: LineData) => void;
}

interface LineChartState {
  data?: LineData[];
  displayInfo: boolean;
  infoX?: number | GmpDate;
  mouseX?: number;
  mouseY?: number;
  rangeX?: number | GmpDate;
  width: number;
}

const LEGEND_MARGIN = 20;

const margin = {
  top: 35,
  right: 60,
  bottom: 55,
  left: 60,
} as const;

const MIN_WIDTH = 100 + margin.right + margin.left;
const MIN_TICK_WIDTH = 75;

export const lineDataPropType = PropTypes.shape({
  color: PropTypes.toString.isRequired,
  dashArray: PropTypes.string,
  label: PropTypes.any.isRequired,
  lineWidth: PropTypes.number,
  width: PropTypes.number,
});

const findX =
  (timeline: boolean, value: number | GmpDate) =>
  (d: LineData): d is LineData =>
    timeline ? (d.x as GmpDate).isSame(value) : d.x === value;

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

const xValue = (d: LineData) => Number(d.x);

const maxWidth = memoize((width: number) => width - margin.left - margin.right);

const maxHeight = memoize(
  (height: number) => height - margin.top - margin.bottom,
);

const getXAxisTicks = memoize((width: number, numTicks: number = 10) => {
  while (width / numTicks < MIN_TICK_WIDTH) {
    numTicks--;
  }
  return numTicks;
});

const getXValues = memoize((data: LineData[] = []) => data.map(d => xValue(d)));

const getXMin = memoize((xValues: number[]) => Math.min(...xValues));
const getXMax = memoize((xValues: number[]) => Math.max(...xValues));

const getXScale = memoize(
  (data: LineData[] = [], timeline: boolean = false, width: number) => {
    const xValues = getXValues(data);

    const xMin = getXMin(xValues);
    const xMax = getXMax(xValues);

    let xDomain: [number, number];
    if (timeline) {
      xDomain =
        data.length === 1
          ? [
              Number(date(data[0].x).subtract(1, 'day')),
              Number(date(data[0].x).add(1, 'day')),
            ]
          : [xMin, xMax];
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
  },
);

const getYScale = memoize((data: LineData[] = [], height: number) => {
  const yValues = data.map(d => d.y);
  const yMax = Math.max(...yValues);
  const yDomain = data.length > 1 ? [0, yMax] : [0, yMax * 2];
  return scaleLinear()
    .range([maxHeight(height), 0])
    .domain(yDomain)
    .nice();
});

const getY2Scale = memoize((data: LineData[] = [], height: number) => {
  const y2Values = data.map(d => d.y2);
  const y2Max = Math.max(...y2Values);

  const y2Domain = data.length > 1 ? [0, y2Max] : [0, y2Max * 2];
  return scaleLinear()
    .range([maxHeight(height), 0])
    .domain(y2Domain)
    .nice();
});

const Cross = ({x, y, color, dashArray, lineWidth = 1}: CrossProps) => (
  <Group>
    <Line
      from={{x: x - 5, y: y - 5}}
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      to={{x: x + 5, y: y + 5}}
    />
    <Line
      from={{x: x + 5, y: y - 5}}
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      to={{x: x - 5, y: y + 5}}
    />
  </Group>
);

const CrossY2 = ({x, y, color, dashArray, lineWidth = 1}: CrossProps) => (
  <Group>
    <Line
      from={{x: x - 6, y}}
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      to={{x: x + 6, y}}
    />
    <Line
      from={{x, y: y - 6}}
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      to={{x, y: y + 6}}
    />
  </Group>
);

class LineChart extends React.Component<LineChartProps, LineChartState> {
  legendRef: LegendRef;
  svg: SVGSVGElement | null = null;

  constructor(props: LineChartProps) {
    super(props);

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

  shouldComponentUpdate(nextProps: LineChartProps, nextState: LineChartState) {
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

  showInfo() {
    this.setState({displayInfo: true});
  }

  handleMouseMove(event: MouseEvent<SVGSVGElement>) {
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

  startRangeSelection(event: MouseEvent<SVGSVGElement>) {
    if (!this.svg) {
      return;
    }

    const box = this.svg.getBoundingClientRect();
    const mouseX = event.clientX - box.left - margin.left - 1;

    this.setState({rangeX: this.getXValueForPixel(mouseX)});
  }

  endRangeSelection() {
    const {rangeX, infoX} = this.state;
    const {onRangeSelected, timeline = false, data} = this.props;

    if (onRangeSelected && isDefined(rangeX) && isDefined(infoX)) {
      const direction = infoX >= rangeX;
      const start = {
        ...data.find<LineData>(findX(timeline, rangeX)),
      } as LineData;
      const end = {...data.find<LineData>(findX(timeline, infoX))} as LineData;

      if (direction) {
        onRangeSelected(start, end);
      } else {
        onRangeSelected(end, start);
      }
    }

    this.setState({rangeX: undefined});
  }

  getXValueForPixel(px: number) {
    const {data = [], timeline = false} = this.props;
    const {width} = this.state;

    const xValues = getXValues(data);

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
    const xV = Number(xScale.invert(px)); // x value for pixel position

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
    const {data, height, timeline = false, yLine, y2Line} = this.props;
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
            fill={Theme.mediumGray}
            height={infoHeight + 2 * itemMargin}
            opacity="0.75"
            width={infoWidth + 3 * itemMargin}
            x={0}
            y={0}
          />
          <rect
            fill={Theme.white}
            height={infoHeight + 2 * itemMargin}
            width={15 + 2 * itemMargin}
            x={itemMargin}
            y={0}
          />
          <Group left={2 * itemMargin} textAnchor="end" top={LINE_HEIGHT}>
            <LabelTitle fontWeight="bold" x={infoWidth} y={0}>
              {label}
            </LabelTitle>
            {isDefined(yLine) && (
              <Group>
                <Line
                  from={{x: 0, y: lineY}}
                  stroke={String(yLine.color)}
                  strokeDasharray={yLine.dashArray}
                  strokeWidth={yLine.lineWidth}
                  to={{x: lineLength, y: lineY}}
                />
                <Text x={infoWidth} y={LINE_HEIGHT - 1}>
                  {y}
                </Text>
              </Group>
            )}
            {isDefined(y2Line) && (
              <Group top={LINE_HEIGHT}>
                <Line
                  from={{x: 0, y: lineY}}
                  stroke={String(y2Line.color)}
                  strokeDasharray={y2Line.dashArray}
                  strokeWidth={y2Line.lineWidth}
                  to={{x: lineLength, y: lineY}}
                />
                <Text x={infoWidth} y={LINE_HEIGHT - 1}>
                  {y2}
                </Text>
              </Group>
            )}
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
          stroke={Theme.green}
          to={{x: startX, y: maxHeight(height)}}
        />
        <rect
          fill={Theme.green}
          height={maxHeight(height)}
          opacity={0.125}
          width={rangeWidth}
          x={rightDirection ? startX : endX}
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
          ref={setRef(svgRef, ref => (this.svg = ref))}
          height={height}
          width={width}
          onMouseDown={showRange ? this.startRangeSelection : undefined}
          onMouseEnter={hasValue ? this.showInfo : undefined}
          onMouseLeave={hasValue ? this.hideInfo : undefined}
          onMouseMove={hasValue ? this.handleMouseMove : undefined}
          onMouseUp={showRange ? this.endRangeSelection : undefined}
        >
          <Group left={margin.left} top={margin.top}>
            {isDefined(yLine) && (
              <Axis
                label={`${yAxisLabel}`}
                left={0}
                numTicks={10}
                orientation="left"
                scale={yScale}
                top={0}
              />
            )}
            <Axis
              label={`${xAxisLabel}`}
              numTicks={xAxisTicks}
              orientation="bottom"
              scale={xScale}
              top={maxHeight(height)}
            />
            {isDefined(y2Line) && (
              <Axis
                label={`${y2AxisLabel}`}
                left={maxWidth(width)}
                numTicks={10}
                orientation="right"
                scale={y2Scale}
                top={0}
              />
            )}
            {hasValues && (
              <Group>
                {isDefined(yLine) && (
                  <LinePath
                    data={data}
                    stroke={String(yLine.color)}
                    strokeDasharray={yLine.dashArray}
                    strokeWidth={
                      isDefined(yLine.lineWidth) ? yLine.lineWidth : 1
                    }
                    x={d => xScale(xValue(d))}
                    y={d => yScale(d.y)}
                  />
                )}
                {isDefined(y2Line) && (
                  <LinePath
                    data={data}
                    stroke={String(y2Line.color)}
                    strokeDasharray={y2Line.dashArray}
                    strokeWidth={
                      isDefined(y2Line.lineWidth) ? y2Line.lineWidth : 1
                    }
                    x={d => xScale(xValue(d))}
                    y={d => y2Scale(d.y2)}
                  />
                )}
              </Group>
            )}
            {hasOneValue && (
              <Group>
                {isDefined(yLine) && (
                  <Cross
                    color={yLine.color}
                    dashArray={yLine.dashArray}
                    lineWidth={yLine.lineWidth}
                    x={xScale(xValue(data[0]))}
                    y={yScale(data[0].y)}
                  />
                )}
                {isDefined(y2Line) && (
                  <CrossY2
                    color={y2Line.color}
                    dashArray={y2Line.dashArray}
                    lineWidth={y2Line.lineWidth}
                    x={xScale(xValue(data[0]))}
                    y={y2Scale(data[0].y2)}
                  />
                )}
              </Group>
            )}
            {this.renderInfo()}
            {this.renderRange()}
          </Group>
        </Svg>
        {hasLines && showLegend && (
          <Legend<LineProps> data={[yLine, y2Line]} legendRef={this.legendRef}>
            {({d, toolTipProps}) => (
              <Item
                {...toolTipProps}
                ref={toolTipProps.ref as React.Ref<HTMLDivElement>}
              >
                <LegendLine
                  color={d.color}
                  dashArray={d.dashArray}
                  lineWidth={d.width}
                />
                <LegendLabel>
                  {React.isValidElement(d.label) ? d.label : `${d.label}`}
                </LegendLabel>
              </Item>
            )}
          </Legend>
        )}
      </Layout>
    );
  }
}

export default LineChart;
