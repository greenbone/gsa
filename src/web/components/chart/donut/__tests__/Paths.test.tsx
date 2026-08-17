/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {createRef} from 'react';
import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {
  PieInnerPath,
  PieOuterPath,
  PieTopPath,
} from 'web/components/chart/donut/Paths';

describe('PieTopPath', () => {
  test('should render path data with matching fill and stroke colors', () => {
    const {render} = rendererWith();

    render(<PieTopPath color="#ff0000" path="M 0 0 L 10 10 Z" />);

    const path = screen.getByTestId('main-container').querySelector('path');
    expect(path).toHaveAttribute('d', 'M 0 0 L 10 10 Z');
    expect(path).toHaveAttribute('fill', '#ff0000');
    expect(path).toHaveAttribute('stroke', '#ff0000');
  });
});

describe('PieInnerPath', () => {
  test('should render a filled inner path with custom geometry', () => {
    const {render} = rendererWith();

    render(
      <PieInnerPath
        color="#008000"
        donutHeight={10}
        endAngle={Math.PI}
        innerRadiusX={20}
        innerRadiusY={15}
        startAngle={0}
      />,
    );

    const path = screen.getByTestId('main-container').querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', '#008000');
    expect(path).toHaveAttribute('d', expect.stringContaining('A'));
  });
});

describe('PieOuterPath', () => {
  test('should render a filled outer path with custom geometry and ref', () => {
    const ref = createRef<SVGPathElement>();
    const {render} = rendererWith();

    render(
      <PieOuterPath
        ref={ref}
        color="#0000aa"
        donutHeight={10}
        endAngle={Math.PI}
        outerRadiusX={50}
        outerRadiusY={40}
        startAngle={0}
      />,
    );

    const path = screen.getByTestId('main-container').querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', '#0000aa');
    expect(path).toHaveAttribute('d', expect.stringContaining('A'));
    expect(ref.current).toBe(path);
  });
});
