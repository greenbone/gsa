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
import React from 'react';

import glamorous from 'glamorous';

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceX,
  forceY,
} from 'd3-force';

import {color} from 'd3-color';

import {scaleLinear} from '@vx/scale';

import {is_defined} from 'gmp/utils/index';

import PropTypes from '../../utils/proptypes';
import Theme from '../../utils/theme';
import {getSeverityLevels} from '../../utils/severity';

import Group from './group';

const MAX_HOSTS = 1000;

const SCANNER_RADIUS = 8;
const HOST_RADIUS = 5;

const Svg = glamorous.svg({
  '& text': {
    userSelect: 'none',
  },
}, ({dragging = false}) => ({
  cursor: dragging ? 'grabbing' : 'grab',
}));

const Circle = glamorous.circle({
  cursor: 'pointer',
});

const severity_levels = getSeverityLevels();

const severityColorsGradientScale = scaleLinear({
  domain: [
    -1.0,
    severity_levels.max_log,
    severity_levels.min_low,
    (severity_levels.min_low + severity_levels.max_low) / 2,
    severity_levels.max_low,
    severity_levels.min_medium,
    (severity_levels.min_medium + severity_levels.max_medium) / 2,
    severity_levels.max_medium,
    severity_levels.min_high,
    (severity_levels.min_high + 10.0) / 2,
    10.0,
  ],
  range: [
    'grey',    // False Positive
    'silver',  // Log
    '#b1cee9', // minimum Low
    '#87CEEB', // middle Low
    '#a5e59d', // maximum Low
    '#ffde00', // minimum Medium
    '#FFA500', // middle Medium
    '#f57b00', // maximum Medium
    '#eb5200', // minimum High
    '#D80000', // middle High
    '#ff0000', // maximum High
  ],
});

const hostStrokeColor = host => {
  if (host.isScanner) {
    return Theme.green;
  }
  if (is_defined(host.uuid)) {
    return color(severityColorsGradientScale(host.severity)).darker();
  }
  return Theme.lightGray;
};

const hostFillColor = host => is_defined(host.uuid) ?
  severityColorsGradientScale(host.severity) : Theme.white;

const SCROLL_STEP = 0.1;

const MAX_SCALE = 2;
const MIN_SCALE = 0.1;
const TEXT_SCALE_THRESHOLD = 1;

const DEFAULT_STROKE_WIDTH = 1;
const SCANNER_STROKE_WIDTH = 2;

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

    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMousUp = this.handleMousUp.bind(this);
    this.handleMousMove = this.handleMousMove.bind(this);
  }

  componentDidMount() {
    this.updateData(this.props.data);
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
    const diffX = (x * scale) - px;
    const diffY = (y * scale) - py;

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
    if (is_defined(this.draggingHost)) {
      this.simulation.alphaTarget(0);

      this.draggingHost.fx = undefined;
      this.draggingHost.fy = undefined;
      this.draggingHost = undefined;
    }

    this.coords = {};
    this.setState({dragging: false});
  }

  handleMousMove(event) {
    if (is_defined(this.draggingHost)) {
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

    this.simulation.alphaTarget(0.3).restart();

    host.fx = host.x;
    host.fy = host.y;

    this.draggingHost = host;
  }

  updateData(data) {
    const {width, height} = this.props;
    let {hosts} = data;
    const {links} = data;

    if (hosts.length > MAX_HOSTS) {
      hosts = hosts.slice(0, MAX_HOSTS);
    }

    const linkForce = forceLink(links)
      .id(l => l.id)
      .strength(0.2);

    const gravityXForce = forceX().strength(0.03);
    const gravityYForce = forceY().strength(0.03);

    this.simulation = forceSimulation(hosts)
      .force('link', linkForce)
      .force('charge', forceManyBody().strength(-10))
      .force('center', forceCenter(width / 2, height / 2))
      .force('gravityX', gravityXForce)
      .force('gravityY', gravityYForce)
      .on('tick', () => {
        this.setState({hosts, links});
      });
  }

  render() {
    const {width, height} = this.props;
    const {
      hosts,
      links,
      scale,
      translateX,
      translateY,
      dragging,
    } = this.state;
    return (
      <Svg
        dragging={dragging}
        width={width}
        height={height}
        onWheel={this.handleMouseWheel}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMousUp}
        onMouseMove={this.handleMousMove}
        innerRef={ref => this.svg = ref}
      >
        <Group
          left={translateX}
          top={translateY}
          scale={scale}
        >
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
              <React.Fragment
                key={host.id}
              >
                {scale > TEXT_SCALE_THRESHOLD &&
                  <text
                    fontWeight="normal"
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fontSize="6px"
                    fill={is_defined(host.uuid) ? Theme.black : Theme.lightGray}
                    x={host.x}
                    y={host.y + 1 + radius}
                  >
                    {host.name}
                  </text>
                }
                <Circle
                  r={radius}
                  fill={hostFillColor(host)}
                  stroke={hostStrokeColor(host)}
                  strokeWidth={host.isScanner ?
                    SCANNER_STROKE_WIDTH : DEFAULT_STROKE_WIDTH}
                  cx={host.x}
                  cy={host.y}
                  onMouseDown={event => this.handleHostDragStart(event, host)}
                />
              </React.Fragment>
            );
          })}
        </Group>
      </Svg>
    );
  }
}

const HostType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  uuid: PropTypes.id,
  severity: PropTypes.number,
  name: PropTypes.string,
  isScanner: PropTypes.bool,
});

const LinkType = PropTypes.shape({
  source: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
});

HostsTopologyChart.propTypes = {
  data: PropTypes.shape({
    hosts: PropTypes.arrayOf(HostType),
    links: PropTypes.arrayOf(LinkType),
  }).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default HostsTopologyChart;

// vim: set ts=2 sw=2 tw=80:
