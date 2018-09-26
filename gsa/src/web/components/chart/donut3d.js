/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import 'core-js/fn/array/for-each';

import React from 'react';

import styled from 'styled-components';

import {color as d3color} from 'd3-color';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import {setRef} from 'web/utils/render';
import Theme from 'web/utils/theme';

import path from './utils/path';
import arc from './utils/arc';

import {
  MENU_PLACEHOLDER_WIDTH,
} from 'web/components/dashboard/display/datadisplay';

import Layout from 'web/components/layout/layout';

import Pie from './pie';
import Label from './label';
import ToolTip from './tooltip';
import Legend from './legend';
import Svg from './svg';
import Group from './group';

const LEGEND_MARGIN = 20;
const MIN_ANGLE_FOR_LABELS = 0.15;
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

const PI2 = 2 * Math.PI;
const emptyColor = Theme.lightGray;
const darkEmptyColor = d3color(emptyColor).darker();

const DataPropType = PropTypes.arrayOf(PropTypes.shape({
  color: PropTypes.toString.isRequired,
  value: PropTypes.numberOrNumberString.isRequired,
  label: PropTypes.any,
  toolTip: PropTypes.elementOrString,
}));

const sortArcsByStartAngle = (a, b) => a.startAngle > b.startAngle ? -1 : 1;

const PieTopPath = ({
  color,
  path, // eslint-disable-line no-shadow
}) => (
  <path
    fill={color}
    stroke={color}
    d={path}
  />
);

PieTopPath.propTypes = {
  color: PropTypes.toString.isRequired,
  path: PropTypes.toString.isRequired,
};

const pieInnerPath = (sa, ea, irx, iry, h) => {
  const startAngle = sa < Math.PI ? Math.PI : sa;
  const endAngle = ea < Math.PI ? Math.PI : ea;
  const sx = irx * Math.cos(startAngle);
  const sy = iry * Math.sin(startAngle);
  const ex = irx * Math.cos(endAngle);
  const ey = iry * Math.sin(endAngle);

  const paths = path();

  paths.move(sx, sy);
  paths.arc(irx, iry, ex, ey, {sweep: 1});
  paths.line(ex, h + ey);
  paths.arc(irx, iry, sx, sy + h, {sweep: 0});
  paths.close();

  return paths;
};

const PieInnerPath = ({
  startAngle = 0,
  endAngle = PI2,
  color,
  donutHeight,
  innerRadiusX,
  innerRadiusY,
}) => (
  <path
    d={pieInnerPath(
      startAngle,
      endAngle,
      innerRadiusX,
      innerRadiusY,
      donutHeight,
    )}
    fill={color}
  />
);

PieInnerPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  innerRadiusX: PropTypes.number.isRequired,
  innerRadiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

const pieOuterPath = (sa, ea, rx, ry, h) => {
  const startAngle = sa > Math.PI ? Math.PI : sa;
  const endAngle = ea > Math.PI ? Math.PI : ea;

  const sx = rx * Math.cos(startAngle);
  const sy = ry * Math.sin(startAngle);
  const ex = rx * Math.cos(endAngle);
  const ey = ry * Math.sin(endAngle);

  const paths = path();

  paths.move(sx, h + sy);
  paths.arc(rx, ry, ex, ey + h, {sweep: 1});
  paths.line(ex, ey);
  paths.arc(rx, ry, sx, sy, {sweep: 0});
  paths.close();

  return paths;
};

const PieOuterPath = ({
  startAngle = 0,
  endAngle = PI2,
  donutHeight,
  color,
  innerRef,
  outerRadiusX,
  outerRadiusY,
}) => (
  <path
    d={pieOuterPath(
      startAngle,
      endAngle,
      outerRadiusX,
      outerRadiusY,
      donutHeight,
    )}
    ref={innerRef}
    fill={color}
  />
);

PieOuterPath.propTypes = {
  color: PropTypes.toString.isRequired,
  donutHeight: PropTypes.number.isRequired,
  endAngle: PropTypes.number,
  innerRef: PropTypes.ref,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
};

const EmptyDonut = ({
  left,
  top,
  innerRadiusX,
  innerRadiusY,
  outerRadiusX,
  outerRadiusY,
  donutHeight,
}) => {
  const donutarc = arc()
    .innerRadiusX(innerRadiusX)
    .innerRadiusY(innerRadiusY)
    .outerRadiusX(outerRadiusX)
    .outerRadiusY(outerRadiusY);
  return (
    <Group
      top={top}
      left={left}
    >
      <PieInnerPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        innerRadiusX={innerRadiusX}
        innerRadiusY={innerRadiusY}
      />
      <PieTopPath
        color={emptyColor}
        path={donutarc.path()}
      />
      <PieOuterPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        outerRadiusX={outerRadiusX}
        outerRadiusY={outerRadiusY}
      />
    </Group>
  );
};

EmptyDonut.propTypes = {
  donutHeight: PropTypes.number.isRequired,
  innerRadiusX: PropTypes.number.isRequired,
  innerRadiusY: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  outerRadiusX: PropTypes.number.isRequired,
  outerRadiusY: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
};

