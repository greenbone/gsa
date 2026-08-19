/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useRef, useState, type Ref} from 'react';
import {arc as d3arc} from 'd3-shape';
import styled from 'styled-components';
import {hasValue, isDefined} from 'gmp/utils/identity';
import Group from 'web/components/chart/base/Group';
import Legend, {
  type LegendData,
  type LegendRef,
} from 'web/components/chart/base/Legend';
import Svg from 'web/components/chart/base/Svg';
import Arc2d from 'web/components/chart/donut/Arc2d';
import Pie from 'web/components/chart/donut/Pie';
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/constants';
import Layout from 'web/components/layout/Layout';
import {setRef} from 'web/utils/Render';
import Theme from 'web/utils/theme';

interface EmptyDonutProps {
  'data-testid'?: string;
  left: number;
  top: number;
  innerRadiusX: number;
  innerRadiusY: number;
  outerRadiusX: number;
  outerRadiusY: number;
  donutHeight: number;
}

export interface DonutChartData extends LegendData {
  value: number;
}

interface DonutChartProps<TData extends DonutChartData> {
  width: number;
  height: number;
  data?: TData[];
  innerRadius?: number;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  show3d?: boolean;
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

const emptyColor = Theme.lightGray;

const EmptyDonut = ({
  'data-testid': dataTestId,
  left,
  top,
  innerRadiusX,
  outerRadiusX,
}: EmptyDonutProps) => {
  const donutArc = d3arc()
    .innerRadius(innerRadiusX)
    .outerRadius(outerRadiusX)
    .cornerRadius(4)({startAngle: 0, endAngle: 2 * Math.PI});
  return (
    <Group data-testid={dataTestId} left={left} top={top}>
      <path d={String(donutArc)} fill={emptyColor} />
    </Group>
  );
};

const DonutChart = <TData extends DonutChartData = DonutChartData>({
  data = [],
  innerRadius = DEFAULT_INNER_RADIUS,
  height,
  svgRef,
  show3d = false,
  showLegend = true,
  width: propWidth,
  onDataClick,
  onLegendItemClick,
}: DonutChartProps<TData>) => {
  const legendRef: LegendRef = useRef<HTMLElement | null>(null);
  const svgElementRef = useRef<SVGSVGElement | null>(null);

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
  const [hoveredData, setHoveredData] = useState<TData | undefined>();

  const separateLabels = useCallback(() => {
    const svg = svgElementRef.current;
    if (!isDefined(svg)) {
      return;
    }

    let overlapFound = false;

    let target: SVGTextContentElement;
    let targetWidth: number;
    let targetX: number;
    let targetY: number;
    let comparison: SVGTextContentElement;
    let comparisonWidth: number;
    let comparisonX: number;
    let comparisonY: number;

    const SPACING = 15;
    const labels = hasValue(svg)
      ? [...svg.querySelectorAll<SVGTextContentElement>('.pie-label')]
      : [];

    labels.forEach(label => {
      target = label;
      targetWidth = target.getComputedTextLength();
      targetX = Number(target.getAttribute('x'));
      targetY = Number(target.getAttribute('y'));

      // compare target label with all other labels

      labels.forEach(label => {
        comparison = label;
        if (target === comparison) {
          return;
        }
        comparisonWidth = comparison.getComputedTextLength();
        comparisonX = Number(comparison.getAttribute('x'));
        comparisonY = Number(comparison.getAttribute('y'));

        const deltaX = targetX - comparisonX;
        if (Math.abs(deltaX) * 2 > targetWidth + comparisonWidth) {
          return;
        }

        const deltaY = targetY - comparisonY;
        if (Math.abs(deltaY) > SPACING) {
          return;
        }

        overlapFound = true;
        const adjustment = deltaX > 0 ? 5 : -5;
        target.setAttribute('x', String(Math.abs(targetX) + adjustment));
        comparison.setAttribute(
          'x',
          String(Math.abs(comparisonX) - adjustment),
        );
      });
    });
    if (overlapFound) {
      separateLabels();
    }
  }, []);

  useEffect(() => {
    const newWidth = getWidth();
    if (newWidth !== chartWidth) {
      setChartWidth(newWidth);
    }
    separateLabels();
  }, [
    chartWidth,
    data,
    getWidth,
    height,
    innerRadius,
    separateLabels,
    show3d,
    showLegend,
  ]);

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

  return (
    <StyledLayout align={['start', 'start']}>
      <Svg
        ref={setRef(svgRef as Ref<SVGSVGElement>, ref => {
          svgElementRef.current = ref;
        })}
        data-testid="donut-chart-svg"
        height={height}
        width={chartWidth}
      >
        {data.length > 0 ? (
          <>
            <Pie
              data={data}
              left={centerX}
              padAngle={0.03}
              pieValue={d => d.value}
              top={centerY}
              {...donutProps}
            >
              {({
                data: arcData,
                index,
                startAngle,
                endAngle,
                path: arcPath,
                x,
                y,
              }) => (
                <Arc2d
                  key={index}
                  data={arcData}
                  endAngle={endAngle}
                  x={x}
                  y={y}
                  innerRadius={innerRadiusX}
                  outerRadius={outerRadiusX}
                  path={arcPath}
                  startAngle={startAngle}
                  onHover={setHoveredData}
                  {...donutProps}
                  onDataClick={onDataClick}
                />
              )}
            </Pie>
            <text
              data-testid="donut-chart-center-label"
              dy=".33em"
              fill={Theme.darkGray}
              fontSize={Theme.Font.default}
              fontWeight="bold"
              textAnchor="middle"
              x={centerX}
              y={centerY}
            >
              {hoveredData
                ? `Value: ${hoveredData.value}`
                : `Total: ${data.reduce((total, datum) => total + datum.value, 0)}`}
            </text>
          </>
        ) : (
          <EmptyDonut
            data-testid="donut-chart-empty"
            left={centerX}
            top={centerY}
            {...donutProps}
          />
        )}
      </Svg>
      {data.length > 0 && showLegend && (
        <Legend<TData>
          data={data}
          legendRef={legendRef}
          onItemClick={onLegendItemClick}
        />
      )}
    </StyledLayout>
  );
};

export default DonutChart;
