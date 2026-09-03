/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {arc as d3arc, pie as d3pie, type PieArcDatum} from 'd3-shape';
import styled from 'styled-components';
import ChartWithEmptyState from 'web/components/chart/base/ChartWithEmptyState';
import Group from 'web/components/chart/base/Group';
import Legend, {
  type LegendData,
  type LegendRef,
} from 'web/components/chart/base/Legend';
import Svg from 'web/components/chart/base/Svg';
import Arc2d from 'web/components/chart/donut/Arc2d';
import Labels from 'web/components/chart/donut/Labels';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/constants';
import Layout from 'web/components/layout/Layout';

export interface DonutChartData extends LegendData {
  value: number;
}

interface DonutChartProps<TData extends DonutChartData> {
  width: number;
  height: number;
  data?: TData[];
  innerRadius?: number;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  showLegend?: boolean;
  onDataClick?: (data: TData) => void;
  onLegendItemClick?: (item: TData) => void;
}

const LEGEND_MARGIN = 20;
const MIN_WIDTH = 200;
const DEFAULT_INNER_RADIUS = 0.65;

const StyledLayout = styled(Layout)`
  overflow: hidden;
`;

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

const DonutChart = <TData extends DonutChartData = DonutChartData>({
  data = [],
  innerRadius = DEFAULT_INNER_RADIUS,
  height,
  svgRef,
  showLegend = true,
  width: propWidth,
  onDataClick,
  onLegendItemClick,
}: DonutChartProps<TData>) => {
  const legendRef: LegendRef = useRef<HTMLElement | null>(null);

  const getWidth = useCallback(() => {
    let width = propWidth - MENU_PLACEHOLDER_WIDTH;
    const {current: legend} = legendRef;

    if (legend !== null) {
      const {width: legendWidth} = legend.getBoundingClientRect();
      width = width - legendWidth - LEGEND_MARGIN;
    }

    if (width < MIN_WIDTH) {
      width = MIN_WIDTH;
    }

    return width;
  }, [propWidth, legendRef]);

  const [chartWidth, setChartWidth] = useState(getWidth);
  const [hoveredLabel, setHoveredLabel] = useState<string>();

  useEffect(() => {
    const newWidth = getWidth();
    if (newWidth !== chartWidth) {
      setChartWidth(newWidth);
    }
  }, [chartWidth, getWidth]);

  const horizontalMargin = margin.left + margin.right;
  const donutWidth = Math.min(chartWidth, height);
  const radius = donutWidth / 2 - horizontalMargin;

  // x,y position of the donut
  const centerX = chartWidth / 2;
  const centerY = height / 2;

  const outerRadiusX = radius;
  const innerRadiusX = radius * innerRadius;

  const donutProps = {
    outerRadiusX,
    innerRadiusX,
    outerRadiusY: outerRadiusX,
    innerRadiusY: innerRadiusX,
  };

  const pie = d3pie<TData>()
    .sortValues(null)
    .value(d => d.value)
    .padAngle(0.03);
  const arcs = pie(data).sort((a, b) => (a.startAngle > b.startAngle ? -1 : 1));
  const arc = d3arc<unknown, PieArcDatum<TData>>()
    .innerRadius(innerRadiusX)
    .outerRadius(outerRadiusX);

  return (
    <StyledLayout align={['start', 'start']}>
      <Svg
        ref={svgRef}
        data-testid="donut-chart-svg"
        height={height}
        width={chartWidth}
      >
        <ChartWithEmptyState
          data-testid="donut-chart-empty"
          height={height}
          isEmpty={data.length === 0}
          width={chartWidth}
        >
          <>
            <Group left={centerX} top={centerY}>
              {arcs.map((currentArc, index) => {
                const [x, y] = arc.centroid(currentArc);
                return (
                  <Arc2d
                    key={`${currentArc.startAngle}-${currentArc.endAngle}`}
                    data={currentArc.data}
                    endAngle={currentArc.endAngle}
                    innerRadius={innerRadiusX}
                    outerRadius={outerRadiusX}
                    startAngle={currentArc.startAngle}
                    x={x}
                    y={y}
                    {...donutProps}
                    isDimmed={
                      hoveredLabel !== undefined &&
                      hoveredLabel !== currentArc.data.label
                    }
                    onDataClick={onDataClick}
                    onHover={hoveredData => setHoveredLabel(hoveredData?.label)}
                  />
                );
              })}
            </Group>
            <Labels
              arcs={arcs}
              centerX={centerX}
              centerY={centerY}
              hoveredLabel={hoveredLabel}
              innerRadiusX={innerRadiusX}
              innerRadiusY={innerRadiusX}
              outerRadiusX={outerRadiusX}
              outerRadiusY={outerRadiusX}
            />
          </>
        </ChartWithEmptyState>
      </Svg>
      {data.length > 0 && showLegend && (
        <Legend<TData>
          data={data}
          legendRef={legendRef}
          maxHeight={Math.max(0, height - 20)}
          onItemClick={onLegendItemClick}
        />
      )}
    </StyledLayout>
  );
};

export default DonutChart;
