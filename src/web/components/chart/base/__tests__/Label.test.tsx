/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {createRef} from 'react';
import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Label from 'web/components/chart/base/Label';
import Theme from 'web/utils/theme';

describe('Label', () => {
  test('should render children with default label styles', () => {
    const {render} = rendererWith();

    render(<Label>Label text</Label>);

    const label = screen.getByText('Label text');
    expect(label).toHaveClass('pie-label');
    expect(label).toHaveAttribute('dy', '.33em');
    expect(label).toHaveAttribute('fill', Theme.darkGray);
    expect(label).toHaveAttribute('font-family', 'Verdana, sans-serif');
    expect(label).toHaveAttribute('font-size', '11');
    expect(label).toHaveAttribute('font-weight', 'bold');
    expect(label).toHaveAttribute('text-anchor', 'middle');
  });

  test('should forward SVG props and allow overrides', () => {
    const {render} = rendererWith();

    render(
      <Label fill="#008000" x={10} y={20}>
        Label text
      </Label>,
    );

    const label = screen.getByText('Label text');
    expect(label).toHaveAttribute('fill', '#008000');
    expect(label).toHaveAttribute('x', '10');
    expect(label).toHaveAttribute('y', '20');
  });

  test('should forward the ref to the text element', () => {
    const ref = createRef<SVGElement>();
    const {render} = rendererWith();

    render(<Label ref={ref}>Label text</Label>);

    expect(ref.current).toBe(screen.getByText('Label text'));
  });
});
