/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useState, type ReactNode} from 'react';
import {scaleBand, scaleLinear} from 'd3-scale';
import styled from 'styled-components';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import Axis from 'web/components/chart/base/Axis';
import ChartWithEmptyState from 'web/components/chart/base/ChartWithEmptyState';
import Group from 'web/components/chart/base/Group';
import Svg from 'web/components/chart/base/Svg';
import ToolTip from 'web/components/chart/base/ToolTip';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/constants';
import Layout from 'web/components/layout/Layout';

export interface BarChartDataPoint {
  color: ToString;
  toolTip?: ReactNode;
  x: ToString;
  y: number;
}

export interface BarChartProps<TData extends BarChartDataPoint> {
  data: TData[];
  height: number;
  horizontal?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
  width: number;
  xLabel?: string;
  yLabel?: string;
  onDataClick?: (dataPoint: TData) => void;
}

const StyledLayout = styled(Layout)`
  overflow: hidden;
`;

const margin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 60,
};

const MAX_LABEL_LENGTH = 25;
const LABEL_HEIGHT = 20;
const MIN_WIDTH = 250;
const APPROXIMATE_CHARACTER_WIDTH = 6;
const AXIS_LABEL_GAP = 17;

const tickFormat = (val: number | string | Date) => {
  const valStr = String(val);
  if (valStr.length > MAX_LABEL_LENGTH) {
    // prevent cycling through the string
    return '...' + valStr.slice(valStr.length - MAX_LABEL_LENGTH);
  }
  return valStr;
};

const getWidth = (width: number): number => {
  width -= MENU_PLACEHOLDER_WIDTH;
  return Math.max(width, MIN_WIDTH);
};

const BarChart = <TData extends BarChartDataPoint>({
  data = [],
  height,
  xLabel = '',
  yLabel = '',
  horizontal = false,
  svgRef,
  onDataClick,
  width,
}: BarChartProps<TData>) => {
  const [chartWidth, setChartWidth] = useState(() => getWidth(width));

  useEffect(() => {
    const nextWidth = getWidth(width);
    setChartWidth(currentWidth =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, [data, width]);

  const xValues = data.map(d => String(d.x));
  const yValues = data.map(d => d.y);
  const yMax = Math.max(...yValues);

  const maxLabelLength = Math.max(
    ...xValues.map(val => String(val).length),
    MAX_LABEL_LENGTH,
  );

  // adjust left margin for label length on horizontal bars
  // 4px for each letter is just a randomly chosen value
  const verticalMaxWidth = chartWidth - margin.left - margin.right;
  const maxTickLabelWidth = Math.max(
    ...xValues.map(
      value => tickFormat(value).length * APPROXIMATE_CHARACTER_WIDTH,
    ),
    0,
  );
  const crowdedCategoryLabels =
    !horizontal &&
    xValues.length > 0 &&
    maxTickLabelWidth > verticalMaxWidth / xValues.length;
  const isHorizontal = horizontal || crowdedCategoryLabels;

  const marginLeft = isHorizontal
    ? margin.left + Math.min(MAX_LABEL_LENGTH, maxLabelLength) * 4
    : margin.left;

  const maxWidth = chartWidth - marginLeft - margin.right;
  let maxHeight = height - margin.top - margin.bottom;

  if (isDefined(xLabel)) {
    // adjust height for x axis label
    maxHeight = maxHeight - LABEL_HEIGHT;
  }

  const xScale = scaleBand<string>()
    .rangeRound(isHorizontal ? [maxHeight, 0] : [0, maxWidth])
    .domain(xValues)
    .padding(0.125);

  const yScale = scaleLinear()
    .range(isHorizontal ? [0, maxWidth] : [maxHeight, 0])
    .domain([0, Math.abs(yMax) > 0 ? yMax : 10])

    /*
        nice seems to round first and last value.
        see https://github.com/d3/d3-scale/blob/master/README.md#continuous_nice
        the old version did call nice(10) which isn't possible with vx at the moment.
      */
    .nice();

  const tickValues = isHorizontal ? yScale.ticks(10) : xScale.domain();
  return (
    <StyledLayout align={['start', 'start']}>
      <Svg ref={svgRef} height={height} width={chartWidth}>
        <ChartWithEmptyState
          data-testid="bar-chart-empty"
          height={height}
          isEmpty={data.length === 0}
          width={chartWidth}
        >
          <Group left={marginLeft} top={margin.top}>
            <Axis
              dataTestId="bar-chart-y-axis"
              label={String(yLabel)}
              labelOffset={
                isHorizontal ? maxTickLabelWidth + AXIS_LABEL_GAP : undefined
              }
              left={0}
              numTicks={10}
              orientation="left"
              scale={isHorizontal ? xScale : yScale}
              tickFormat={isHorizontal ? tickFormat : undefined}
              top={0}
            />
            <Axis
              dataTestId="bar-chart-x-axis"
              label={String(xLabel)}
              orientation="bottom"
              scale={isHorizontal ? yScale : xScale}
              tickValues={tickValues}
              top={maxHeight}
            />
            {data.map((d, index) => (
              <ToolTip key={`${String(d.x)}-${index}`} content={d.toolTip}>
                {({targetRef, hide, show}) => (
                  <Group
                    onClick={
                      isDefined(onDataClick) ? () => onDataClick(d) : undefined
                    }
                  >
                    <rect
                      ref={targetRef as React.Ref<SVGRectElement>}
                      fill={String(d.color)}
                      height={
                        isHorizontal
                          ? xScale.bandwidth()
                          : maxHeight - yScale(d.y)
                      }
                      rx="4"
                      ry="4"
                      width={isHorizontal ? yScale(d.y) : xScale.bandwidth()}
                      x={isHorizontal ? 1 : xScale(String(d.x))}
                      y={isHorizontal ? xScale(String(d.x)) : yScale(d.y)}
                      onMouseEnter={show}
                      onMouseLeave={hide}
                    />
                  </Group>
                )}
              </ToolTip>
            ))}
          </Group>
        </ChartWithEmptyState>
      </Svg>
    </StyledLayout>
  );
};

export default BarChart;
