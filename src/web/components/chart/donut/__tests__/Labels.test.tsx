/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Labels from 'web/components/chart/donut/Labels';

const renderLabels = (data: Array<{value: number; toolTip: string}>) => {
  const {render} = rendererWith();
  render(
    <Labels
      centerX={150}
      centerY={150}
      data={data}
      innerRadiusX={20}
      innerRadiusY={20}
      outerRadiusX={100}
      outerRadiusY={100}
    />,
  );
};

describe('Labels', () => {
  test('should render one label for every data value', () => {
    renderLabels([
      {toolTip: 'Large slice', value: 99},
      {toolTip: 'Small slice', value: 1},
    ]);

    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText(/^(99|1)$/)).toHaveLength(2);
  });

  test('should render one external label and leader line for every slice', () => {
    renderLabels([
      {toolTip: 'First slice', value: 50},
      {toolTip: 'Second slice', value: 50},
    ]);

    expect(screen.queryAllByText('50')).toHaveLength(2);
    expect(document.querySelectorAll('polyline')).toHaveLength(2);
    expect(document.querySelectorAll('.pie-label')).toHaveLength(2);
  });

  test('should render no labels for an empty data set', () => {
    renderLabels([]);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('should render external labels with accessible typography', () => {
    renderLabels([
      {color: '#C12C30', toolTip: 'Dark section', value: 50},
      {color: '#F3B865', toolTip: 'Light section', value: 50},
    ]);

    screen.getAllByText('50').forEach(label => {
      expect(label).toHaveAttribute('fill', '#4C4C4C');
      expect(label).toHaveAttribute('font-family', 'Verdana, sans-serif');
      expect(label).toHaveAttribute('font-size', '11px');
      expect(label).toHaveAttribute('font-weight', 'bold');
      expect(label).toHaveAttribute('transform');
      expect(label).not.toHaveAttribute('x');
      expect(label).not.toHaveAttribute('y');
    });
  });
});
