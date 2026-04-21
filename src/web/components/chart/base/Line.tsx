/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {scaleLinear, scaleUtc} from 'd3-scale';
import {line as d3Line} from 'd3-shape';
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
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';
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
  xAxisLabel?: ToString;
  yAxisLabel?: ToString;
  y2AxisLabel?: ToString;
  yLine?: LineProps;
  y2Line?: LineProps;
  onRangeSelected?: (start: LineData, end: LineData) => void;
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

/** @deprecated Use TypeScript types instead */
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

const CrispEdgesLine = styled.line`
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
  (data: LineData[], timeline: boolean, width: number) => {
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

const getYScale = memoize((data: LineData[], height: number) => {
  const yValues = data.map(d => d.y);
  const yMax = Math.max(...yValues);
  const yDomain = data.length > 1 ? [0, yMax] : [0, yMax * 2];
  return scaleLinear()
    .range([maxHeight(height), 0])
    .domain(yDomain)
    .nice();
});

const getY2Scale = memoize((data: LineData[], height: number) => {
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
    <line
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      x1={x - 5}
      x2={x + 5}
      y1={y - 5}
      y2={y + 5}
    />
    <line
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      x1={x + 5}
      x2={x - 5}
      y1={y - 5}
      y2={y + 5}
    />
  </Group>
);

const CrossY2 = ({x, y, color, dashArray, lineWidth = 1}: CrossProps) => (
  <Group>
    <line
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      x1={x - 6}
      x2={x + 6}
      y1={y}
      y2={y}
    />
    <line
      stroke={String(color)}
      strokeDasharray={dashArray}
      strokeWidth={lineWidth}
      x1={x}
      x2={x}
      y1={y - 6}
      y2={y + 6}
    />
  </Group>
);

const LineChart = ({
  data = [],
  height,
  numTicks,
  showLegend = true,
  svgRef,
  timeline = false,
  width: propWidth,
  xAxisLabel,
  yAxisLabel,
  y2AxisLabel,
  yLine,
  y2Line,
  onRangeSelected,
}: LineChartProps) => {
  const legendRef: LegendRef = useRef(null);
  const svgElementRef = useRef<SVGSVGElement | null>(null);

  const [displayInfo, setDisplayInfo] = useState(false);
  const [infoX, setInfoX] = useState<number | GmpDate | undefined>();
  const [mouseY, setMouseY] = useState<number | undefined>();
  const [rangeX, setRangeX] = useState<number | GmpDate | undefined>();
  const [chartWidth, setChartWidth] = useState<number>(MIN_WIDTH);

  const getCalculatedWidth = useCallback(() => {
    let w = propWidth - MENU_PLACEHOLDER_WIDTH;
    const {current: legend} = legendRef;

    if (legend !== null) {
      const {width: legendWidth} = legend.getBoundingClientRect();
      w = w - legendWidth - LEGEND_MARGIN;
    }

    if (w < MIN_WIDTH) {
      w = MIN_WIDTH;
    }

    return w;
  }, [propWidth]);

  useEffect(() => {
    const newWidth = getCalculatedWidth();
    if (newWidth !== chartWidth) {
      setChartWidth(newWidth);
    }
  }, [getCalculatedWidth, chartWidth]);

  const getXValueForPixel = useCallback(
    (px: number, currentWidth: number) => {
      const xValues = getXValues(data);

      if (xValues.length === 1) {
        return xValues[0];
      }

      if (px >= maxWidth(currentWidth)) {
        return getXMax(xValues);
      }

      if (px <= 0) {
        return getXMin(xValues);
      }

      const values = [...xValues].sort((a, b) => a - b);

      const xScale = getXScale(data, timeline, currentWidth);
      const xV = Number(xScale.invert(px));

      const index = values.findIndex(x => xV <= x);

      const xV1 = values[index];
      const xV2 = values[index - 1];

      return xV1 - xV < xV - xV2 ? xV1 : xV2;
    },
    [data, timeline],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (!svgElementRef.current) {
        return;
      }

      const box = svgElementRef.current.getBoundingClientRect();
      const mouseX = event.clientX - box.left - margin.left - 1;
      const newMouseY = event.clientY - box.top - margin.top - 1;

      setInfoX(getXValueForPixel(mouseX, chartWidth));
      setMouseY(newMouseY);
    },
    [chartWidth, getXValueForPixel],
  );

  const startRangeSelection = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (!svgElementRef.current) {
        return;
      }

      const box = svgElementRef.current.getBoundingClientRect();
      const mouseX = event.clientX - box.left - margin.left - 1;

      setRangeX(getXValueForPixel(mouseX, chartWidth));
    },
    [chartWidth, getXValueForPixel],
  );

  const endRangeSelection = useCallback(() => {
    if (onRangeSelected && isDefined(rangeX) && isDefined(infoX)) {
      const direction = infoX >= rangeX;
      const startPoint = {
        ...data.find<LineData>(findX(timeline, rangeX)),
      } as LineData;
      const endPoint = {
        ...data.find<LineData>(findX(timeline, infoX)),
      } as LineData;

      if (direction) {
        onRangeSelected(startPoint, endPoint);
      } else {
        onRangeSelected(endPoint, startPoint);
      }
    }

    setRangeX(undefined);
  }, [data, infoX, onRangeSelected, rangeX, timeline]);

  const hideInfo = useCallback(() => setDisplayInfo(false), []);
  const showInfo = useCallback(() => setDisplayInfo(true), []);

  const handleSvgRef = useCallback(
    (ref: SVGSVGElement | null) => {
      svgElementRef.current = ref;
      if (typeof svgRef === 'function') {
        svgRef(ref);
      } else if (svgRef && typeof svgRef === 'object') {
        (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = ref;
      }
    },
    [svgRef],
  );

  const xScale = getXScale(data, timeline, chartWidth);
  const yScale = getYScale(data, height);
  const y2Scale = getY2Scale(data, height);
  const hasValue = data.length > 0;
  const hasValues = data.length > 1;
  const hasOneValue = data.length === 1;
  const hasLines = isDefined(yLine) && isDefined(y2Line);
  const showRange = hasValues && isDefined(onRangeSelected);
  const xAxisTicks = getXAxisTicks(chartWidth, numTicks);

  const renderInfo = () => {
    const lines = (isDefined(yLine) ? 1 : 0) + (isDefined(y2Line) ? 1 : 0);

    if (!displayInfo || !isDefined(infoX) || lines === 0) {
      return null;
    }

    const value = data.find(findX(timeline, infoX));
    if (!isDefined(value)) {
      return null;
    }

    const {label = '', y, y2} = value;

    const x = xScale(infoX);
    const infoWidth = Math.max(label.length * 8 + 20, 100);
    const infoHeight = LINE_HEIGHT + lines * LINE_HEIGHT;
    const itemMargin = 5;
    const lineY = LINE_HEIGHT / 2;
    const lineLength = 15;
    const infoMargin = 20;
    return (
      <Group>
        <CrispEdgesLine x1={x} x2={x} y1={0} y2={maxHeight(height)} />
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
                <line
                  stroke={String(yLine.color)}
                  strokeDasharray={yLine.dashArray}
                  strokeWidth={yLine.lineWidth}
                  x1={0}
                  x2={lineLength}
                  y1={lineY}
                  y2={lineY}
                />
                <Text x={infoWidth} y={LINE_HEIGHT - 1}>
                  {y}
                </Text>
              </Group>
            )}
            {isDefined(y2Line) && (
              <Group top={LINE_HEIGHT}>
                <line
                  stroke={String(y2Line.color)}
                  strokeDasharray={y2Line.dashArray}
                  strokeWidth={y2Line.lineWidth}
                  x1={0}
                  x2={lineLength}
                  y1={lineY}
                  y2={lineY}
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
  };

  const renderRange = () => {
    if (!isDefined(rangeX) || !isDefined(infoX) || data.length <= 1) {
      return null;
    }

    const startX = xScale(rangeX);
    const endX = xScale(infoX);

    const rightDirection = infoX >= rangeX;
    const rangeWidth = rightDirection ? endX - startX : startX - endX;
    return (
      <Group>
        <CrispEdgesLine
          stroke={Theme.green}
          x1={startX}
          x2={startX}
          y1={0}
          y2={maxHeight(height)}
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
  };

  return (
    <Layout align={['start', 'start']}>
      <Svg
        ref={handleSvgRef}
        height={height}
        width={chartWidth}
        onMouseDown={showRange ? startRangeSelection : undefined}
        onMouseEnter={hasValue ? showInfo : undefined}
        onMouseLeave={hasValue ? hideInfo : undefined}
        onMouseMove={hasValue ? handleMouseMove : undefined}
        onMouseUp={showRange ? endRangeSelection : undefined}
      >
        <Group left={margin.left} top={margin.top}>
          {isDefined(yLine) && (
            <Axis
              label={String(yAxisLabel)}
              left={0}
              numTicks={10}
              orientation="left"
              scale={yScale}
              top={0}
            />
          )}
          <Axis
            label={String(xAxisLabel)}
            numTicks={xAxisTicks}
            orientation="bottom"
            scale={xScale}
            top={maxHeight(height)}
          />
          {isDefined(y2Line) && (
            <Axis
              label={String(y2AxisLabel)}
              left={maxWidth(chartWidth)}
              numTicks={10}
              orientation="right"
              scale={y2Scale}
              top={0}
            />
          )}
          {hasValues && (
            <Group>
              {isDefined(yLine) && (
                <path
                  d={
                    d3Line<LineData>()
                      .x(d => xScale(xValue(d)))
                      .y(d => yScale(d.y))(data) ?? ''
                  }
                  fill="none"
                  stroke={String(yLine.color)}
                  strokeDasharray={yLine.dashArray}
                  strokeWidth={isDefined(yLine.lineWidth) ? yLine.lineWidth : 1}
                />
              )}
              {isDefined(y2Line) && (
                <path
                  d={
                    d3Line<LineData>()
                      .x(d => xScale(xValue(d)))
                      .y(d => y2Scale(d.y2))(data) ?? ''
                  }
                  fill="none"
                  stroke={String(y2Line.color)}
                  strokeDasharray={y2Line.dashArray}
                  strokeWidth={
                    isDefined(y2Line.lineWidth) ? y2Line.lineWidth : 1
                  }
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
          {renderInfo()}
          {renderRange()}
        </Group>
      </Svg>
      {hasLines && showLegend && (
        <Legend<LineProps> data={[yLine, y2Line]} legendRef={legendRef}>
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
};

export default LineChart;
