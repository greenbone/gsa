/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useRef, useState, type Ref} from 'react';
import {color as d3color, type HSLColor, type RGBColor} from 'd3-color';
import styled from 'styled-components';
import {hasValue, isDefined} from 'gmp/utils/identity';
import Group from 'web/components/chart/base/Group';
import Legend, {
  type LegendData,
  type LegendRef,
} from 'web/components/chart/base/Legend';
import Svg from 'web/components/chart/base/Svg';
import Arc2d from 'web/components/chart/donut/Arc2d';
import Arc3d from 'web/components/chart/donut/Arc3d';
import Labels from 'web/components/chart/donut/Labels';
import {
  PieInnerPath,
  PieTopPath,
  PieOuterPath,
} from 'web/components/chart/donut/Paths';
import Pie from 'web/components/chart/donut/Pie';
import arc from 'web/components/chart/utils/Arc';
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
const MIN_RATIO = 2.0;
const MIN_WIDTH = 200;

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
const darkEmptyColor = (d3color(emptyColor) as HSLColor | RGBColor).darker();

const EmptyDonut = ({
  'data-testid': dataTestId,
  left,
  top,
  innerRadiusX,
  innerRadiusY,
  outerRadiusX,
  outerRadiusY,
  donutHeight,
}: EmptyDonutProps) => {
  const donutArc = arc()
    .innerRadiusX(innerRadiusX)
    .innerRadiusY(innerRadiusY)
    .outerRadiusX(outerRadiusX)
    .outerRadiusY(outerRadiusY);
  return (
    <Group data-testid={dataTestId} left={left} top={top}>
      <PieInnerPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        innerRadiusX={innerRadiusX}
        innerRadiusY={innerRadiusY}
      />
      <PieTopPath color={emptyColor} path={donutArc.path()} />
      <PieOuterPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        outerRadiusX={outerRadiusX}
        outerRadiusY={outerRadiusY}
      />
    </Group>
  );
};

const DonutChart = <TData extends DonutChartData = DonutChartData>({
  data = [],
  innerRadius = 0,
  height,
  svgRef,
  show3d = true,
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
  const verticalMargin = margin.top + margin.bottom;

  // thickness of the donut
  const donutThickness = show3d ? Math.min(height, chartWidth) / 8 : 0;

  let donutWidth = chartWidth;
  let donutHeight = height;

  if (show3d && chartWidth / height > MIN_RATIO) {
    // don't allow 3d donut to be stretch horizontally anymore
    donutWidth = height * MIN_RATIO;
  } else if (!show3d && chartWidth > height) {
    // don't allow the 2d donut to be stretched horizontally
    donutWidth = height;
  }
  if (height > chartWidth) {
    // never stretch the donut chart vertically
    donutHeight = chartWidth;
  }

  // x,y position of the donut
  const centerX = chartWidth / 2;
  const centerY = (height - donutThickness) / 2;

  const outerRadiusX = donutWidth / 2 - horizontalMargin;
  const outerRadiusY = (donutHeight - donutThickness) / 2 - verticalMargin;
  const innerRadiusX = outerRadiusX * innerRadius;
  const innerRadiusY = outerRadiusY * innerRadius;

  const donutProps = {
    outerRadiusX,
    outerRadiusY,
    innerRadiusX,
    innerRadiusY,
  };

  const Arc = show3d ? Arc3d<TData> : Arc2d<TData>;
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
                <Arc
                  key={index}
                  data={arcData}
                  donutHeight={donutThickness}
                  endAngle={endAngle}
                  path={arcPath}
                  startAngle={startAngle}
                  x={x}
                  y={y}
                  {...donutProps}
                  onDataClick={onDataClick}
                />
              )}
            </Pie>
            <Labels<TData>
              centerX={centerX}
              centerY={centerY}
              data={data}
              {...donutProps}
            />
          </>
        ) : (
          <EmptyDonut
            data-testid="donut-chart-empty"
            donutHeight={donutThickness}
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
