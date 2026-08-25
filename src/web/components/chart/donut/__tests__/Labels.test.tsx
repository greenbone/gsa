/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {pie as d3pie} from 'd3-shape';
import Labels from 'web/components/chart/donut/Labels';

const createArcs = (data: Array<{value: number; toolTip: string}>) =>
  d3pie<{value: number; toolTip: string}>()
    .sortValues(null)
    .value(d => d.value)
    .padAngle(0.03)(data)
    .sort((a, b) => (a.startAngle > b.startAngle ? -1 : 1));

const renderLabels = (data: Array<{value: number; toolTip: string}>) => {
  const {render} = rendererWith();
  render(
    <Labels
      arcs={createArcs(data)}
      centerX={150}
      centerY={150}
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

  test('should keep external labels outside the donut edge', () => {
    renderLabels([{toolTip: 'Single slice', value: 100}]);

    expect(screen.getByText('100')).toHaveAttribute(
      'transform',
      'translate(-115,110)',
    );
  });

  test('should move labels outside the donut when it grows', () => {
    const {render} = rendererWith();
    render(
      <Labels
        arcs={createArcs([{toolTip: 'Single slice', value: 100}])}
        centerX={150}
        centerY={150}
        innerRadiusX={191}
        innerRadiusY={191}
        outerRadiusX={294}
        outerRadiusY={294}
      />,
    );

    expect(screen.getByText('100')).toHaveAttribute(
      'transform',
      'translate(-309,304)',
    );
  });

  test('should render no labels for an empty data set', () => {
    renderLabels([]);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('should render external labels with accessible typography', () => {
    renderLabels([
      {toolTip: 'Dark section', value: 50},
      {toolTip: 'Light section', value: 50},
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
