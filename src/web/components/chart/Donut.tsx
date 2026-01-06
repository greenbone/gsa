/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {type Ref} from 'react';
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
import {MENU_PLACEHOLDER_WIDTH} from 'web/components/chart/utils/Constants';
import {shouldUpdate} from 'web/components/chart/utils/Update';
import Layout from 'web/components/layout/Layout';
import {setRef} from 'web/utils/Render';
import Theme from 'web/utils/Theme';

interface EmptyDonutProps {
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
  svgRef?: React.RefObject<SVGSVGElement>;
  show3d?: boolean;
  showLegend?: boolean;
  onDataClick?: (data: TData) => void;
  onLegendItemClick?: (item: TData) => void;
}

interface DonutChartState {
  width: number;
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
    <Group left={left} top={top}>
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

class DonutChart<
  TData extends DonutChartData = DonutChartData,
> extends React.Component<DonutChartProps<TData>, DonutChartState> {
  legendRef: LegendRef;
  svg: SVGSVGElement | null = null;

  constructor(props: DonutChartProps<TData>) {
    super(props);

    this.legendRef = React.createRef();

    this.state = {
      width: this.getWidth(),
    };
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

  shouldComponentUpdate(
    nextProps: DonutChartProps<TData>,
    nextState: DonutChartState,
  ) {
    return (
      shouldUpdate<DonutChartProps<TData>>(nextProps, this.props) ||
      nextState.width !== this.state.width ||
      nextProps.show3d !== this.props.show3d
    );
  }

  update() {
    const width = this.getWidth();

    if (width !== this.state.width) {
      this.setState({width});
    }
    this.separateLabels();
  }

  componentDidUpdate() {
    this.update();
  }

  componentDidMount() {
    this.update();
  }

  separateLabels() {
    if (!isDefined(this.svg)) {
      return;
    }

    let overlapFound = false;

    let target;
    let targetWidth;
    let targetX;
    let targetY;
    let comparison;
    let comparisonWidth;
    let comparisonX;
    let comparisonY;

    const SPACING = 15;
    const labels = hasValue(this.svg)
      ? [...this.svg.querySelectorAll('.pie-label')]
      : [];

    labels.forEach(label => {
      target = label;
      targetWidth = target.getComputedTextLength();
      targetX = target.getAttribute('x');
      targetY = target.getAttribute('y');

      // compare target label with all other labels

      labels.forEach(label => {
        comparison = label;
        if (target === comparison) {
          return;
        }
        comparisonWidth = comparison.getComputedTextLength();
        comparisonX = comparison.getAttribute('x');
        comparisonY = comparison.getAttribute('y');

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
        target.setAttribute('x', Math.abs(targetX) + adjustment);
        comparison.setAttribute('x', Math.abs(comparisonX) - adjustment);
      });
    });
    if (overlapFound) {
      this.separateLabels();
    }
  }

  render() {
    const {width} = this.state;
    const {
      data = [],
      innerRadius = 0,
      height,
      svgRef,
      show3d = true,
      showLegend = true,
      onDataClick,
      onLegendItemClick,
    } = this.props;

    const horizontalMargin = margin.left + margin.right;
    const verticalMargin = margin.top + margin.bottom;

    // thickness of the donut
    const donutThickness = show3d ? Math.min(height, width) / 8 : 0;

    let donutWidth = width;
    let donutHeight = height;

    if (show3d && width / height > MIN_RATIO) {
      // don't allow 3d donut to be stretch horizontally anymore
      donutWidth = height * MIN_RATIO;
    } else if (!show3d && width > height) {
      // don't allow the 2d donut to be stretched horizontally
      donutWidth = height;
    }
    if (height > width) {
      // never stretch the donut chart vertically
      donutHeight = width;
    }

    // x,y position of the donut
    const centerX = width / 2;
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
          ref={setRef(svgRef as Ref<SVGSVGElement>, ref => (this.svg = ref))}
          height={height}
          width={width}
        >
          {data.length > 0 ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : (
            <EmptyDonut
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
            legendRef={this.legendRef}
            onItemClick={onLegendItemClick}
          />
        )}
      </StyledLayout>
    );
  }
}

export default DonutChart;