const AllLabels = ({
  allLabels,
}) => allLabels.map(label => {
  const {innerRef, value, x, y, show, hide, id} = label;
  return (
    <Label
      x={x}
      y={y}
      innerRef={innerRef}
      key={id}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {value}
    </Label>
  );
});

class Donut3DChart extends React.Component {

  constructor(...args) {
    super(...args);

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

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.data !== this.props.data ||
      nextProps.width !== this.props.width ||
      nextProps.height !== this.props.height ||
      nextState.width !== this.state.width;
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
    const labels = [...this.svg.querySelectorAll('.pie-label')];

    labels.forEach(label => {
      target = label;
      targetWidth = target.getComputedTextLength();
      targetX = target.getAttribute('x');
      targetY = target.getAttribute('y');

      // compare target label with all other labels
      labels.forEach(label => { // eslint-disable-line no-shadow
        comparison = label;
        if (target === comparison) {
          return;
        }
        comparisonWidth = comparison.getComputedTextLength();
        comparisonX = comparison.getAttribute('x');
        comparisonY = comparison.getAttribute('y');

        const deltaX = targetX - comparisonX;
        if (Math.abs(deltaX) * 2 > (targetWidth + comparisonWidth)) {
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
  };

  render() {
    const {width} = this.state;
    const {
      data = [],
      height,
      svgRef,
      onDataClick,
      onLegendItemClick,
    } = this.props;

    const horizontalMargin = margin.left + margin.right;
    const verticalMargin = margin.top + margin.left;

    const donutHeight = Math.min(height, width) / 8;

    const innerRadius = 0.5;

    let donutWidth = width;
    if (width / height > MIN_RATIO) {
      donutWidth = height * MIN_RATIO;
    }
    const centerX = width / 2;
    const centerY = height / 2 - donutHeight / 2;
    const outerRadiusX = donutWidth / 2 - horizontalMargin;
    const outerRadiusY = (Math.min(height / 2, donutWidth / 2) -
      donutHeight / 2) - verticalMargin;
    const innerRadiusX = outerRadiusX * innerRadius;
    const innerRadiusY = outerRadiusY * innerRadius;

    const props = {
      outerRadiusX,
      outerRadiusY,
      donutHeight,
      innerRadiusX,
      innerRadiusY,
    };

    const allLabels = [];

    return (
      <StyledLayout align={['start', 'start']}>
        <Svg
          width={width}
          height={height}
          innerRef={setRef(svgRef, ref => this.svg = ref)}
        >
          {data.length > 0 ?
            <React.Fragment>
              <Pie
                data={data}
                pieSort={null}
                pieValue={d => d.value}
                arcsSort={sortArcsByStartAngle}
                top={centerY}
                left={centerX}
                svgElement={this.svg}
                {...props}
              >
                {({
                  data: arcData,
                  index,
                  startAngle,
                  endAngle,
                  path: arcPath,
                  x,
                  y,
                }) => {
                  const {color = Theme.lightGray, toolTip} = arcData;
                  const darker = d3color(color).darker();
                  const angleAbs = Math.abs(startAngle - endAngle);
                    return (
                      <ToolTip
                        key={index}
                        content={toolTip}
                      >
                        {({targetRef, hide, show}) => {
                          if (angleAbs > MIN_ANGLE_FOR_LABELS) {
                            allLabels.push({
                              x,
                              y,
                              id: index,
                              show,
                              hide,
                              value: arcData.value,
                            });
                          }
                          return (
                            <Group
                              onMouseEnter={show}
                              onMouseLeave={hide}
                              onClick={isDefined(onDataClick) ?
                                () => onDataClick(arcData) : undefined}
                            >
                              <PieInnerPath
                                startAngle={startAngle}
                                endAngle={endAngle}
                                color={darker}
                                {...props}
                              />
                              <PieTopPath
                                color={color}
                                path={arcPath}
                              />
                              <PieOuterPath
                                startAngle={startAngle}
                                endAngle={endAngle}
                                color={darker}
                                {...props}
                              />
                              <circle // used as positioning ref for tooltips
                                ref={targetRef}
                                cx={x}
                                cy={y}
                                r="1"
                                visibility="hidden"
                              />
                            </Group>
                          );
                        }}
                      </ToolTip>
                    );
                }}
              </Pie>
              <Group
                top={centerY}
                left={centerX}
              >
                <AllLabels
                  allLabels={allLabels}
                />
              </Group>
            </React.Fragment> :
            <EmptyDonut
              left={centerX}
              top={centerY}
              {...props}
            />
          }
        </Svg>
        {data.length > 0 &&
          <Legend
            data={data}
            innerRef={this.legendRef}
            onItemClick={onLegendItemClick}
          />
        }
      </StyledLayout>
    );
  }
}

Donut3DChart.propTypes = {
  data: DataPropType,
  height: PropTypes.number.isRequired,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
  onLegendItemClick: PropTypes.func,
};

export default Donut3DChart;

// vim: set ts=2 sw=2 tw=80:
