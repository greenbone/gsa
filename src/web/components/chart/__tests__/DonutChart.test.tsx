/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import DonutChart, {type DonutChartData} from 'web/components/chart/DonutChart';

const data: DonutChartData[] = [
  {
    color: '#008000',
    label: 'First',
    toolTip: 'First slice',
    value: 10,
  },
  {
    color: '#0000aa',
    label: 'Second',
    toolTip: 'Second slice',
    value: 20,
  },
];

describe('DonutChart', () => {
  const svgPrototype = SVGElement.prototype as SVGElement & {
    getComputedTextLength: () => number;
  };

  beforeEach(() => {
    // JSDOM does not implement getComputedTextLength, so we need to mock it for our tests
    if (!('getComputedTextLength' in svgPrototype)) {
      Object.defineProperty(svgPrototype, 'getComputedTextLength', {
        configurable: true,
        value: () => 0,
      });
    }
    testing.spyOn(svgPrototype, 'getComputedTextLength').mockReturnValue(10);
  });

  afterEach(() => {
    testing.restoreAllMocks();
  });

  test('should render the empty donut when there is no data', () => {
    const {render} = rendererWith();

    render(<DonutChart height={300} width={400} />);

    expect(screen.getByTestId('donut-chart-svg')).toBeInTheDocument();
    expect(screen.getByTestId('donut-chart-empty')).toHaveTextContent(
      'No data available',
    );
    expect(screen.queryByText('First')).not.toBeInTheDocument();
  });

  test('should render section values and flat arcs', () => {
    const {render} = rendererWith();

    render(<DonutChart data={data} height={300} width={400} />);

    const svg = screen.getByTestId('donut-chart-svg');
    expect(svg).toHaveTextContent('10');
    expect(svg).toHaveTextContent('20');
    expect(svg.querySelectorAll('.pie-label')).toHaveLength(2);
    expect(svg.querySelectorAll('path')).toHaveLength(2);
    expect(screen.queryByTestId('donut-chart-empty')).not.toBeInTheDocument();
  });

  test('should render the legend when enabled', () => {
    const {render} = rendererWith();

    render(<DonutChart data={data} height={300} width={400} />);

    expect(screen.getByText('First')).toBeVisible();
    expect(screen.getByText('Second')).toBeVisible();
  });

  test('should not render the legend when disabled', () => {
    const {render} = rendererWith();

    render(
      <DonutChart data={data} height={300} showLegend={false} width={400} />,
    );

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
  });

  test('should render flat paths by default', () => {
    const {render} = rendererWith();

    render(<DonutChart data={data} height={300} width={400} />);

    expect(
      screen.getByTestId('donut-chart-svg').querySelectorAll('path'),
    ).toHaveLength(2);
  });

  test('should dim other slices and labels while hovering a slice', () => {
    const {render} = rendererWith();

    render(<DonutChart data={data} height={300} width={400} />);

    const svg = screen.getByTestId('donut-chart-svg');
    const arcs = screen.getAllByTestId('arc-2d');
    const firstArc = arcs.find(
      arc => arc.querySelector('path')?.getAttribute('fill') === '#008000',
    );
    const secondArc = arcs.find(
      arc => arc.querySelector('path')?.getAttribute('fill') === '#0000aa',
    );
    expect(firstArc).toBeDefined();
    expect(secondArc).toBeDefined();

    fireEvent.mouseEnter(firstArc as HTMLElement);

    expect(firstArc?.querySelector('path')).toHaveAttribute('fill', '#008000');
    expect(secondArc?.querySelector('path')).toHaveAttribute('fill', '#0000aa');
    expect(secondArc?.querySelector('path')).toHaveAttribute('opacity', '0.35');
    expect(svg.querySelector('text')).toHaveAttribute('fill', '#4C4C4C');
    expect(svg.querySelector('text + text')).toHaveAttribute('fill', '#e5e5e5');

    fireEvent.mouseLeave(firstArc as HTMLElement);

    expect(secondArc?.querySelector('path')).toHaveAttribute('fill', '#0000aa');
    expect(svg.querySelector('text + text')).toHaveAttribute('fill', '#4C4C4C');
  });

  test('should call onDataClick with the clicked slice data', () => {
    const onDataClick = testing.fn();
    const {render} = rendererWith();

    render(
      <DonutChart
        data={data}
        height={300}
        width={400}
        onDataClick={onDataClick}
      />,
    );

    const slice = screen
      .getByTestId('donut-chart-svg')
      .querySelector('path[fill="#008000"]');
    expect(slice).toBeInTheDocument();
    fireEvent.click(slice as SVGPathElement);

    expect(onDataClick).toHaveBeenCalledExactlyOnceWith(data[0]);
  });

  test('should call onLegendItemClick with the selected slice data', () => {
    const onLegendItemClick = testing.fn();
    const {render} = rendererWith();

    render(
      <DonutChart
        data={data}
        height={300}
        width={400}
        onLegendItemClick={onLegendItemClick}
      />,
    );

    fireEvent.click(screen.getByText('First'));

    expect(onLegendItemClick).toHaveBeenCalledExactlyOnceWith(data[0]);
  });
});
