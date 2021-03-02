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

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceX,
  forceY,
} from 'd3-force';

import {color} from 'd3-color';

import {scaleLinear} from 'd3-scale';

import equal from 'fast-deep-equal';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {setRef} from 'web/utils/render';
import {
  getSeverityLevelsOld as getSeverityLevels,
  FALSE_POSITIVE_VALUE,
  HIGH_VALUE,
} from 'web/utils/severity';
import Theme from 'web/utils/theme';

import Group from './group';

export const MAX_HOSTS = 1000;

const SCANNER_RADIUS = 8;
const HOST_RADIUS = 5;

const Svg = styled.svg`
  & text {
    user-select: 'none';
  }
  cursor: ${props => (props.dragging ? 'grabbing' : 'grab')};
`;

const Circle = styled.circle`
  cursor: pointer;
`;

const severityColorsGradientScale = type => {
  const severity_levels = getSeverityLevels();
  return scaleLinear()
    .domain([
      FALSE_POSITIVE_VALUE,
      severity_levels.max_log,
      severity_levels.min_low,
      (severity_levels.min_low + severity_levels.max_low) / 2,
      severity_levels.max_low,
      severity_levels.min_medium,
      (severity_levels.min_medium + severity_levels.max_medium) / 2,
      severity_levels.max_medium,
      severity_levels.min_high,
      (severity_levels.min_high + HIGH_VALUE) / 2,
      HIGH_VALUE,
    ])
    .range([
      'grey', // False Positive
      'silver', // Log
      '#b1cee9', // minimum Low
      '#87CEEB', // middle Low
      '#a5e59d', // maximum Low
      '#ffde00', // minimum Medium
      '#FFA500', // middle Medium
      '#f57b00', // maximum Medium
      '#eb5200', // minimum High
      '#D80000', // middle High
      '#ff0000', // maximum High
    ]);
};

const SCROLL_STEP = 0.1;

const MAX_SCALE = 2;
const MIN_SCALE = 0.1;
const TEXT_SCALE_THRESHOLD = 1;

const DEFAULT_STROKE_WIDTH = 1;
const SCANNER_STROKE_WIDTH = 2;

const copyArray = array =>
  isDefined(array)
    ? array.map(current => ({
        ...current,
      }))
    : undefined;

const copyHosts = hosts =>
  hosts.map(host => ({
    ...host,
    links: copyArray(host.links),
  }));

