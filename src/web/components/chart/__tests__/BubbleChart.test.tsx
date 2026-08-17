/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import BubbleChart from 'web/components/chart/BubbleChart';
import Theme from 'web/utils/theme';

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
  test('should render a placeholder circle when there is no data', () => {
    const {render} = rendererWith();

    render(<BubbleChart height={300} width={400} />);

    const emptyBubble = screen.getByTestId('bubble-chart-empty');
    expect(emptyBubble).toHaveAttribute('fill', Theme.lightGray);
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
});
