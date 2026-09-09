/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import BubbleChart from 'web/components/chart/BubbleChart';

const data = [
  {
    color: '#008000',
    label: 'First',
    toolTip: 'First bubble',
    value: 10,
  },
  {
    color: '#0000aa',
    label: 'Second',
    toolTip: 'Second bubble',
    value: 20,
  },
];

describe('BubbleChart', () => {
  test('should render a clear empty state when there is no data', () => {
    const {render} = rendererWith();

    render(<BubbleChart height={300} width={400} />);

    const emptyState = screen.getByTestId('bubble-chart-empty');
    expect(emptyState).toHaveTextContent('No data available');
    expect(emptyState).toHaveAttribute('aria-label', 'No data available');
  });

  test('should render bubble labels and clip paths for each data point', () => {
    const {render} = rendererWith();

    render(<BubbleChart data={data} height={300} width={400} />);

    expect(screen.getByTestId('bubble-chart-content')).toHaveTextContent(
      'First',
    );
    expect(screen.getByTestId('bubble-chart-content')).toHaveTextContent(
      'Second',
    );
    expect(screen.getByTestId('bubble-chart-bubble-0')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-chart-bubble-1')).toBeInTheDocument();
  });

  test('should call onDataClick with the clicked bubble data', () => {
    const onDataClick = testing.fn();
    const {render} = rendererWith();

    render(
      <BubbleChart
        data={data}
        height={300}
        width={400}
        onDataClick={onDataClick}
      />,
    );

    fireEvent.click(screen.getByTestId('bubble-chart-bubble-0'));

    expect(onDataClick).toHaveBeenCalledExactlyOnceWith(data[0]);
  });

  test('should fade other bubbles while hovering a bubble', () => {
    const {render} = rendererWith();

    render(<BubbleChart data={data} height={300} width={400} />);

    const firstBubble = screen.getByTestId('bubble-chart-bubble-0');
    const secondBubble = screen.getByTestId('bubble-chart-bubble-1');
    const firstCircle = firstBubble.querySelector('circle');
    const secondCircle = secondBubble.querySelector('circle');
    fireEvent.mouseEnter(firstBubble);

    expect(firstCircle).toHaveAttribute('opacity', '1');
    expect(screen.getAllByTestId(/bubble-chart-bubble-/).at(-1)).toBe(
      firstBubble,
    );
    expect(secondCircle).toHaveAttribute('opacity', '0.35');
    expect(secondCircle).toHaveAttribute('fill', '#0000aa');

    fireEvent.mouseLeave(firstBubble);

    expect(secondBubble.querySelector('circle')).toHaveAttribute(
      'opacity',
      '1',
    );
  });

  test('should only show one tooltip while moving between bubbles', () => {
    const {render} = rendererWith();

    render(<BubbleChart data={data} height={300} width={400} />);

    const firstBubble = screen.getByTestId('bubble-chart-bubble-0');
    const secondBubble = screen.getByTestId('bubble-chart-bubble-1');

    fireEvent.mouseEnter(firstBubble);
    expect(screen.getAllByText('First bubble')).toHaveLength(1);

    fireEvent.mouseEnter(secondBubble);
    expect(screen.queryByText('First bubble')).not.toBeInTheDocument();
    expect(screen.getAllByText('Second bubble')).toHaveLength(1);

    fireEvent.mouseLeave(secondBubble);
    expect(screen.queryByText('First bubble')).not.toBeInTheDocument();
    expect(screen.queryByText('Second bubble')).not.toBeInTheDocument();
  });
});
