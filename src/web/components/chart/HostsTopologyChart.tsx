/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {color} from 'd3-color';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceX,
  forceY,
  ForceLink,
  Simulation,
} from 'd3-force';
import {scaleLinear, ScaleLinear} from 'd3-scale';
import equal from 'fast-deep-equal';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import {DEFAULT_SEVERITY_RATING, SeverityRating} from 'gmp/utils/severity';
import Group from 'web/components/chart/Group';
import Layout from 'web/components/layout/Layout';
import {setRef} from 'web/utils/Render';
import {
  getSeverityLevelBoundaries,
  FALSE_POSITIVE_VALUE,
} from 'web/utils/severity';
import Theme from 'web/utils/Theme';
import withTranslation from 'web/utils/withTranslation';

export const MAX_HOSTS = 1000;

const SCANNER_RADIUS = 8;
const HOST_RADIUS = 5;

const SCROLL_STEP = 0.1;

const MAX_SCALE = 2;
const MIN_SCALE = 0.1;
const TEXT_SCALE_THRESHOLD = 1;

const DEFAULT_STROKE_WIDTH = 1;
const SCANNER_STROKE_WIDTH = 2;

interface SvgProps {
  $dragging: boolean;
}

interface Link {
  source: Host;
  target: Host;
  index: number;
}

interface Host {
  id: string;
  uuid?: string;
  severity?: number;
  name?: string;
  isScanner?: boolean;
  links: Link[];
  x: number;
  y: number;
  fx?: number;
  fy?: number;
}

interface HostsTopologyChartState {
  hosts: Host[];
  originalHosts?: Host[];
  links: Link[];
  scale: number;
  translateX: number;
  translateY: number;
  dragging: boolean;
  hostsCount: number;
  simulation?: Simulation<Host, Link>;
  linkForce?: ForceLink<Host, Link>;
}

interface HostsTopologyChartData {
  hosts?: Host[];
  links?: Link[];
}

interface HostsTopologyChartProps {
  severityClass?: SeverityRating;
  height: number;
  width: number;
  data: HostsTopologyChartData;
  svgRef: React.Ref<SVGSVGElement>;
  _: (text: string, ...args: unknown[]) => string;
}

const Svg = styled.svg<SvgProps>`
  & text {
    user-select: 'none';
  }
  cursor: ${props => (props.$dragging ? 'grabbing' : 'grab')};
`;

const Circle = styled.circle`
  cursor: pointer;
`;

const severityColorsGradientScale = (
  severityRating: SeverityRating = DEFAULT_SEVERITY_RATING,
) => {
  const boundaries = getSeverityLevelBoundaries(severityRating);
  const domain = [
    FALSE_POSITIVE_VALUE,
    boundaries.maxLog,
    boundaries.minLow,
    (boundaries.minLow + boundaries.maxLow) / 2,
    boundaries.maxLow,
    boundaries.minMedium,
    (boundaries.minMedium + boundaries.maxMedium) / 2,
    boundaries.maxMedium,
    boundaries.minHigh,
    (boundaries.minHigh + boundaries.maxHigh) / 2,
    boundaries.maxHigh,
  ];
  const range = [
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
  ];
  return scaleLinear<string>().domain(domain).range(range);
};

const initSimulation = (
  hosts: Host[],
  links: Link[],
): {
  simulation: Simulation<Host, Link>;
  linkForce: ForceLink<Host, Link>;
} => {
  const linkForce = forceLink<Host, Link>(links)
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
};

const copyArray = <T extends object | undefined>(
  array: Array<T> | undefined,
): T extends object ? Array<T> : undefined =>
  isDefined(array)
    ? (array.map(current => ({
        ...current,
      })) as T extends object ? Array<T> : undefined)
    : (undefined as T extends object ? Array<T> : undefined);

const copyHosts = (hosts: Host[]): Host[] =>
  hosts.map(host => ({
    ...host,
    links: copyArray(host.links),
  }));

class HostsTopologyChart extends React.Component<
  HostsTopologyChartProps,
  HostsTopologyChartState
