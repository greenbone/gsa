/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import {color as d3color} from 'd3-color';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {setRef} from 'web/utils/render';
import Theme from 'web/utils/theme';

import Arc2d from './donut/arc2d';
import Arc3d from './donut/arc3d';
import Labels from './donut/labels';
import {PieInnerPath, PieTopPath, PieOuterPath} from './donut/paths';
import Pie from './donut/pie';
import {DataPropType} from './donut/proptypes';

import arc from './utils/arc';
import {MENU_PLACEHOLDER_WIDTH} from './utils/constants';
import {shouldUpdate} from './utils/update';

import Legend from './legend';
import Svg from './svg';
import Group from './group';

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
const darkEmptyColor = d3color(emptyColor).darker();

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
    <Group top={top} left={left}>
      <PieInnerPath
        color={darkEmptyColor}
        donutHeight={donutHeight}
        innerRadiusX={innerRadiusX}
        innerRadiusY={innerRadiusY}
      />
      <PieTopPath color={emptyColor} path={donutarc.path()} />
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

class DonutChart extends React.Component {
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
    return (
      shouldUpdate(nextProps, this.props) ||
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
    const labels = [...this.svg.querySelectorAll('.pie-label')];

    labels.forEach(label => {
      target = label;
      targetWidth = target.getComputedTextLength();
      targetX = target.getAttribute('x');
      targetY = target.getAttribute('y');

      // compare target label with all other labels
      // eslint-disable-next-line no-shadow
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

    const Arc = show3d ? Arc3d : Arc2d;
    return (
      <StyledLayout align={['start', 'start']}>
        <Svg
          width={width}
          height={height}
          ref={setRef(svgRef, ref => (this.svg = ref))}
        >
          {data.length > 0 ? (
            <React.Fragment>
              <Pie
                data={data}
                pieValue={d => d.value}
                top={centerY}
                left={centerX}
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
                    index={index}
                    data={arcData}
                    path={arcPath}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    x={x}
                    y={y}
                    donutHeight={donutThickness}
                    {...donutProps}
                    onDataClick={onDataClick}
                  />
                )}
              </Pie>
              <Labels
                data={data}
                centerX={centerX}
                centerY={centerY}
                {...donutProps}
              />
            </React.Fragment>
          ) : (
            <EmptyDonut
              left={centerX}
              top={centerY}
              donutHeight={donutThickness}
              {...donutProps}
            />
          )}
        </Svg>
        {data.length > 0 && showLegend && (
          <Legend
            data={data}
            ref={this.legendRef}
            onItemClick={onLegendItemClick}
          />
        )}
      </StyledLayout>
    );
  }
}

DonutChart.propTypes = {
  data: DataPropType,
  height: PropTypes.number.isRequired,
  innerRadius: PropTypes.number,
  show3d: PropTypes.bool,
  showLegend: PropTypes.bool,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
  onLegendItemClick: PropTypes.func,
};

export default DonutChart;

// vim: set ts=2 sw=2 tw=80:
