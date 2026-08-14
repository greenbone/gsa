/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useRef, useState} from 'react';
import {scaleBand, scaleLinear} from 'd3-scale';
import styled from 'styled-components';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import Axis from 'web/components/chart/base/Axis';
import Group from 'web/components/chart/base/Group';
import Legend, {
  type LegendData,
  type LegendRef,
} from 'web/components/chart/base/Legend';
import Svg from 'web/components/chart/base/Svg';
import ToolTip from 'web/components/chart/base/Tooltip';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/Constants';
import Layout from 'web/components/layout/Layout';

export interface BarChartDataPoint extends LegendData {
  x: ToString;
  y: number;
}

export interface BarChartProps<TData extends BarChartDataPoint> {
  data: TData[];
  height: number;
  horizontal?: boolean;
  showLegend?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
  width: number;
  xLabel?: string;
  yLabel?: string;
  onDataClick?: (dataPoint: TData) => void;
  onLegendItemClick?: (dataPoint: TData) => void;
}

const StyledLayout = styled(Layout)`
  overflow: hidden;
`;

const LEGEND_MARGIN = 20;

const margin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 60,
};

const MAX_LABEL_LENGTH = 25;
const LABEL_HEIGHT = 20;
const MIN_WIDTH = 250;
const MIN_TICK_WIDTH = 20;

const tickFormat = (val: number | string | Date) => {
  const valStr = String(val);
  if (valStr.length > MAX_LABEL_LENGTH) {
    // prevent cycling through the string
    return '...' + valStr.slice(valStr.length - MAX_LABEL_LENGTH);
  }
  return valStr;
};

const getWidth = (width: number, legend: HTMLElement | null): number => {
  width -= MENU_PLACEHOLDER_WIDTH;

  if (legend !== null) {
    width -= legend.getBoundingClientRect().width + LEGEND_MARGIN;
  }

  return Math.max(width, MIN_WIDTH);
};

const BarChart = <TData extends BarChartDataPoint>({
  data = [],
  showLegend = true,
  height,
  xLabel = '',
  yLabel = '',
  horizontal = false,
  svgRef,
  onDataClick,
  onLegendItemClick,
  width,
}: BarChartProps<TData>) => {
  const legendRef: LegendRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(() => getWidth(width, null));

  useEffect(() => {
    const nextWidth = getWidth(width, legendRef.current);
    setChartWidth(currentWidth =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, [data, showLegend, width]);

  const xValues = data.map(d => String(d.x));
  const yValues = data.map(d => d.y);
  const yMax = Math.max(...yValues);

  const maxLabelLength = Math.max(
    ...xValues.map(val => String(val).length),
    MAX_LABEL_LENGTH,
  );

  // adjust left margin for label length on horizontal bars
  // 4px for each letter is just a randomly chosen value
  const marginLeft = horizontal
    ? margin.left + Math.min(MAX_LABEL_LENGTH, maxLabelLength) * 4
    : margin.left;

  const maxWidth = chartWidth - marginLeft - margin.right;
  let maxHeight = height - margin.top - margin.bottom;

  if (isDefined(xLabel)) {
    // adjust height for x axis label
    maxHeight = maxHeight - LABEL_HEIGHT;
  }

  const xScale = scaleBand<string>()
    .rangeRound(horizontal ? [maxHeight, 0] : [0, maxWidth])
    .domain(xValues)
    .padding(0.125);

  const yScale = scaleLinear()
    .range(horizontal ? [0, maxWidth] : [maxHeight, 0])
    .domain([0, Math.abs(yMax) > 0 ? yMax : 10])

    /*
        nice seems to round first and last value.
        see https://github.com/d3/d3-scale/blob/master/README.md#continuous_nice
        the old version did call nice(10) which isn't possible with vx at the moment.
      */
    .nice();

  const tickValues = horizontal ? yScale.ticks(10) : xScale.domain();
  const numTicks = tickValues.length;

  const hideTickLabels = maxWidth / numTicks < MIN_TICK_WIDTH;
  return (
    <StyledLayout align={['start', 'start']}>
      <Svg ref={svgRef} height={height} width={chartWidth}>
        <Group left={marginLeft} top={margin.top}>
          <Axis
            dataTestId="bar-chart-y-axis"
            label={String(yLabel)}
            left={0}
            numTicks={10}
            orientation="left"
            scale={horizontal ? xScale : yScale}
            tickFormat={horizontal ? tickFormat : undefined}
            top={0}
          />
          <Axis
            dataTestId="bar-chart-x-axis"
            hideTickLabels={hideTickLabels}
            label={String(xLabel)}
            orientation="bottom"
            scale={horizontal ? yScale : xScale}
            tickValues={tickValues}
            top={maxHeight}
          />
          {data.map(d => (
            <ToolTip key={horizontal ? d.y : String(d.x)} content={d.toolTip}>
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
                      horizontal ? xScale.bandwidth() : maxHeight - yScale(d.y)
                    }
                    width={horizontal ? yScale(d.y) : xScale.bandwidth()}
                    x={horizontal ? 1 : xScale(String(d.x))}
                    y={horizontal ? xScale(String(d.x)) : yScale(d.y)}
                    onMouseEnter={show}
                    onMouseLeave={hide}
                  />
                </Group>
              )}
            </ToolTip>
          ))}
        </Group>
      </Svg>
      {showLegend && data.length > 0 && (
        <Legend<TData>
          data={data}
          legendRef={legendRef}
          onItemClick={onLegendItemClick}
        />
      )}
    </StyledLayout>
  );
};

export default BarChart;