> {
  colorScale: ScaleLinear<string, string>;
  svg: SVGSVGElement | null = null;
  draggingHost?: Host;
  coords: {x?: number; y?: number} = {x: 0, y: 0};

  constructor(props: HostsTopologyChartProps) {
    super(props);

    this.state = {
      hosts: [],
      links: [],
      scale: 1.0,
      translateX: 0,
      translateY: 0,
      dragging: false,
      hostsCount: 0,
    };

    this.colorScale = severityColorsGradientScale(this.props.severityClass);

    this.hostFillColor = this.hostFillColor.bind(this);
    this.hostStrokeColor = this.hostStrokeColor.bind(this);

    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  static getDerivedStateFromProps(
    nextProps: HostsTopologyChartProps,
    prevState: HostsTopologyChartState,
  ): Partial<HostsTopologyChartState> | null {
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

    if (isDefined(simulation) && isDefined(linkForce)) {
      simulation.nodes(hostsCopy);
      linkForce.links(linksCopy);
    } else {
      const initSim = initSimulation(hostsCopy, linksCopy);
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

  componentDidMount() {
    const {width, height} = this.props;
    const {simulation} = this.state;

    if (isDefined(simulation)) {
      simulation
        .force('center', forceCenter(width / 2, height / 2))
        .on('tick', () => this.forceUpdate())
        .restart();
    }
  }

  componentWillUnmount() {
    const {simulation} = this.state;

    if (isDefined(simulation)) {
      simulation.stop();
      simulation.on('tick', null);
      simulation.on('end', null);
    }
  }

  hostFillColor(host: Host): string {
    return isDefined(host.uuid) && isDefined(host.severity)
      ? this.colorScale(host.severity)
      : Theme.white;
  }

  hostStrokeColor(host: Host): string {
    if (host.isScanner) {
      return Theme.green;
    }
    if (isDefined(host.uuid) && isDefined(host.severity)) {
      const rgbColor = this.colorScale(host.severity);
      const darkerColor = color(rgbColor)?.darker();
      return String(darkerColor) || Theme.lightGray;
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
  zoom(px: number, py: number, scale: number) {
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
  zoomIn(px: number, py: number) {
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
  zoomOut(px: number, py: number) {
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
  toChartCoords(x: number, y: number): {x: number; y: number} {
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
  getMousePosition(event: React.MouseEvent): {x: number; y: number} {
    if (!this.svg) {
      // if svg is not set, which should never happen, return 0,0
      return {x: 0, y: 0};
    }

    const {clientX, clientY} = event;
    const {left, top} = this.svg.getBoundingClientRect();

    return {
      x: clientX - left,
      y: clientY - top,
    };
  }

  handleMouseWheel(event: React.WheelEvent) {
    const {x, y} = this.getMousePosition(event);

    event.preventDefault();

    // event.deltaY returns negative values for mouse wheel up and positive values for mouse wheel down
    const isZoomOut = Math.sign(event.deltaY) === 1;

    if (isZoomOut) {
      this.zoomOut(x, y);
    } else {
      this.zoomIn(x, y);
    }
  }

  handleMouseDown(event: React.MouseEvent) {
    this.coords = {
      x: event.pageX,
      y: event.pageY,
    };

    this.setState({dragging: true});
  }

  handleMouseUp() {
    if (isDefined(this.draggingHost)) {
      if (isDefined(this.state.simulation)) {
        this.state.simulation.alphaTarget(0);
      }

      this.draggingHost.fx = undefined;
      this.draggingHost.fy = undefined;
      this.draggingHost = undefined;
    }

    this.coords = {};
    this.setState({dragging: false});
  }

  handleMouseMove(event: React.MouseEvent) {
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

    // @ts-expect-error
    const xDiff = this.coords.x - event.pageX;
    // @ts-expect-error
    const yDiff = this.coords.y - event.pageY;

    this.coords.x = event.pageX;
    this.coords.y = event.pageY;

    this.setState(state => ({
      translateX: state.translateX - xDiff,
      translateY: state.translateY - yDiff,
    }));
  }

  handleHostDragStart(event: React.MouseEvent, host: Host) {
    event.stopPropagation();

    if (isDefined(this.state.simulation)) {
      this.state.simulation.alphaTarget(0.3).restart();
    }

    host.fx = host.x;
    host.fy = host.y;

    this.draggingHost = host;
  }

  render() {
    const {_} = this.props;

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
          ref={setRef(ref => (this.svg = ref), svgRef)}
          $dragging={dragging}
          height={height}
          width={width}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onWheel={this.handleMouseWheel}
        >
          <Group left={translateX} scale={scale} top={translateY}>
            {links.map(link => {
              return (
                <line
                  key={link.index}
                  stroke={Theme.green}
                  x1={link.source.x}
                  x2={link.target.x}
                  y1={link.source.y}
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
                      dominantBaseline="hanging"
                      fill={
                        isDefined(host.uuid) ? Theme.black : Theme.lightGray
                      }
                      fontSize="6px"
                      fontWeight="normal"
                      textAnchor="middle"
                      x={host.x}
                      y={host.y + 1 + radius}
                    >
                      {host.name}
                    </text>
                  )}
                  <Circle
                    cx={host.x}
                    cy={host.y}
                    fill={this.hostFillColor(host)}
                    r={radius}
                    stroke={this.hostStrokeColor(host)}
                    strokeWidth={
                      host.isScanner
                        ? SCANNER_STROKE_WIDTH
                        : DEFAULT_STROKE_WIDTH
                    }
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

export default withTranslation(HostsTopologyChart);
