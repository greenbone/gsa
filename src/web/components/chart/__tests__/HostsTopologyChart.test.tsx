/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, expect, test} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import HostsTopologyChart from 'web/components/chart/HostsTopologyChart';

interface TestHost {
  id: string;
  links: TestLink[];
  name: string;
  x: number;
  y: number;
}

interface TestLink {
  index: number;
  source: TestHost;
  target: TestHost;
}

const createProps = (data = {}) => ({
  data,
  height: 300,
  width: 400,
  svgRef: React.createRef<SVGSVGElement>(),
});

describe('HostsTopologyChart', () => {
  test('should render an empty topology', () => {
    const {render} = rendererWith();

    render(<HostsTopologyChart {...createProps()} />);

    expect(screen.getByTestId('hosts-topology-svg')).toBeInTheDocument();
    expect(screen.getByTestId('hosts-topology-empty')).toHaveTextContent(
      'No data available',
    );
    expect(
      screen.queryByTestId('hosts-topology-host-host-1'),
    ).not.toBeInTheDocument();
  });

  test('should render hosts and links', () => {
    const hostA: TestHost = {
      id: 'host-a',
      links: [],
      name: 'Host A',
      x: 50,
      y: 60,
    };
    const hostB: TestHost = {
      id: 'host-b',
      links: [],
      name: 'Host B',
      x: 150,
      y: 160,
    };
    const link: TestLink = {index: 0, source: hostA, target: hostB};
    hostA.links = [link];
    hostB.links = [link];
    const {render} = rendererWith();

    render(
      <HostsTopologyChart
        {...createProps({hosts: [hostA, hostB], links: [link]})}
      />,
    );

    expect(
      screen.getByTestId('hosts-topology-host-host-a'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('hosts-topology-host-host-b'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('hosts-topology-link-0')).toBeInTheDocument();
  });

  test('should update hosts when the data prop changes', () => {
    const firstHost = {
      id: 'first-host',
      links: [],
      name: 'First host',
      x: 50,
      y: 60,
    };
    const secondHost = {
      id: 'second-host',
      links: [],
      name: 'Second host',
      x: 150,
      y: 160,
    };
    const {render} = rendererWith();
    const rendered = render(
      <HostsTopologyChart {...createProps({hosts: [firstHost], links: []})} />,
    );

    expect(
      screen.getByTestId('hosts-topology-host-first-host'),
    ).toBeInTheDocument();

    rendered.rerender(
      <HostsTopologyChart {...createProps({hosts: [secondHost], links: []})} />,
    );

    expect(
      screen.queryByTestId('hosts-topology-host-first-host'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('hosts-topology-host-second-host'),
    ).toBeInTheDocument();
  });

  test('should zoom in when the mouse wheel scrolls up', () => {
    const {render} = rendererWith();

    render(<HostsTopologyChart {...createProps()} />);

    const svg = screen.getByTestId('hosts-topology-svg');
    fireEvent.wheel(svg, {clientX: 50, clientY: 50, deltaY: -100});

    expect(
      screen.getByTestId('hosts-topology-svg').querySelector('g'),
    ).toHaveAttribute('transform', expect.stringContaining('scale(1.1)'));
  });

  test('should limit zoom in to the maximum scale', () => {
    const {render} = rendererWith();
    render(<HostsTopologyChart {...createProps()} />);

    const svg = screen.getByTestId('hosts-topology-svg');
    for (let index = 0; index < 20; index++) {
      fireEvent.wheel(svg, {clientX: 50, clientY: 50, deltaY: -100});
    }

    expect(
      screen.getByTestId('hosts-topology-svg').querySelector('g'),
    ).toHaveAttribute('transform', expect.stringContaining('scale(2)'));
  });

  test('should limit zoom out to the minimum scale', () => {
    const {render} = rendererWith();
    render(<HostsTopologyChart {...createProps()} />);

    const svg = screen.getByTestId('hosts-topology-svg');
    for (let index = 0; index < 20; index++) {
      fireEvent.wheel(svg, {clientX: 50, clientY: 50, deltaY: 100});
    }

    expect(
      screen.getByTestId('hosts-topology-svg').querySelector('g'),
    ).toHaveAttribute('transform', expect.stringContaining('scale(0.1)'));
  });
});
