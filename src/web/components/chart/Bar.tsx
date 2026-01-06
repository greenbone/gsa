/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {scaleBand, scaleLinear} from 'd3-scale';
import styled from 'styled-components';
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
import {shouldUpdate} from 'web/components/chart/utils/Update';
import Layout from 'web/components/layout/Layout';

interface BarChartDataPoint extends LegendData {
  x: number;
  y: number;
}

interface BarChartProps {
  width: number;
  height: number;
  showLegend?: boolean;
  horizontal?: boolean;
  xLabel?: string;
  yLabel?: string;
  svgRef?: React.Ref<SVGSVGElement>;
  data: BarChartDataPoint[];
  onDataClick?: (dataPoint: BarChartDataPoint) => void;
  onLegendItemClick?: (dataPoint: BarChartDataPoint) => void;
}

interface BarChartState {
  width: number;
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

const tickFormat = (val: number | string) => {
  const valStr = String(val);
  if (valStr.length > MAX_LABEL_LENGTH) {
    // prevent cycling through the string
    return '...' + valStr.slice(valStr.length - MAX_LABEL_LENGTH);
  }
  return valStr;
};

class BarChart extends React.Component<BarChartProps, BarChartState> {
  legendRef: LegendRef;

  constructor(props: BarChartProps) {
    super(props);

    this.legendRef = React.createRef();

    this.state = {
      width: this.getWidth(),
    };
  }

  shouldComponentUpdate(nextProps: BarChartProps, nextState: BarChartState) {
    return (
      shouldUpdate(nextProps, this.props) ||
      nextState.width !== this.state.width
    );
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    const width = this.getWidth();
    if (width !== this.state.width) {
      this.setState({width});
    }
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

  render() {
    const {
      data = [],
      showLegend = true,
      height,
      xLabel = '',
      yLabel = '',
      horizontal = false,
      svgRef,
      onDataClick,
      onLegendItemClick,
    } = this.props;
    const {width} = this.state;

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const yMax = Math.max(...yValues);

    const maxLabelLength = Math.max(
      ...xValues.map(val => val.toString().length),
      MAX_LABEL_LENGTH,
    );

    // adjust left margin for label length on horizontal bars
    // 4px for each letter is just a randomly chosen value
    const marginLeft = horizontal
      ? margin.left + Math.min(MAX_LABEL_LENGTH, maxLabelLength) * 4
      : margin.left;

    const maxWidth = width - marginLeft - margin.right;
    let maxHeight = height - margin.top - margin.bottom;

    if (isDefined(xLabel)) {
      // adjust height for x axis label
      maxHeight = maxHeight - LABEL_HEIGHT;
    }

    const xScale = scaleBand<number>()
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
        <Svg ref={svgRef} height={height} width={width}>
          <Group left={marginLeft} top={margin.top}>
            <Axis
              label={`${yLabel}`}
              left={0}
              numTicks={10}
              orientation="left"
              scale={horizontal ? xScale : yScale}
              tickFormat={horizontal ? tickFormat : undefined}
              top={0}
            />
            <Axis
              hideTickLabels={hideTickLabels}
              label={`${xLabel}`}
              orientation="bottom"
              scale={horizontal ? yScale : xScale}
              tickValues={tickValues}
              top={maxHeight}
            />
            {data.map((d, i) => (
              <ToolTip key={i} content={d.toolTip}>
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
                        horizontal
                          ? xScale.bandwidth()
                          : maxHeight - yScale(d.y)
                      }
                      width={horizontal ? yScale(d.y) : xScale.bandwidth()}
                      x={horizontal ? 1 : xScale(d.x)}
                      y={horizontal ? xScale(d.x) : yScale(d.y)}
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
          <Legend<BarChartDataPoint>
            data={data}
            legendRef={this.legendRef}
            onItemClick={onLegendItemClick}
          />
        )}
      </StyledLayout>
    );
  }
}

export default BarChart;