class HostsTopologyChart extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      hosts: [],
      links: [],
      scale: 1.0,
      translateX: 0,
      translateY: 0,
      dragging: false,
    };

    this.colorScale = severityColorsGradientScale(this.props.severityClass);

    this.hostFillColor = this.hostFillColor.bind(this);
    this.hostStrokeColor = this.hostStrokeColor.bind(this);

    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMousUp = this.handleMousUp.bind(this);
    this.handleMousMove = this.handleMousMove.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {data = {}} = nextProps;
    let {hosts = [], links = []} = data;

    if (equal(prevState.originalHosts, hosts)) {
      return null;
    }

    const originalHosts = hosts;

    if (hosts.length > MAX_HOSTS) {
      const removeHosts = hosts.slice(MAX_HOSTS, hosts.length - 1);
      // remove all links using these hosts
      const linksSet = new Set(links);
      for (const host of removeHosts) {
        for (const link of host.links) {
          linksSet.delete(link);
        }
      }

      links = [...linksSet];
      hosts = hosts.slice(0, MAX_HOSTS);
    }

    let {simulation, linkForce} = prevState;

    // always pass a copy of the hosts and links to d3 because it mutates them
    const hostsCopy = copyHosts(hosts);
    const linksCopy = copyArray(links);

    if (isDefined(simulation)) {
      simulation.nodes(hostsCopy);
      linkForce.links(linksCopy);
    } else {
      const initSim = HostsTopologyChart.initSimulation(hostsCopy, linksCopy);
      simulation = initSim.simulation;
      linkForce = initSim.linkForce;
    }

    return {
      originalHosts,
      hostsCount: originalHosts.length,
      hosts: hostsCopy,
      links: linksCopy,
      simulation,
      linkForce,
    };
  }

  static initSimulation(hosts, links) {
    const linkForce = forceLink(links)
      .id(l => l.id)
      .strength(0.2);

    const gravityXForce = forceX().strength(0.03);
    const gravityYForce = forceY().strength(0.03);

    const simulation = forceSimulation(hosts)
      .stop()
      .force('link', linkForce)
      .force('charge', forceManyBody().strength(-20))
      .force('gravityX', gravityXForce)
      .force('gravityY', gravityYForce)
      .alphaMin(0.1)
      .alphaDecay(0.02276278); // alphaMin and alphaDecay result in ~100 ticks

    return {simulation, linkForce};
  }

  componentDidMount() {
    const {width, height} = this.props;
    const {simulation} = this.state;

    simulation
      .force('center', forceCenter(width / 2, height / 2))
      .on('tick', () => this.forceUpdate())
      .restart();
  }

  componentWillUnmount() {
    const {simulation} = this.state;

    if (isDefined(simulation)) {
      simulation.stop();
      simulation.on('tick', null);
      simulation.on('end', null);
    }
  }

  hostFillColor(host) {
    return isDefined(host.uuid) ? this.colorScale(host.severity) : Theme.white;
  }

  hostStrokeColor(host) {
    if (host.isScanner) {
      return Theme.green;
    }
    if (isDefined(host.uuid) && isDefined(host.severity)) {
      return color(this.colorScale(host.severity)).darker();
    }

    return Theme.lightGray;
  }

  /**
   * Zoom chart at pixel coordinates to the scale factor
   *
   * @param {Number} px    X coordinate relative to the svg element
   * @param {Number} py    Y coordinate relative to the svg element
   * @param {Number} scale New scale factor to set
   */
  zoom(px, py, scale) {
    const {x, y} = this.toChartCoords(px, py);

    // calculate new pixel coords and afterwards diff to previous coords
    const diffX = x * scale - px;
    const diffY = y * scale - py;

    this.setState({
      scale,
      translateX: -diffX,
      translateY: -diffY,
    });
  }

  /**
   * Zoom chart at pixel coordinates one step in until MAX_SCALE is reached
   *
   * @param {Number} px X coordinate relative to the svg element
   * @param {Number} py Y coordinate relative to the svg element
   */
  zoomIn(px, py) {
    let {scale} = this.state;

    if (scale === MAX_SCALE) {
      // avoid setting state and rerendering
      return;
    }

    scale = scale + SCROLL_STEP;

    if (scale > MAX_SCALE) {
      // limit min scale
      scale = MAX_SCALE;
    }

    this.zoom(px, py, scale);
  }

  /**
   * Zoom chart at pixel coordinates one step out until MIN_SCALE is reached
   *
   * @param {Number} px X coordinate relative to the svg element
   * @param {Number} py Y coordinate relative to the svg element
   */
  zoomOut(px, py) {
    let {scale} = this.state;

    if (scale === MIN_SCALE) {
      // avoid setting state and rerendering
      return;
    }

    scale = scale - SCROLL_STEP;

    if (scale < MIN_SCALE) {
      // limit scale
      scale = MIN_SCALE;
    }

    this.zoom(px, py, scale);
  }

  /**
   * Convert pixel coordinates into chart coordinates
   *
   * @param {Number} x Relative X position to the svg element
   * @param {Number} y Relative Y position to the svg element
   *
   * @returns {Object} Chart coordinates as {x,y}
   */
  toChartCoords(x, y) {
    const {scale, translateX, translateY} = this.state;
    // transform pixel coords into chart coords
    return {
      x: (x - translateX) / scale,
      y: (y - translateY) / scale,
    };
  }

  /**
   * Get relative mouse positions to the svg element
   *
   * @param {MouseEvent} event The MouseEvent
   *
   * @returns {Object} Relative position of the mouse as {x,y}
   */
  getMousePosition(event) {
    const {clientX, clientY} = event;
    const {left, top} = this.svg.getBoundingClientRect();

    return {
      x: clientX - left,
      y: clientY - top,
    };
  }

  handleMouseWheel(event) {
    const {x, y} = this.getMousePosition(event);

    event.preventDefault();

    // event.deltaY returns nagative values for mouse wheel up and positive values for mouse wheel down
    const isZoomOut = Math.sign(event.deltaY) === 1;

    isZoomOut ? this.zoomOut(x, y) : this.zoomIn(x, y);
  }

  handleMouseDown(event) {
    this.coords = {
      x: event.pageX,
      y: event.pageY,
    };

    this.setState({dragging: true});
  }

  handleMousUp(event) {
    if (isDefined(this.draggingHost)) {
      this.state.simulation.alphaTarget(0);

      this.draggingHost.fx = undefined;
      this.draggingHost.fy = undefined;
      this.draggingHost = undefined;
    }

    this.coords = {};
    this.setState({dragging: false});
  }

  handleMousMove(event) {
    if (isDefined(this.draggingHost)) {
      // we are dragging a host circle

      const {x: mx, y: my} = this.getMousePosition(event);
      const {x, y} = this.toChartCoords(mx, my);

      this.draggingHost.fx = x;
      this.draggingHost.fy = y;
      return;
    }

    if (!this.state.dragging) {
      // we aren't dragging anything
      return;
    }

    event.preventDefault();

    const xDiff = this.coords.x - event.pageX;
    const yDiff = this.coords.y - event.pageY;

    this.coords.x = event.pageX;
    this.coords.y = event.pageY;

    this.setState(state => ({
      translateX: state.translateX - xDiff,
      translateY: state.translateY - yDiff,
    }));
  }

  handleHostDragStart(event, host) {
    event.stopPropagation();

    this.state.simulation.alphaTarget(0.3).restart();

    host.fx = host.x;
    host.fy = host.y;

    this.draggingHost = host;
  }

  render() {
    const {width, height, svgRef} = this.props;
    const {
      hosts = [],
      links = [],
      scale,
      translateX,
      translateY,
      dragging,
      hostsCount,
    } = this.state;
    return (
      <Layout flex="column">
        {hostsCount > MAX_HOSTS && (
          <Layout align={['center', 'center']}>
            <p>
              {_(
                'The current number of {{hostsCount}} hosts exceeds the ' +
                  'maximum of {{maxHosts}}. Please apply a more specific ' +
                  'filter.',
                {hostsCount, maxHosts: MAX_HOSTS},
              )}
            </p>
          </Layout>
        )}
        <Svg
          dragging={dragging}
          width={width}
          height={height}
          onWheel={this.handleMouseWheel}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMousUp}
          onMouseMove={this.handleMousMove}
          ref={setRef(ref => (this.svg = ref), svgRef)}
        >
          <Group left={translateX} top={translateY} scale={scale}>
            {links.map(link => {
              return (
                <line
                  key={link.index}
                  stroke={Theme.green}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                />
              );
            })}
            {hosts.map(host => {
              const radius = host.isScanner ? SCANNER_RADIUS : HOST_RADIUS;
              return (
                <React.Fragment key={host.id}>
                  {scale > TEXT_SCALE_THRESHOLD && (
                    <text
                      fontWeight="normal"
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      fontSize="6px"
                      fill={
                        isDefined(host.uuid) ? Theme.black : Theme.lightGray
                      }
                      x={host.x}
                      y={host.y + 1 + radius}
                    >
                      {host.name}
                    </text>
                  )}
                  <Circle
                    r={radius}
                    fill={this.hostFillColor(host)}
                    stroke={this.hostStrokeColor(host)}
                    strokeWidth={
                      host.isScanner
                        ? SCANNER_STROKE_WIDTH
                        : DEFAULT_STROKE_WIDTH
                    }
                    cx={host.x}
                    cy={host.y}
                    onMouseDown={event => this.handleHostDragStart(event, host)}
                  />
                </React.Fragment>
              );
            })}
          </Group>
        </Svg>
      </Layout>
    );
  }
}

const LinkType = PropTypes.shape({
  source: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
});

const HostType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  uuid: PropTypes.id,
  severity: PropTypes.number,
  name: PropTypes.string,
  isScanner: PropTypes.bool,
  links: PropTypes.arrayOf(LinkType).isRequired,
});

HostsTopologyChart.propTypes = {
  data: PropTypes.shape({
    hosts: PropTypes.arrayOf(HostType),
    links: PropTypes.arrayOf(LinkType),
  }).isRequired,
  height: PropTypes.number.isRequired,
  severityClass: PropTypes.severityClass,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
};

export default HostsTopologyChart;

// vim: set ts=2 sw=2 tw=80:
