/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import LegendLine from 'web/components/chart/base/LegendLine';

describe('LegendLine tests', () => {
  test('should render line with expected attributes', () => {
    const {render} = rendererWith();

    render(
      <LegendLine
        color="#008000"
        dashArray="3 2"
        height={12}
        lineWidth={2}
        width={40}
      />,
    );

    const line = screen.getByTestId('main-container').querySelector('line');
    expect(line).toBeInTheDocument();
    expect(line).toHaveAttribute('stroke', '#008000');
    expect(line).toHaveAttribute('stroke-dasharray', '3 2');
    expect(line).toHaveAttribute('stroke-width', '2');
    expect(line).toHaveAttribute('x1', '0');
    expect(line).toHaveAttribute('x2', '40');
    expect(line).toHaveAttribute('y1', '6');
    expect(line).toHaveAttribute('y2', '6');
  });

  test('should render with default dimensions', () => {
    const {render} = rendererWith();

    render(<LegendLine color="#008000" />);

    const svg = screen.getByTestId('main-container').querySelector('svg');
    expect(svg).toHaveAttribute('height', '15');
    expect(svg).toHaveAttribute('width', '20');
  });
});
