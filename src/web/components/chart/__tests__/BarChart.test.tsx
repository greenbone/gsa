/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import BarChart, {type BarChartDataPoint} from 'web/components/chart/BarChart';

const data: BarChartDataPoint[] = [
  {
    color: '#008000',
    toolTip: 'First bar',
    x: 'one',
    y: 10,
  },
  {
    color: '#0000aa',
    toolTip: 'Second bar',
    x: 'two',
    y: 20,
  },
];

describe('BarChart', () => {
  test('should render a clear empty state when there is no data', () => {
    const {render} = rendererWith();

    render(<BarChart data={[]} height={300} width={900} />);

    expect(screen.getByTestId('bar-chart-empty')).toHaveTextContent(
      'No data available',
    );
  });

  test('should render one bar for each data point and axis labels', () => {
    const {render} = rendererWith();

    render(
      <BarChart
        data={data}
        height={300}
        width={900}
        xLabel="X axis"
        yLabel="Y axis"
      />,
    );

    const container = screen.getByTestId('main-container');
    expect(container.querySelectorAll('rect')).toHaveLength(2);
    expect(container).toHaveTextContent('X axis');
    expect(container).toHaveTextContent('Y axis');
  });

  test('should call onDataClick with the clicked data point', () => {
    const onDataClick = testing.fn();
    const {render} = rendererWith();

    render(
      <BarChart
        data={data}
        height={300}
        width={900}
        onDataClick={onDataClick}
      />,
    );

    const bars = screen.getByTestId('main-container').querySelectorAll('rect');
    fireEvent.click(bars[0]);

    expect(onDataClick).toHaveBeenCalledTimes(1);
    expect(onDataClick).toHaveBeenCalledWith(data[0]);
  });

  test('should fade other bars while hovering a bar', () => {
    const {render} = rendererWith();

    render(<BarChart data={data} height={300} width={900} />);

    const bars = screen.getByTestId('main-container').querySelectorAll('rect');
    fireEvent.mouseEnter(bars[0]);

    expect(bars[0]).toHaveAttribute('fill', '#008000');
    expect(bars[0]).toHaveAttribute('opacity', '1');
    expect(bars[1]).toHaveAttribute('fill', '#0000aa');
    expect(bars[1]).toHaveAttribute('opacity', '0.35');

    fireEvent.mouseLeave(bars[0]);

    expect(bars[1]).toHaveAttribute('opacity', '1');
  });

  test('should render vertical bars', () => {
    const {render} = rendererWith();

    render(
      <BarChart
        data={data}
        height={300}
        width={900}
        xLabel="X axis"
        yLabel="Y axis"
      />,
    );

    const verticalXAxis = screen.getByTestId('bar-chart-x-axis');
    const verticalYAxis = screen.getByTestId('bar-chart-y-axis');

    expect(verticalXAxis.querySelector('.tick text')).toHaveTextContent('one');
    expect(verticalYAxis).toHaveTextContent('10');
  });

  test('should render long categories on the y-axis automatically', () => {
    const crowdedData = Array.from({length: 8}, (_, index) => ({
      color: '#008000',
      x: `Very long category ${index + 1}`,
      y: index + 1,
    }));
    const {render} = rendererWith();

    render(
      <BarChart
        data={crowdedData}
        height={300}
        width={360}
        xLabel="Value"
        yLabel="Category"
      />,
    );

    const xAxis = screen.getByTestId('bar-chart-x-axis');
    const yAxis = screen.getByTestId('bar-chart-y-axis');
    const tickLabel = yAxis.querySelector('.tick text');

    expect(yAxis).toHaveTextContent('Very long category 1');
    expect(yAxis.querySelector('.axis-label')).toHaveTextContent('Category');
    expect(yAxis.querySelector('.axis-label')).toHaveAttribute(
      'transform',
      'translate(-145, 110) rotate(-90)',
    );
    expect(tickLabel).not.toHaveAttribute('transform');
    expect(xAxis).toHaveTextContent('0');
    expect(xAxis).not.toHaveTextContent('Very long category 1');
  });

  test('should replace bars when overcrowding changes the orientation', () => {
    const crowdedData = Array.from({length: 8}, (_, index) => ({
      color: '#008000',
      x: `Very long category ${index + 1}`,
      y: 0,
    }));
    const {render} = rendererWith();
    const rendered = render(<BarChart data={data} height={300} width={900} />);

    rendered.rerender(<BarChart data={crowdedData} height={300} width={360} />);

    const bars = screen.getByTestId('main-container').querySelectorAll('rect');
    expect(bars).toHaveLength(crowdedData.length);
    bars.forEach(bar => expect(bar).toHaveAttribute('x', '1'));
  });

  test('should render horizontal bars', () => {
    const {render} = rendererWith();
    render(<BarChart horizontal data={data} height={300} width={900} />);

    const horizontalXAxis = screen.getByTestId('bar-chart-x-axis');
    const horizontalYAxis = screen.getByTestId('bar-chart-y-axis');

    expect(horizontalXAxis.querySelector('.tick text')).toHaveTextContent('0');
    expect(horizontalYAxis.querySelector('.tick text')).toHaveTextContent(
      'one',
    );
    expect(horizontalXAxis).not.toHaveTextContent('one');
    expect(horizontalYAxis).not.toHaveTextContent('10');
  });
});
